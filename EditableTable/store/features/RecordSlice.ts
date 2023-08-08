import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { isNewRow, Row } from '../../mappers/dataSetMapper';
import { IDataverseService } from '../../services/DataverseService';
import { AsyncThunkConfig } from '../../utils/types';
import { RequirementLevel } from './DatasetSlice';
import { ErrorDetails } from '../../services/DataverseService';
import { getConsolidatedError, isError } from '../../utils/errorUtils';
import { NEW_RECORD_ID_LENGTH_CHECK } from '../../utils/commonUtils';

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

export type RecordsAfterDelete = {
  newRows: Row[],
  changedRecordsAfterDelete: Record[]
};

export interface IRecordState {
  changedRecords: Record[],
  changedRecordsAfterDelete: Record[],
  isPendingSave: boolean,
  isPendingDelete: boolean,
}

const initialState: IRecordState = {
  changedRecords: [],
  changedRecordsAfterDelete: [],
  isPendingSave: false,
  isPendingDelete: false,
};

type DeleteRecordPayload = {
  recordIds: string[],
  _service: IDataverseService,
};

const isRequiredFieldEmpty =
  (requirementLevels: RequirementLevel[], rows: Row[], _service: IDataverseService) =>
    rows.some(row =>
      row.columns.some(column =>
        requirementLevels.find(requirementLevel =>
          requirementLevel.fieldName === column.schemaName)?.isRequired && !column.rawValue &&
          column.type !== 'Lookup.Customer' && column.type !== 'Lookup.Owner' &&
          !_service.isStatusField(column.schemaName) &&
          !(column.type === 'Currency' && column.schemaName.includes('base')),
      ));

export const saveRecords = createAsyncThunk<void, IDataverseService, AsyncThunkConfig>(
  'record/saveRecords',
  async (_service, thunkApi) => {
    const { changedRecords } = thunkApi.getState().record;
    const { requirementLevels, rows } = thunkApi.getState().dataset;

    const changedRows = rows.filter(
      (row: Row) => changedRecords.some(changedRecord => changedRecord.id === row.key));

    if (isRequiredFieldEmpty(requirementLevels, changedRows, _service)) {
      return thunkApi.rejectWithValue({ message: 'All required fields must be filled in.' });
    }
    _service.setParentValue();

    const errors: ErrorDetails[] = [];
    await Promise.all(changedRecords.map(async record => {
      const response = await _service.saveRecord(record);
      if (isError(response)) errors.push(response);
    }));

    if (errors.length > 0) {
      if (changedRecords.length === 1) {
        _service.openErrorDialog(errors[0]);
      }
      else {
        const consolidatedError = getConsolidatedError(errors, 'saving');
        _service.openErrorDialog(consolidatedError);
      }
    }
  },
);

export const deleteRecords =
  createAsyncThunk<RecordsAfterDelete, DeleteRecordPayload, AsyncThunkConfig>(
    'record/deleteRecords',
    async (payload, thunkApi) => {
      const { changedRecords } = thunkApi.getState().record;
      const { rows } = thunkApi.getState().dataset;
      const recordsToRemove = new Set(payload.recordIds);
      const newRows = rows.filter(row => isNewRow(row) && !recordsToRemove.has(row.key));

      const changedRecordsAfterDelete = changedRecords.filter(record =>
        !recordsToRemove.has(record.id) && record.id.length < NEW_RECORD_ID_LENGTH_CHECK);

      const response = await payload._service.openRecordDeleteDialog();
      if (response.confirmed) {
        const errors: ErrorDetails[] = [];
        await Promise.all(payload.recordIds.map(async id => {
          if (id.length > NEW_RECORD_ID_LENGTH_CHECK) {
            const response = await payload._service.deleteRecord(id);
            if (isError(response)) errors.push(response);
          }
        }));

        if (errors.length > 0) {
          if (payload.recordIds.length === 1) {
            payload._service.openErrorDialog(errors[0]);
          }
          else {
            const consolidatedError = getConsolidatedError(errors, 'deleting');
            payload._service.openErrorDialog(consolidatedError);
          }
        }
        return thunkApi.fulfillWithValue({ newRows, changedRecordsAfterDelete });
      }

      return thunkApi.rejectWithValue(undefined);
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

    readdChangedRecordsAfterDelete: state => {
      state.changedRecords = [...state.changedRecordsAfterDelete];
      state.isPendingSave = !!(state.changedRecordsAfterDelete.length > 0);
      state.changedRecordsAfterDelete = [];
    },

    clearChangedRecords: state => {
      state.changedRecords = [];
      state.isPendingSave = false;
    },
  },
  extraReducers(builder) {
    builder.addCase(saveRecords.fulfilled, state => {
      state.changedRecords = [];
      state.changedRecordsAfterDelete = [];
      state.isPendingSave = false;
    });

    builder.addCase(deleteRecords.pending, state => {
      state.isPendingDelete = true;
    });

    builder.addCase(deleteRecords.fulfilled, (state, action) => {
      state.changedRecords = action.payload.changedRecordsAfterDelete;
      state.changedRecordsAfterDelete = action.payload.changedRecordsAfterDelete;
      state.isPendingDelete = false;
    });
  },
});

export const {
  setChangedRecords,
  clearChangedRecords,
  readdChangedRecordsAfterDelete,
} = RecordSlice.actions;

export default RecordSlice.reducer;
