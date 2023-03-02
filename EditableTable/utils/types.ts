import { IColumn, IComboBoxOption, IDropdownOption, ITag } from '@fluentui/react';
import { AnyAction, ThunkMiddleware } from '@reduxjs/toolkit';
import { EnhancedStore } from '@reduxjs/toolkit/dist/configureStore';
import { EditableTable } from '..';
import { ParentEntityMetadata } from '../components/EditableGrid/GridCell';
import { IInputs } from '../generated/ManifestTypes';
import { Row } from '../mappers/dataSetMapper';
import { IDatasetState } from '../store/features/DatasetSlice';
import { IDateState } from '../store/features/DateSlice';
import { IDropdownState } from '../store/features/DropdownSlice';
import { ILoadingState } from '../store/features/LoadingSlice';
import { ILookupState } from '../store/features/LookupSlice';
import { INumberState } from '../store/features/NumberSlice';
import { IRecordState } from '../store/features/RecordSlice';
import { IWholeFormatState } from '../store/features/WholeFormatSlice';

export type EntityMetadata = ComponentFramework.PropertyHelper.EntityMetadata;

// export type RetriveRecords = ComponentFramework.WebApi.RetrieveMultipleResponse;

export type Entity = ComponentFramework.WebApi.Entity;

export type Dictionary<T> = { [key: string]: T };

export interface IService<T> {
  _service: T;
}

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IDataverseService {
  getEntityPluralName(entityName: string): Promise<string>;
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
}

export interface IDataSetProps extends IService<IDataverseService> {
  dataset: DataSet;
  isControlDisabled: boolean;
  width: number;
  _store: Store;
}

export type Updates = {
  rowKey: string;
  columnName: string;
  newValue: any;
}

export type RequirementLevel = {
  fieldName: string;
  isRequired: boolean;
}

export interface IGridSetProps extends IService<IDataverseService> {
  row: Row,
  currentColumn: IColumn,
}

export type Record = {
  id: string;
  data: [
    {
      fieldName: string,
      newValue: any,
      fieldType: string
    }
  ]
}

export type ParentMetadata = {
  entityId: string,
  entityRecordName: string,
  entityTypeName: string,
}

export interface ILookupProps extends IService<IDataverseService> {
  fieldName: string;
  value: ITag | undefined;
  parentEntityMetadata: ParentEntityMetadata | undefined;
  _onChange: Function;
  _onDoubleClick: Function;
  isRequired: boolean;
}

export type Relationship = {
  fieldNameRef: string,
  entityNameRef: string,
  entityNavigation?: string
}

export type Lookup = {
  logicalName: string | undefined,
  reference: Relationship | undefined,
  entityPluralName: string | undefined,
  options: ITag[]
}

export interface IDatePickerProps extends IService<IDataverseService> {
  fieldName: string,
  dateOnly: boolean,
  value: string | null,
  _onChange: any,
  _onDoubleClick: Function;
  isRequired: boolean;
}

export type DateMetadata = {
  fieldName: string,
  dateBehavior: string
}

export interface INumberProps extends IService<IDataverseService> {
  fieldName: string | undefined;
  value: string;
  rowId?: string;
  _onChange: Function;
  _onDoubleClick: Function;
  isRequired: boolean;
}

export type NumberFieldMetadata = {
  fieldName: string,
  precision: number,
  minValue: number,
  maxValue: number,
}

export type CurrencySymbol = {
  recordId: string,
  symbol: string
}

export type DropdownField = {
  fieldName: string,
  options: IDropdownOption[]
}

export interface StoreState {
  dataset: IDatasetState;
  lookup: ILookupState;
  number: INumberState;
  dropdown: IDropdownState;
  loading: ILoadingState;
  record: IRecordState;
  wholeFormat: IWholeFormatState;
  date: IDateState;
}

export type Store = EnhancedStore<
StoreState,
AnyAction,
[ThunkMiddleware<StoreState, AnyAction, undefined>]>;

const table = new EditableTable();

export type RootState = ReturnType<typeof table._store.getState>;
export type AppDispatch = typeof table._store.dispatch;

export type AsyncThunkConfig = {
  state: RootState,
};
