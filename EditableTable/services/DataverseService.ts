import { IInputs } from '../generated/ManifestTypes';
import { IComboBoxOption, IDropdownOption, ITag } from '@fluentui/react';
import { getFetchResponse } from '../utils/fetchUtils';
import { Relationship } from '../store/features/LookupSlice';
import { Record } from '../store/features/RecordSlice';
import { DropdownField } from '../store/features/DropdownSlice';
import { NumberFieldMetadata } from '../store/features/NumberSlice';

export type ParentMetadata = {
  entityId: string,
  entityRecordName: string,
  entityTypeName: string,
};

export type Entity = ComponentFramework.WebApi.Entity;

export interface IDataverseService {
  getEntityPluralName(entityName: string): Promise<string>;
  getCurrentUserName(): string;
  getParentMetadata(): ParentMetadata;
  setParentValue(): Promise<void>;
  openForm(id: string, entityName?: string): void;
  createNewRecord(data: {}): Promise<void>;
  retrieveAllRecords(entityName: string, options: string): Promise<Entity[]>;
  deleteRecord(recordId: string): Promise<void>;
  openRecordDeleteDialog(): Promise<ComponentFramework.NavigationApi.ConfirmDialogResponse>;
  openErrorDialog(error: any): Promise<void>;
  getFieldSchemaName(): Promise<string>;
  parentFieldIsValid(record: Record, subgridParentFieldName: string | undefined): boolean;
  saveRecord(record: Record): Promise<void>;
  getRelationships(): Promise<Relationship[]>;
  getLookupOptions(entityName: string): Promise<ITag[]>;
  getDropdownOptions(fieldName: string, attributeType: string, isTwoOptions: boolean):
    Promise<DropdownField>;
  getNumberFieldMetadata(fieldName: string, attributeType: string, selection: string):
    Promise<NumberFieldMetadata>;
  getCurrencySymbol(recordId: string): Promise<string>;
  getTimeZoneDefinitions(): Promise<IComboBoxOption[]>;
  getProvisionedLanguages(): Promise<IComboBoxOption[]>;
  getDateMetadata(fieldName: string): Promise<any>;
  getTargetEntityType(): string;
  getContext(): ComponentFramework.Context<IInputs>;
  getAllocatedWidth(): number;
  getReqirementLevel(fieldName: string): Promise<any>;
  isStatusField(fieldName: string | undefined): boolean;
}

export class DataverseService implements IDataverseService {
  private _context: ComponentFramework.Context<IInputs>;
  private _targetEntityType: string;
  private _clientUrl: string;
  private _parentValue: string;
  private NEW_RECORD_ID_LENGTH_CHECK = 15;

  constructor(context: ComponentFramework.Context<IInputs>) {
    this._context = context;
    this._targetEntityType = context.parameters.dataset.getTargetEntityType();
    // @ts-ignore
    this._clientUrl = `${this._context.page.getClientUrl()}/api/data/v9.2/`;
  }

  public getCurrentUserName() {
    return this._context.userSettings.userName;
  }

  public getParentMetadata() {
    // @ts-ignore
    return <ParentMetadata> this._context.mode.contextInfo;
  }

  public async getEntityPluralName(entityName: string): Promise<string> {
    const metadata = await this._context.utils.getEntityMetadata(entityName);
    return metadata.EntitySetName;
  }

  public async getParentPluralName(): Promise<string> {
    const parentMetadata = this.getParentMetadata();
    const parentEntityPluralName = await this.getEntityPluralName(parentMetadata.entityTypeName);
    return `/${parentEntityPluralName}(${parentMetadata.entityId})`;
  }

  public async setParentValue() {
    this._parentValue = await this.getParentPluralName();
  }

  public openForm(id: string, entityName?: string) {
    const options = {
      entityId: id,
      entityName: entityName ?? this._targetEntityType,
      openInNewWindow: false,
    };
    this._context.navigation.openForm(options);
  }

  public async createNewRecord(data: {}): Promise<void> {
    await this._context.webAPI.createRecord(this._targetEntityType, data);
  }

  public async retrieveAllRecords(entityName: string, options: string) {
    const entities = [];
    let result = await this._context.webAPI.retrieveMultipleRecords(entityName, options);
    entities.push(...result.entities);
    while (result.nextLink !== undefined) {
      options = result.nextLink.slice(result.nextLink.indexOf('?'));
      result = await this._context.webAPI.retrieveMultipleRecords(entityName, options);
      entities.push(...result.entities);
    }
    return entities;
  }

  public async deleteRecord(recordId: string): Promise<void> {
    try {
      await this._context.webAPI.deleteRecord(this._targetEntityType, recordId);
    }
    catch (e) {
      console.log(e);
    }
  }

  public async openRecordDeleteDialog():
  Promise<ComponentFramework.NavigationApi.ConfirmDialogResponse> {
    const entityMetadata = await this._context.utils.getEntityMetadata(this._targetEntityType);
    const strings = {
      text: `Do you want to delete selected ${entityMetadata._displayName}?
            You can't undo this action.`,
      title: 'Confirm Deletion',
    };
    const options = { height: 200, width: 450 };
    const response = await this._context.navigation.openConfirmDialog(strings, options);

    return response;
  }

  public openErrorDialog(error: any): Promise<void> {
    const errorDialogOptions: ComponentFramework.NavigationApi.ErrorDialogOptions = {
      errorCode: error.code,
      message: error.message,
      details: error.raw,
    };

    return this._context.navigation.openErrorDialog(errorDialogOptions);
  }

