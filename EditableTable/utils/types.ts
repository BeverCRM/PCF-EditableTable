import { IComboBoxOption, ITag } from '@fluentui/react';
import { AnyAction, ThunkMiddleware } from '@reduxjs/toolkit';
import { EnhancedStore } from '@reduxjs/toolkit/dist/configureStore';
import { EditableTable } from '..';
import { IInputs } from '../generated/ManifestTypes';
import { ParentMetadata } from '../services/DataverseService';
import { IDatasetState } from '../store/features/DatasetSlice';
import { IDateState } from '../store/features/DateSlice';
import { DropdownField, IDropdownState } from '../store/features/DropdownSlice';
import { ILoadingState } from '../store/features/LoadingSlice';
import { ILookupState, Relationship } from '../store/features/LookupSlice';
import { INumberState, NumberFieldMetadata } from '../store/features/NumberSlice';
import { IRecordState } from '../store/features/RecordSlice';
import { IWholeFormatState } from '../store/features/WholeFormatSlice';
import { Record } from '../store/features/RecordSlice';

export type EntityMetadata = ComponentFramework.PropertyHelper.EntityMetadata;

export type Entity = ComponentFramework.WebApi.Entity;

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
