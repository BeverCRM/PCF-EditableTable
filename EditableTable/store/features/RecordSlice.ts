import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Row } from '../../mappers/dataSetMapper';
import { IDataverseService } from '../../services/DataverseService';
import { AsyncThunkConfig } from '../../utils/types';
import { RequirementLevel } from './DatasetSlice';

export type Record = {
  id: string;
  data: [
    {
      fieldName: string,
      newValue: any,
      fieldType: string
    }
  ]
};

export interface IRecordState {
  changedRecords: Record[],
  isPendingSave: boolean,
}

const initialState: IRecordState = {
  changedRecords: [],
  isPendingSave: false,
};

type DeleteRecordPayload = {
  recordIds: string[],
  _service: IDataverseService,
};

const isRequiredFieldEmpty = (requirementLevels: RequirementLevel[], rows: Row[]) =>
  rows.some(row =>
    row.columns.some(column =>
      requirementLevels.find(requirementLevel =>
        requirementLevel.fieldName === column.schemaName)?.isRequired && !column.rawValue));

export const saveRecords = createAsyncThunk<void, IDataverseService, AsyncThunkConfig>(
  'record/saveRecords',
  async (_service, thunkApi) => {
    const { changedRecords } = thunkApi.getState().record;
    const { requirementLevels, rows } = thunkApi.getState().dataset;

    if (isRequiredFieldEmpty(requirementLevels, rows)) {
      return thunkApi.rejectWithValue({ message: 'All required fields must be filled in.' });
    }

    await Promise.all(changedRecords.map(record => _service.saveRecord(record)));
  },
);

export const deleteRecords = createAsyncThunk<string[], DeleteRecordPayload, AsyncThunkConfig>(
  'record/deleteRecords',
  async (payload, thunkApi) => {
    const newRecordIds = payload.recordIds.filter(id => id.length < 15);

    const response = await payload._service.openRecordDeleteDialog();
    if (response.confirmed) {
      await Promise.all(payload.recordIds.map(async id => {
        if (id.length > 15) await payload._service.deleteRecord(id);
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

    builder.addCase(deleteRecords.fulfilled, (state, action) => {
      const recordsToRemove = new Set(action.payload);
      state.changedRecords = state.changedRecords.filter(record =>
        !recordsToRemove.has(record.id));
    });
  },
});

export const { setChangedRecords, clearChangedRecords } = RecordSlice.actions;

export default RecordSlice.reducer;
