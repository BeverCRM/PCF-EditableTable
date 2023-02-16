import { IInputs } from '../generated/ManifestTypes';
import { IComboBoxOption, IDropdownOption, ITag } from '@fluentui/react';
import { Record } from '../store/features/RecordSlice';
import { Relationship } from '../store/features/LookupSlice';
import { getFetchResponse } from '../utils/fetchUtils';

let _context: ComponentFramework.Context<IInputs>;
let _targetEntityType: string;
let _clientUrl: string;

export const setContext = (context: ComponentFramework.Context<IInputs>) => {
  _context = context;
  _targetEntityType = context.parameters.dataset.getTargetEntityType();

  // @ts-ignore
  _clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
};

export const openForm = (id: string, entityName?: string) => {
  console.log(id);
  const options = {
    entityId: id,
    entityName: entityName ?? _targetEntityType,
    openInNewWindow: false,
  };
  _context.navigation.openForm(options);
};

const createNewRecord = async (data: {}): Promise<void> => {
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

export const deleteRecord = async (recordId: string): Promise<void> => {
  try {
    await _context.webAPI.deleteRecord(_targetEntityType, recordId);
  }
  catch (e) {
    console.log(e);
  }
};

export const openRecordDeleteDialog =
  async (): Promise<ComponentFramework.NavigationApi.ConfirmDialogResponse> => {
    const entityMetadata = await _context.utils.getEntityMetadata(_targetEntityType);
    const confirmStrings = {
      text: `Do you want to delete selected ${entityMetadata._displayName}?
            You can't undo this action.`,
      title: 'Confirm Deletion',
    };
    const confirmOptions = { height: 200, width: 450 };
    const response = await _context.navigation.openConfirmDialog(confirmStrings, confirmOptions);

    return response;
  };

export const openErrorDialog = (error: any): Promise<void> => {
  const errorDialogOptions: ComponentFramework.NavigationApi.ErrorDialogOptions = {
    errorCode: error.code,
    message: error.message,
    details: error.raw,
  };

  return _context.navigation.openErrorDialog(errorDialogOptions);
};

export const saveRecord = async (record: Record): Promise<void> => {
  const data = record.data.reduce((obj, recordData) =>
    Object.assign(obj, recordData.fieldType === 'Lookup.Simple'
      ? { [`${recordData.fieldName}@odata.bind`]: recordData.newValue }
      : { [recordData.fieldName]: recordData.newValue }), {});
  if (record.id.length < 15) {
    await createNewRecord(data);
  }
  else {
    await _context.webAPI.updateRecord(_targetEntityType, record.id, data);
  }
};

export const getRelationships = async (): Promise<Relationship[]> => {
  // eslint-disable-next-line max-len
  const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')?$expand=ManyToManyRelationships,ManyToOneRelationships,OneToManyRelationships`;
  const results = await getFetchResponse(request);

  return [
    ...results.OneToManyRelationships.map((relationship: any) => <Relationship>{
      fieldNameRef: relationship.ReferencingAttribute,
      entityNameRef: relationship.ReferencedEntity,
      entityNavigation: relationship.ReferencingEntityNavigationPropertyName,
    },
    ),
    ...results.ManyToOneRelationships.map((relationship: any) => <Relationship>{
      fieldNameRef: relationship.ReferencingAttribute,
      entityNameRef: relationship.ReferencedEntity,
      entityNavigation: relationship.ReferencingEntityNavigationPropertyName,
    },
    ),
    ...results.ManyToManyRelationships.map((relationship: any) => <Relationship>{
      fieldNameRef: relationship.ReferencingAttribute,
      entityNameRef: relationship.ReferencedEntity,
    },
    ),
  ];
};

export const getLookupOptions = async (entityName: string) => {
  const metadata = await _context.utils.getEntityMetadata(entityName);
  const entityNameFieldName = metadata.PrimaryNameAttribute;
  const entityIdFieldName = metadata.PrimaryIdAttribute;

  const fetchedOptions = await retrieveAllRecords(entityName,
    `?$select=${entityIdFieldName},${entityNameFieldName}`);

  const options: ITag[] = fetchedOptions.map(option => ({
    key: option[entityIdFieldName],
    name: option[entityNameFieldName] ?? '(No Name)',
  }));

  return options;
};

export const getDropdownOptions =
  async (fieldName: string, attributeType: string, isTwoOptions: boolean) => {
    // eslint-disable-next-line max-len
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=LogicalName&$filter=LogicalName eq '${fieldName}'&$expand=OptionSet`;
    let options: IDropdownOption[] = [];
    const results = await getFetchResponse(request);
    if (!isTwoOptions) {
      options = results.value[0].OptionSet.Options.map((result: any) => ({
        key: result.Value.toString(),
        text: result.Label.UserLocalizedLabel.Label,
      }));
    }
    else {
      const trueKey = results.value[0].OptionSet.TrueOption.Value.toString();
      const trueText = results.value[0].OptionSet.TrueOption.Label.UserLocalizedLabel.Label;
      options.push({ key: trueKey, text: trueText });

      const falseKey = results.value[0].OptionSet.FalseOption.Value.toString();
      const falseText = results.value[0].OptionSet.FalseOption.Label.UserLocalizedLabel.Label;
      options.push({ key: falseKey, text: falseText });
    }
    return { fieldName, options };
  };

export const getEntityPluralName = async (entityName: string): Promise<string> => {
  const metadata = await _context.utils.getEntityMetadata(entityName);
  return metadata.EntitySetName;
};

export const getNumberFieldMetadata =
  async (fieldName: string, attributeType: string, selection: string) => {
    // eslint-disable-next-line max-len
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=${selection}&$filter=LogicalName eq '${fieldName}'`;
    const results = await getFetchResponse(request);

    return {
      fieldName,
      precision: results.value[0]?.PrecisionSource ?? results.value[0]?.Precision ?? 0,
      minValue: results.value[0].MinValue,
      maxValue: results.value[0].MaxValue,
    };
  };

export const getCurrencySymbol = async (recordId: string): Promise<string> => {
  const fetchedCurrency = await _context.webAPI.retrieveRecord(
    _targetEntityType,
    recordId,
    '?$select=_transactioncurrencyid_value&$expand=transactioncurrencyid($select=currencysymbol)',
  );

  return fetchedCurrency.transactioncurrencyid?.currencysymbol ||
    _context.userSettings.numberFormattingInfo.currencySymbol;
};

export const getTimeZoneDefinitions = async () => {
  const request = `${_clientUrl}timezonedefinitions`;
  const results = await getFetchResponse(request);

  return results.value.map((timezone: any) => <IComboBoxOption>{
    key: timezone.timezonecode.toString(),
    text: timezone.userinterfacename,
  });
};

export const getProvisionedLanguages = async () => {
  const request = `${_clientUrl}RetrieveProvisionedLanguages`;
  const results = await getFetchResponse(request);
  console.log();

  return results.RetrieveProvisionedLanguages.map((language: any) => <IComboBoxOption>{
    key: language.toString(),
    text: _context.formatting.formatLanguage(language),
  });
};

export const getDateMetadata = async (fieldName: string) => {
  // eslint-disable-next-line max-len
  const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.DateTimeAttributeMetadata?$filter=LogicalName eq '${fieldName}'`;
  const results = await getFetchResponse(request);

  return results.value[0].DateTimeBehavior.Value;
};

export const getTargetEntityType = () => _targetEntityType;

export const getContext = () => _context;

// @ts-ignore
export const getParentMetadata = () => _context.mode.contextInfo;

export const getAllocatedWidth = () => _context.mode.allocatedWidth;
