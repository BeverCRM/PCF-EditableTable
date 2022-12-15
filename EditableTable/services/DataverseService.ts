import { IInputs } from '../generated/ManifestTypes';
import { IComboBoxOption, IDropdownOption, ITag } from '@fluentui/react';
import { Record } from '../store/features/RecordSlice';
import { Relationship } from '../store/features/LookupSlice';
import { getFetchResponse } from '../utils/fetchUtils';

let _context: ComponentFramework.Context<IInputs>;
let _targetEntityType: string;
let _clientUrl: string;

// Remove export statement when we start using the field
export let _userTimeZoneUtcOffsetMinutes: number;

const getEntitySetName = async (entityName: string) => {
  const entityMetadata = await _context.utils.getEntityMetadata(entityName);
  return entityMetadata.EntitySetName;
};

const getReferencingEntityName = async (relationshipSchemaName: string) => {
  const request =
    `${_clientUrl}RelationshipDefinitions?$filter=SchemaName eq '${relationshipSchemaName}'`;
  const result = await getFetchResponse(request);

  return result.value[0].ReferencingEntityNavigationPropertyName;
};

const createNewRecord = async (data: {}): Promise<void> => {
  // @ts-ignore
  const relationshipNameRef = _context.mode._customControlProperties.dynamicData
    .parameters.dataset.previousDataSetDefinition.RelationshipName;
  const relationshipName = relationshipNameRef !== null
    ? await getReferencingEntityName(relationshipNameRef)
    : relationshipNameRef;
  // @ts-ignore
  const parentEntityId = _context.mode.contextInfo.entityId;
  // @ts-ignore
  const parentEntityName = _context.mode.contextInfo.entityTypeName;

  const entitySetName = await getEntitySetName(parentEntityName);
  // create relation to an entity for related grid records
  if (relationshipName !== null && parentEntityName !== null && entitySetName !== null) {
    data = {
      ...data,
      [`${relationshipName}@odata.bind`]: `/${entitySetName}(${parentEntityId})`,
    };
  }
  await _context.webAPI.createRecord(_targetEntityType, data);
};

const retrieveAllRecords = async (entityName: string, options: string) => {
  const entities = [];
  let result = await _context.webAPI.retrieveMultipleRecords(entityName, options);
  entities.push(...result.entities);
  while (result.nextLink !== undefined) {
    options = result.nextLink.slice(result.nextLink.indexOf('?'));
    result = await _context.webAPI.retrieveMultipleRecords(entityName, options);
    entities.push(...result.entities);
  }
  return entities;
};

