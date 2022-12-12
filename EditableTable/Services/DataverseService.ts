import { IInputs } from '../generated/ManifestTypes';
import { IComboBoxOption, IDropdownOption, ITag } from '@fluentui/react';
import { Record } from '../Models/Record';
import { Relationship } from '../Store/Features/LookupSlice';

export let _context: ComponentFramework.Context<IInputs>;
export let _targetEntityType: string;
// export let _entityMetadata: ComponentFramework.PropertyHelper.EntityMetadata;
export let entityIdFieldName: string;
export let entityNameFieldName: string;
export let _clientUrl: string;
// type Entity = ComponentFramework.WebApi.Entity;

export default {
  setContext(context: ComponentFramework.Context<IInputs>) {
    _context = context;
    _targetEntityType = context.parameters.dataset.getTargetEntityType();
    // _entityMetadata = context.utils.getEntityMetadata(_targetEntityType);
    //@ts-ignore
    _clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
  },

  async getTargetEntityDisplayName() {
    const entityMetadata = await _context.utils.getEntityMetadata(_targetEntityType);
    const targetEntityDisplayName = entityMetadata._displayName;
    return targetEntityDisplayName;
  },

  async getEntitySetName(entityTypeName: string) {
    const entityMetadata = await _context.utils.getEntityMetadata(entityTypeName);
    return entityMetadata.EntitySetName;
  },

  openRecordCreateForm(): void {
    const entityFormOptions = {
      entityName: _targetEntityType,
    };
    _context.navigation.openForm(entityFormOptions).then(
      (success: any) => {
        console.log(success);
      },
      (error: any) => {
        console.log(error);
      });
  },

  async getResponse(request: string) {
    const response = await fetch(request);
    const results = await response.json();
    return results;
  },

  async getRelationshipName(schemaName: string) {
    const request = `${_clientUrl}RelationshipDefinitions?$filter=SchemaName eq '${schemaName}'`;
    const result = await this.getResponse(request);
        
    return result.value[0].ReferencingEntityNavigationPropertyName;
  },

  async createNewRecord(data: {}): Promise<void> {
    console.log(data);
    //@ts-ignore
    const relationshipNameRef = _context.mode._customControlProperties.dynamicData.parameters.dataset.previousDataSetDefinition.RelationshipName;
    const relationshipName = relationshipNameRef !== null ? await this.getRelationshipName(relationshipNameRef) : relationshipNameRef;
    //@ts-ignore
    const parentEntityId = _context.mode.contextInfo.entityId;
    //@ts-ignore
    const parentEntityName = _context.mode.contextInfo.entityTypeName;

    this.getEntitySetName(parentEntityName).then(entitySetName => {
      //create relation to an entity for related grid records
      if( relationshipName !== null && parentEntityName !== null && entitySetName !== null ) {
        data = Object.assign({
          [`${relationshipName}@odata.bind`] : `/${entitySetName}(${parentEntityId})`
        }, data);
        console.log(data);
      }
      _context.webAPI.createRecord(_targetEntityType, data).then( (success: any) => {
        console.log(success); 
        _context.parameters.dataset.refresh();
      },
      (error: any) => {
        console.log(error);
      });
    });
  },

  async deleteSelectedRecords(recordId: string): Promise<void> {
    try {
      await _context.webAPI.deleteRecord(_targetEntityType, recordId);
    }
    catch (e) {
      console.log(e);
    }
  },

  async openRecordDeleteDialog(): Promise<ComponentFramework.NavigationApi.ConfirmDialogResponse> {
    const entityMetadata = await _context.utils.getEntityMetadata(_targetEntityType);
    const confirmStrings = { text: `Do you want to delete this ${entityMetadata._displayName}?
     You can't undo this action.`, title: 'Confirm Deletion' };
    const confirmOptions = { height: 200, width: 450 };
    let response = await _context.navigation.openConfirmDialog(confirmStrings, confirmOptions);
    
    return response;
  },

  async saveRecords(record: Record): Promise<void> {
    //change to await 
    // only creates one record or adds one more
    
    const data = record.data.reduce((obj, recordData) =>
      Object.assign(obj, recordData.fieldType === 'lookup'
      ? { [`${recordData.fieldName}@odata.bind`]: recordData.newValue }
      : { [recordData.fieldName]: recordData.newValue }), {});
    if(record.id.length < 15 ) {
      this.createNewRecord(data);
    } 
    else {
      await _context.webAPI.updateRecord(_targetEntityType, record.id, data);
      _context.parameters.dataset.refresh();
    }
  },

  // saveRecords(changedRecords: Record[]): void {
  //   //change to await 
  //   // only creates one record or adds one more
    
  //   changedRecords.forEach(record => {
  //     const data = record.data.reduce((obj, recordData) =>
  //     Object.assign(obj, recordData.fieldType === 'lookup'
  //     ? { [`${recordData.fieldName}@odata.bind`]: recordData.newValue }
  //     : { [recordData.fieldName]: recordData.newValue }), {});
  //     if(record.id === '0') {
  //       this.createNewRecord(data);
  //     } 
  //     else {
  //       _context.webAPI.updateRecord(_targetEntityType, record.id, data).then(
  //         (success: any) => {
  //           console.log(success);
  //           _context.parameters.dataset.refresh();
  //         },
  //         (error: any) => {
  //           console.log(error);
  //         });
  //     }
  //   });
  // },

  onCalloutItemInvoked(item: any): void {
    const entityFormOptions = {
      entityName: 'annotation',
      entityId: item.key,
    };

    _context.navigation.openForm(entityFormOptions).then(
      (success: any) => {
        console.log(success);
      },
      (error: any) => {
        console.log(error);
      });
  },

  async getLookupOptions(entityName: string, entityIdFieldName: string, entityNameFieldName: string) {
    const fetchedOptions = await _context.webAPI.retrieveMultipleRecords(entityName, `?$select=${entityIdFieldName},${entityNameFieldName}`);
    const options: ITag[] = [];
    if(fetchedOptions.entities.length > 0) {
      fetchedOptions.entities.forEach(option => {
        const name = option[entityNameFieldName];
        const key = option[entityIdFieldName];
        options.push({ key, name });
      })
    }
    return options;
  },

  async getDropdownOptions(fieldName: string, attributeType: string, isTwoOptions: boolean ) {
    console.log("Target Entity type", _targetEntityType);
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=LogicalName&$filter=LogicalName eq '${fieldName}'&$expand=OptionSet`;
    const options: IDropdownOption[] = [];
    const results = await this.getResponse(request);
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
    return options;
  },

  async getNumber(fieldName: string, attributeType: string, selection: string ) {
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=${selection}&$filter=LogicalName eq '${fieldName}'`;
    let number = { precision: 0, minValue: 0, maxValue: 0 };
    const results = await this.getResponse(request);
    console.log(results);
    const precision = results.value[0]?.PrecisionSource
      ? results.value[0]?.PrecisionSource : results.value[0]?.Precision;
    const minValue = results.value[0].MinValue;
    const maxValue = results.value[0].MaxValue;
    number = { precision, minValue, maxValue };

    return number;
  },

  async getCurrencySymbol(recordId: string): Promise<string> {
    console.log(recordId);

    const fetchedCurrency = await _context.webAPI.retrieveRecord(_targetEntityType, recordId, '?$select=_transactioncurrencyid_value&$expand=transactioncurrencyid($select=currencysymbol)');
    console.log(fetchedCurrency);

    return fetchedCurrency.transactioncurrencyid.currencysymbol;
  },

  async getRelationships() {
    const relationships: Relationship[] = [];
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')?$expand=ManyToManyRelationships,ManyToOneRelationships,OneToManyRelationships`;
    const results = await this.getResponse(request);

    for (let i = 0; i < results.OneToManyRelationships?.length; i++) {
      const rels = results.OneToManyRelationships;
      const entityNameRef = rels[i].ReferencedEntity;
      const fieldNameRef = rels[i].ReferencingAttribute;
      const entityNavigation = rels[i].ReferencingEntityNavigationPropertyName;
      relationships.push({ fieldNameRef, entityNameRef, entityNavigation });
    }
    for (let i = 0; i < results.ManyToOneRelationships?.length; i++) {
      const rels = results.ManyToOneRelationships;
      const entityNameRef = rels[i].ReferencedEntity;
      const fieldNameRef = rels[i].ReferencingAttribute;
      const entityNavigation = rels[i].ReferencingEntityNavigationPropertyName;
      relationships.push({ fieldNameRef, entityNameRef, entityNavigation });
    }
    for (let i = 0; i < results.ManyToManyRelationships?.length; i++) {
      const rels = results.ManyToManyRelationships;
      const entityNameRef = rels[i].ReferencedEntity;
      const fieldNameRef = rels[i].ReferencingAttribute;
      relationships.push({ fieldNameRef, entityNameRef });
    }

    return relationships;
  },

  async getTimeZones() {
    const request = `${_clientUrl}timezonedefinitions`;
    const results = await this.getResponse(request);
   
    const timezoneList : IComboBoxOption[] = [];

    for (let i = 0; i < results.value.length; i++) {
      const timezoneCode = results.value[i].timezonecode;
      const timezoneName = results.value[i].userinterfacename;
      timezoneList.push({ key: timezoneCode, text: timezoneName });
    }
       
    return timezoneList;
  },

  async getLanguages() {
    const localeLanguageCodes = await _context.webAPI.retrieveMultipleRecords('languagelocale');
    const request = `${_clientUrl}RetrieveProvisionedLanguages`;
    const results = await this.getResponse(request);
    
    const languages : IComboBoxOption[] = [];

    for (let i = 0; i < results.RetrieveProvisionedLanguages.length; i++) {
      const key = results.RetrieveProvisionedLanguages[i];
      const language = localeLanguageCodes.entities.find(lang => lang.localeid === key);
      languages.push({ key, text: language?.name });
    }
       
    return languages;
  },

  async getDateMetadata(fieldName: string) {
    const request = `${_clientUrl}EntityDefinitions(LogicalName='${_targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.DateTimeAttributeMetadata?$filter=LogicalName eq '${fieldName}'`;
    const results = await this.getResponse(request);
    
    return results.value[0].DateTimeBehavior.Value;
  },

  formatTime(inputDateValue: any) {
    return _context.formatting.formatTime(inputDateValue, 3);
  },

  getColumns() {
    //@ts-ignore
    return _context.mode._customControlProperties.dynamicData.parameters.dataset.columnsForEmptyDataset;
  }, 

  getEntityTypeName() {
    //@ts-ignore
    return _context.mode._customControlProperties.dynamicData.parameters.dataset.contextToken.parentContextToken.entityTypeName
  }

};