  public async getFieldSchemaName(): Promise<string> {
    // @ts-ignore
    const logicalName = this._context.page.entityTypeName;
    const endpoint = `EntityDefinitions(LogicalName='${logicalName}')/OneToManyRelationships`;
    const options = `$filter=ReferencingEntity eq '${
      this._targetEntityType}'&$select=ReferencingEntityNavigationPropertyName`;
    const request = `${this._clientUrl}${endpoint}?${options}`;
    const data = await getFetchResponse(request);
    return data.value[0]?.ReferencingEntityNavigationPropertyName;
  }

  public parentFieldIsValid(record: Record, subgridParentFieldName: string | undefined) {
    return subgridParentFieldName !== undefined &&
    !record.data.some(recordData => recordData.fieldName === subgridParentFieldName);
  }

  public async saveRecord(record: Record): Promise<void> {
    const data = record.data.reduce((obj, recordData) =>
      Object.assign(obj,
        recordData.fieldType === 'Lookup.Simple'
          ? { [`${recordData.fieldName}@odata.bind`]: recordData.newValue }
          : { [recordData.fieldName]: recordData.newValue }), {});

    const subgridParentFieldName = await this.getFieldSchemaName();
    if (this.parentFieldIsValid(record, subgridParentFieldName)) {
      Object.assign(data, { [`${subgridParentFieldName}@odata.bind`]: this._parentValue });
    }

    if (record.id.length < this.NEW_RECORD_ID_LENGTH_CHECK) {
      await this.createNewRecord(data);
    }
    else {
      await this._context.webAPI.updateRecord(this._targetEntityType, record.id, data);
    }
  }

  public async getRelationships(): Promise<Relationship[]> {
    const relationships = `ManyToManyRelationships,ManyToOneRelationships,OneToManyRelationships`;
    const request = `${this._clientUrl}EntityDefinitions(LogicalName='${
      this._targetEntityType}')?$expand=${relationships}`;
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
  }

  public async getLookupOptions(entityName: string) {
    const metadata = await this._context.utils.getEntityMetadata(entityName);
    const entityNameFieldName = metadata.PrimaryNameAttribute;
    const entityIdFieldName = metadata.PrimaryIdAttribute;

    const fetchedOptions = await this.retrieveAllRecords(entityName,
      `?$select=${entityIdFieldName},${entityNameFieldName}`);

    const options: ITag[] = fetchedOptions.map(option => ({
      key: option[entityIdFieldName],
      name: option[entityNameFieldName] ?? '(No Name)',
    }));

    return options;
  }

  public async getDropdownOptions(fieldName: string, attributeType: string, isTwoOptions: boolean) {
    const request = `${this._clientUrl}EntityDefinitions(LogicalName='${
      this._targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.${
      attributeType}?$select=LogicalName&$filter=LogicalName eq '${fieldName}'&$expand=OptionSet`;
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
  }

  public async getNumberFieldMetadata(fieldName: string, attributeType: string, selection: string) {
    const request = `${this._clientUrl}EntityDefinitions(LogicalName='${
      this._targetEntityType}')/Attributes/Microsoft.Dynamics.CRM.${attributeType}?$select=${
      selection}&$filter=LogicalName eq '${fieldName}'`;
    const results = await getFetchResponse(request);

    return {
      fieldName,
      precision: results.value[0]?.PrecisionSource ?? results.value[0]?.Precision ?? 0,
      minValue: results.value[0].MinValue,
      maxValue: results.value[0].MaxValue,
      isBaseCurrency: results.value[0].IsBaseCurrency,
    };
  }

  public async getCurrencySymbol(recordId: string): Promise<string> {
    const fetchedCurrency = await this._context.webAPI.retrieveRecord(
      this._targetEntityType,
      recordId,
      '?$select=_transactioncurrencyid_value&$expand=transactioncurrencyid($select=currencysymbol)',
    );

    return fetchedCurrency.transactioncurrencyid?.currencysymbol ||
      this._context.userSettings.numberFormattingInfo.currencySymbol;
  }

  public async getTimeZoneDefinitions() {
    const request = `${this._clientUrl}timezonedefinitions`;
    const results = await getFetchResponse(request);

    return results.value.sort((a: any, b: any) => b.bias - a.bias)
      .map((timezone: any) => <IComboBoxOption>{
        key: timezone.timezonecode.toString(),
        text: timezone.userinterfacename,
      });
  }

  public async getProvisionedLanguages() {
    const request = `${this._clientUrl}RetrieveProvisionedLanguages`;
    const results = await getFetchResponse(request);

    return results.RetrieveProvisionedLanguages.map((language: any) => <IComboBoxOption>{
      key: language.toString(),
      text: this._context.formatting.formatLanguage(language),
    });
  }

  public async getDateMetadata(fieldName: string) {
    const filter = `$filter=LogicalName eq '${fieldName}'`;
    const request = `${this._clientUrl}EntityDefinitions(LogicalName='${this._targetEntityType
    }')/Attributes/Microsoft.Dynamics.CRM.DateTimeAttributeMetadata?${filter}`;
    const results = await getFetchResponse(request);

    return results.value[0].DateTimeBehavior.Value;
  }

  public getTargetEntityType() {
    return this._targetEntityType;
  }

  public getContext() {
    return this._context;
  }

  public getAllocatedWidth() {
    return this._context.mode.allocatedWidth;
  }

  public async getReqirementLevel(fieldName: string) {
    const request = `${this._clientUrl}EntityDefinitions(LogicalName='${
      this._targetEntityType}')/Attributes(LogicalName='${fieldName}')?$select=RequiredLevel`;
    const results = await getFetchResponse(request);

    return results.RequiredLevel.Value;
  }

  public isStatusField(fieldName: string | undefined) {
    return !!(fieldName === 'statuscode' || fieldName === 'statecode');
  }

}