export default {
  setContext(context: ComponentFramework.Context<IInputs>) {
    _context = context;
    _targetEntityType = context.parameters.dataset.getTargetEntityType();

    // @ts-ignore
    _clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
    // @ts-ignore
    _userTimeZoneUtcOffsetMinutes = _context.client.userTimeZoneUtcOffsetMinutes;
  },

  async deleteRecord(recordId: string): Promise<void> {
    try {
      await _context.webAPI.deleteRecord(_targetEntityType, recordId);
    }
    catch (e) {
      console.log(e);
    }
  },

  async openRecordDeleteDialog(): Promise<ComponentFramework.NavigationApi.ConfirmDialogResponse> {
    const entityMetadata = await _context.utils.getEntityMetadata(_targetEntityType);
    const confirmStrings = {
      text: `Do you want to delete this ${entityMetadata._displayName}?
             You can't undo this action.`,
      title: 'Confirm Deletion',
    };
    const confirmOptions = { height: 200, width: 450 };
    const response = await _context.navigation.openConfirmDialog(confirmStrings, confirmOptions);

    return response;
  },

  async saveRecord(record: Record): Promise<void> {
    const data = record.data.reduce((obj, recordData) =>
      Object.assign(obj, recordData.fieldType === 'lookup'
        ? { [`${recordData.fieldName}@odata.bind`]: recordData.newValue }
        : { [recordData.fieldName]: recordData.newValue }), {});
    if (record.id.length < 15) {
      await createNewRecord(data);
    }
    else {
      await _context.webAPI.updateRecord(_targetEntityType, record.id, data);
    }
  },

  async getLookupOptions(entityName: string) {
    const metadata = await _context.utils.getEntityMetadata(entityName);
    const entityNameFieldName = metadata.PrimaryNameAttribute;
    const entityIdFieldName = metadata.PrimaryIdAttribute;

    const fetchedOptions = await retrieveAllRecords(entityName,
      `?$select=${entityIdFieldName},${entityNameFieldName}`);

    const options: ITag[] = fetchedOptions.map(option => ({
      key: option[entityIdFieldName],
      name: option[entityNameFieldName],
    }));

    return options;
  },

  async getDropdownOptions(fieldName: string, attributeType: string, isTwoOptions: boolean) {
    // eslint-disable-next-line max-len
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=LogicalName&$filter=LogicalName eq '${fieldName}'&$expand=OptionSet`;
    const options: IDropdownOption[] = [];
    const results = await getFetchResponse(request);
    if (!isTwoOptions) {
      for (let i = 0; i < results.value[0].OptionSet.Options.length; i++) {
        const key = results.value[0].OptionSet.Options[i].Value;
        const text = results.value[0].OptionSet.Options[i].Label.UserLocalizedLabel.Label;
        options.push({ key, text });
      }
    }
    else {
      const trueKey = results.value[0].OptionSet.TrueOption.Value;
      const trueText = results.value[0].OptionSet.TrueOption.Label.UserLocalizedLabel.Label;
      options.push({ key: trueKey, text: trueText });
      const falseKey = results.value[0].OptionSet.FalseOption.Value;
      const falseText = results.value[0].OptionSet.FalseOption.Label.UserLocalizedLabel.Label;
      options.push({ key: falseKey, text: falseText });
    }
    return { fieldName, options };
  },

  async getNumberFieldMetadata(fieldName: string, attributeType: string, selection: string) {
    // eslint-disable-next-line max-len
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=${selection}&$filter=LogicalName eq '${fieldName}'`;
    const results = await getFetchResponse(request);

    return {
      fieldName,
      precision: results.value[0]?.PrecisionSource ?? results.value[0]?.Precision,
      minValue: results.value[0].MinValue,
      maxValue: results.value[0].MaxValue,
    };
  },

  async getCurrencySymbol(recordId: string): Promise<string> {
    const fetchedCurrency = await _context.webAPI.retrieveRecord(
      _targetEntityType,
      recordId,
      '?$select=_transactioncurrencyid_value&$expand=transactioncurrencyid($select=currencysymbol)',
    );

    return fetchedCurrency.transactioncurrencyid.currencysymbol;
  },

  async getRelationships(): Promise<Relationship[]> {
    // et relationships: Relationship[] = [];
    // eslint-disable-next-line max-len
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')?$expand=ManyToManyRelationships,ManyToOneRelationships,OneToManyRelationships`;
    const results = await getFetchResponse(request);

    return [
      ...results.OneToManyRelationships.map((relationship : any) => <Relationship>{
        fieldNameRef: relationship.ReferencingAttribute,
        entityNameRef: relationship.ReferencedEntity,
        entityNavigation: relationship.ReferencingEntityNavigationPropertyName,
      },
      ),
      ...results.ManyToOneRelationships.map((relationship:any) => <Relationship>{
        fieldNameRef: relationship.ReferencingAttribute,
        entityNameRef: relationship.ReferencedEntity,
        entityNavigation: relationship.ReferencingEntityNavigationPropertyName,
      },
      ),
      ...results.ManyToManyRelationships.map((relationship:any) => <Relationship>{
        fieldNameRef: relationship.ReferencingAttribute,
        entityNameRef: relationship.ReferencedEntity,
      },
      ),
    ];
  },

  async getTimeZones() {
    const request = `${_clientUrl}timezonedefinitions`;
    const results = await getFetchResponse(request);

    return results.value.map((timezone: any) => <IComboBoxOption>{
      key: timezone.timezonecode,
      text: timezone.userinterfacename,
    });
  },

  async getLanguages() {
    const localeLanguageCodes = await _context.webAPI.retrieveMultipleRecords('languagelocale');
    const request = `${_clientUrl}RetrieveProvisionedLanguages`;
    const results = await getFetchResponse(request);

    return results.RetrieveProvisionedLanguages.map((language: any) => <IComboBoxOption>{
      key: language,
      text: localeLanguageCodes.entities.find(lang => lang.localeid === language)?.name,
    });
  },

  async getDateMetadata(fieldName: string) {
    // eslint-disable-next-line max-len
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.DateTimeAttributeMetadata?$filter=LogicalName eq '${fieldName}'`;
    const results = await getFetchResponse(request);

    return results.value[0].DateTimeBehavior.Value;
  },

  getColumns() {
    // @ts-ignore
    // eslint-disable-next-line max-len
    return _context.mode._customControlProperties.dynamicData.parameters.dataset.columnsForEmptyDataset;
  },

  async getEntityPluralName(entityName: string): Promise<string> {
    const metadata = await _context.utils.getEntityMetadata(entityName);
    return metadata.EntitySetName;
  },
};
