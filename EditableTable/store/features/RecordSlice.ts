import { IColumn } from '@fluentui/react';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  deleteRecord,
  openRecordDeleteDialog,
  saveRecord,
  openErrorDialog,
} from '../../services/DataverseService';
import { RootState } from '../store';

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

interface IRecordState {
  changedRecords: Record[],
  items: any,
  columns: IColumn[]
}

const initialState: IRecordState = {
  changedRecords: [],
  items: [],
  columns: [],
};

type AsyncThunkConfig = {
  state: RootState,
};

export const saveRecords = createAsyncThunk<void, undefined, AsyncThunkConfig>(
  'record/saveRecords',
  async (a, thunkApi) => {
    try {
      const { changedRecords } = thunkApi.getState().record;
      await Promise.all(changedRecords.map(record => saveRecord(record)));
    }
    catch (error) {
      openErrorDialog(error);
      throw error;
    }
  },
);

export const deleteRecords = createAsyncThunk<string[], string[], AsyncThunkConfig>(
  'record/deleteRecords',
  async recordIds => {
    const response = await openRecordDeleteDialog();
    if (response.confirmed) {
      await Promise.all(recordIds.map(async id => {
        await deleteRecord(id);
      }));

      return recordIds;
    }

    return [];
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
    },
  },
  extraReducers(builder) {
    builder.addCase(saveRecords.fulfilled, state => {
      state.changedRecords = [];
    });
    builder.addCase(saveRecords.rejected, (state, action) => {
      openErrorDialog(action.error);
    });
    builder.addCase(deleteRecords.fulfilled, (state, action) => {
      state.changedRecords.filter(record =>
        action.payload.find(id => record.id !== id));
    });
    builder.addCase(deleteRecords.rejected, (state, action) => {
      openErrorDialog(action.error);
    });
  },
});

export const { setChangedRecords } = RecordSlice.actions;

export default RecordSlice.reducer;
