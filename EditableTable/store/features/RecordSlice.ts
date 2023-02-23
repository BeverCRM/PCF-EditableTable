import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Row } from '../../mappers/dataSetMapper';
import {
  deleteRecord,
  openRecordDeleteDialog,
  saveRecord,
  openErrorDialog,
  getParentMetadata,
  getEntityPluralName,
} from '../../services/DataverseService';
import store, { RootState } from '../store';
import { RequirementLevel } from './DatasetSlice';
import { setLoading } from './LoadingSlice';

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

interface IRecordState {
  changedRecords: Record[],
  isPendingSave: boolean,
}

const initialState: IRecordState = {
  changedRecords: [],
  isPendingSave: false,
};

type AsyncThunkConfig = {
  state: RootState,
};

const isRequiredFieldEmpty = (requirementLevels: RequirementLevel[], rows: Row[]) =>
  rows.some(row =>
    row.columns.some(column =>
      requirementLevels.find(field =>
        field.fieldName === column.schemaName)?.isRequired && !column.rawValue));

export const saveRecords = createAsyncThunk<void, undefined, AsyncThunkConfig>(
  'record/saveRecords',
  async (a, thunkApi) => {
    const { changedRecords } = thunkApi.getState().record;
    const { requirementLevels, rows } = thunkApi.getState().dataset;

    if (isRequiredFieldEmpty(requirementLevels, rows)) {
      return thunkApi.rejectWithValue({ message: 'All required fields must be filled in.' });
    }

    const parentMetadata = getParentMetadata();
    const parentEntityPluralName = await getEntityPluralName(parentMetadata.entityTypeName);
    const parentValue = `/${parentEntityPluralName}(${parentMetadata.entityId})`;

    await Promise.all(changedRecords.map(record => saveRecord(record, parentValue)));
  },
);

export const deleteRecords = createAsyncThunk<string[], string[], AsyncThunkConfig>(
  'record/deleteRecords',
  async (recordIds, thunkApi) => {
    const newRecordIds = recordIds.filter(id => id.length < 15);

    const response = await openRecordDeleteDialog();
    if (response.confirmed) {
      await Promise.all(recordIds.map(async id => {
        if (id.length > 15) await deleteRecord(id);
      }));

      return thunkApi.fulfillWithValue(newRecordIds);
    }

    return thunkApi.rejectWithValue(response.confirmed);
  },
);

const RecordSlice = createSlice({
  name: 'record',
  initialState,
  reducers: {
    setChangedRecords: (
      state,
      action: PayloadAction<{id: string, fieldName: string, fieldType: string, newValue: any}>) => {
      const { changedRecords } = state;
      const currentRecord = changedRecords?.find(record => record.id === action.payload.id);

      if (currentRecord === undefined) {
        changedRecords.push({
          id: action.payload.id,
          data: [{
            fieldName: action.payload.fieldName,
            newValue: action.payload.newValue,
            fieldType: action.payload.fieldType,
          }] });
      }
      else {
        const currentField = currentRecord.data
          .find(data => data.fieldName === action.payload.fieldName);

        if (currentField === undefined) {
          currentRecord.data.push({
            fieldName: action.payload.fieldName,
            newValue: action.payload.newValue,
            fieldType: action.payload.fieldType,
          });
        }
        else {
          currentField.newValue = action.payload.newValue;
          currentField.fieldType = action.payload.fieldType;
        }
      }
      state.changedRecords = changedRecords;
      state.isPendingSave = true;
    },

    clearChangedRecords: state => {
      state.changedRecords = [];
      state.isPendingSave = false;
    },
  },
  extraReducers(builder) {
    builder.addCase(saveRecords.fulfilled, state => {
      state.changedRecords = [];
      state.isPendingSave = false;
    });

    builder.addCase(saveRecords.rejected, (state, action) => {
      openErrorDialog(action.payload || action.error).then(() => {
        store.dispatch(setLoading(false));
      });
    });

    builder.addCase(deleteRecords.fulfilled, (state, action) => {
      const recordsToRemove = new Set(action.payload);
      state.changedRecords = state.changedRecords.filter(record =>
        !recordsToRemove.has(record.id));
    });

    builder.addCase(deleteRecords.rejected, (state, action) => {
      if (action.payload) {
        openErrorDialog(action.error).then(() => {
          store.dispatch(setLoading(false));
        });
      }
    });
  },
});

export const { setChangedRecords, clearChangedRecords } = RecordSlice.actions;

export default RecordSlice.reducer;
