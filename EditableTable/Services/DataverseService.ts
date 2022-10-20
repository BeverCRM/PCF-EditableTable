import { IInputs } from '../generated/ManifestTypes';
import { IComboBoxOption } from '@fluentui/react';
import { Record } from '../Utils/RecordModel';

export let _context: ComponentFramework.Context<IInputs>;
export let _targetEntityType: string;
export let _entityMetadata: ComponentFramework.PropertyHelper.EntityMetadata;
export let entityIdFieldName: string;
export let entityNameFieldName: string;
// type Entity = ComponentFramework.WebApi.Entity;

export default {
  setContext(context: ComponentFramework.Context<IInputs>,
    targetEntityType: string,
    entityMetadata: ComponentFramework.PropertyHelper.EntityMetadata) {
    _context = context;
    _targetEntityType = targetEntityType;
    _entityMetadata = entityMetadata;
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

  async deleteSelectedNotes(noteIds: string[]): Promise<void> {
    try {
      for (const id of noteIds) {
        await _context.webAPI.deleteRecord('annotation', id);
      }
    }
    catch (e) {
      console.log(e);
    }
  },

  deleteSelectedRecords(recordIds: string[]): void {
    const targetEntityType: string = _context.parameters.dataset.getTargetEntityType();
    try {
      for (const id of recordIds) {
        _context.webAPI.deleteRecord(targetEntityType, id);
      }
    }
    catch (e) {
      console.log(e);
    }
  },

  async openRecordDeleteDialog(selectedRecordIds: string[]): Promise<void> {
    const entityMetadata = await _context.utils.getEntityMetadata(_targetEntityType);

    const confirmStrings = { text: `Do you want to delete this ${entityMetadata._displayName}?
     You can't undo this action.`, title: 'Confirm Deletion' };
    const confirmOptions = { height: 200, width: 450 };
    _context.navigation.openConfirmDialog(confirmStrings, confirmOptions).then(
      success => {
        if (success.confirmed) {
          this.deleteSelectedRecords(selectedRecordIds);
          console.log('Dialog closed using OK button.');
        }
        else {
          console.log('Dialog closed using Cancel button or X.');
        }
      });
  },

  saveRecords(changedRecords: Record[]): void {
    changedRecords.forEach(record => {
      const data = record.data.reduce((obj, recordData) =>
        Object.assign(obj, recordData.fieldType === 'lookup'
          ? { [`${recordData.fieldName}@odata.bind`]: recordData.newValue }
          : { [recordData.fieldName]: recordData.newValue }), {});

      _context.webAPI.updateRecord(_targetEntityType, record.id, data).then(
        (success: any) => {
          console.log(success);
          _context.parameters.dataset.refresh();
        },
        (error: any) => {
          console.log(error);
        });
    });
  },

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

  getRelationships(entityName: string) {
    const relationships: Array<{fieldNameRef: string, entityNameRef: string}> = [];
    // const relReq = `https://beversandbox.crm4.dynamics.com/api/data/v8.2/RelationshipDefinitions?`;
    // @ts-ignore
    const clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
    // eslint-disable-next-line max-len
    const relReq = `${clientUrl}EntityDefinitions(LogicalName='${entityName}')?$expand=ManyToManyRelationships,ManyToOneRelationships,OneToManyRelationships`;
    const req = new XMLHttpRequest();
    req.open('GET', relReq, false);
    req.setRequestHeader('OData-MaxVersion', '4.0');
    req.setRequestHeader('OData-Version', '4.0');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
    req.onreadystatechange = function() {
      if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 200) {
          const results = JSON.parse(this.response);
          for (let i = 0; i < results.OneToManyRelationships?.length; i++) {
            const rels = results.OneToManyRelationships;
            const entityNameRef = rels[i].ReferencedEntity;
            const fieldNameRef = rels[i].ReferencingAttribute;
            relationships.push({ fieldNameRef, entityNameRef });
          }
          for (let i = 0; i < results.ManyToOneRelationships?.length; i++) {
            const rels = results.ManyToOneRelationships;
            const entityNameRef = rels[i].ReferencedEntity;
            const fieldNameRef = rels[i].ReferencingAttribute;
            relationships.push({ fieldNameRef, entityNameRef });
          }
          for (let i = 0; i < results.ManyToManyRelationships?.length; i++) {
            const rels = results.ManyToManyRelationships;
            const entityNameRef = rels[i].ReferencedEntity;
            const fieldNameRef = rels[i].ReferencingAttribute;
            relationships.push({ fieldNameRef, entityNameRef });
          }
        }
        else {
          const { error } = JSON.parse(this.response);
          console.log(error.message);
        }
      }
    };
    req.send();
    return relationships;
  },

  getTimeZones() {
    // @ts-ignore
    const clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
    const request = `${clientUrl}timezonedefinitions`;
    const timezoneList : IComboBoxOption[] = [];
    const req = new XMLHttpRequest();
    req.open('GET', request, false);
    req.setRequestHeader('OData-MaxVersion', '4.0');
    req.setRequestHeader('OData-Version', '4.0');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
    req.onreadystatechange = function() {
      if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 200) {
          const results = JSON.parse(this.response);
          for (let i = 0; i < results.value.length; i++) {
            const timezoneCode = results.value[i].timezonecode;
            const timezoneName = results.value[i].userinterfacename;
            timezoneList.push({ key: timezoneCode, text: timezoneName });
          }
        }
        else {
          console.log(this.statusText);
        }
      }
    };
    req.send();
    return timezoneList;
  },

  async getLanguages() {
    const res = await _context.webAPI.retrieveMultipleRecords('languagelocale');
    // @ts-ignore
    const clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
    const request = `${clientUrl}RetrieveProvisionedLanguages`;
    const languages : IComboBoxOption[] = [];
    const req = new XMLHttpRequest();
    req.open('GET', request, false);
    req.setRequestHeader('OData-MaxVersion', '4.0');
    req.setRequestHeader('OData-Version', '4.0');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
    req.onreadystatechange = function() {
      if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 200) {
          const results = JSON.parse(this.response);
          for (let i = 0; i < results.RetrieveProvisionedLanguages.length; i++) {
            const key = results.RetrieveProvisionedLanguages[i];
            const language = res.entities.find(lang => lang.localeid === key);
            languages.push({ key, text: language?.name });
          }
        }
        else {
          console.log(this.statusText);
        }
      }
    };
    req.send();
    return languages;
  },

  getDateMetadata(entityName: string, fieldName: string) {
    let dateBehavior = '';
    // @ts-ignore
    const clientUrl = `${_context.page.getClientUrl()}/api/data/v9.2/`;
    // eslint-disable-next-line max-len
    const request = `${clientUrl}EntityDefinitions(LogicalName='${entityName}')/Attributes/Microsoft.Dynamics.CRM.DateTimeAttributeMetadata?$filter=LogicalName eq '${fieldName}'`;
    const req = new XMLHttpRequest();
    req.open('GET', request, false);
    req.setRequestHeader('OData-MaxVersion', '4.0');
    req.setRequestHeader('OData-Version', '4.0');
    req.setRequestHeader('Accept', 'application/json');
    req.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    req.setRequestHeader('Prefer', 'odata.include-annotations="*"');
    req.onreadystatechange = function() {
      if (this.readyState === 4) {
        req.onreadystatechange = null;
        if (this.status === 200) {
          const results = JSON.parse(this.response);
          if (results.value.length > 0) {
            dateBehavior = results.value[0].DateTimeBehavior.Value;
          }
        }
        else {
          console.log(this.statusText);
        }
      }
    };
    req.send();
    return dateBehavior;
  },

  formatTime(inputDateValue: any) {
    return _context.formatting.formatTime(inputDateValue, 3);
  },

};
