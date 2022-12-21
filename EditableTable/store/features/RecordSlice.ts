import { IColumn } from '@fluentui/react';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { deleteRecord, openRecordDeleteDialog, saveRecord } from '../../services/DataverseService';
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
  state: RootState
};

export const saveRecords = createAsyncThunk<void, undefined, AsyncThunkConfig>(
  'record/saveRecords',
  async (a, thunkApi) => {
    const recordsToSave = thunkApi.getState().record.changedRecords;
    await Promise.all(recordsToSave.map(record => saveRecord(record)));
  },
);

export const deleteSelectedRecords = createAsyncThunk<Array<string>, any, AsyncThunkConfig>(
  'record/deleteSelectedRecords',
  async selectedRecordIds => {
    const response = await openRecordDeleteDialog();
    if (response.confirmed) {
      await Promise.all(selectedRecordIds.map(async (id: string) => {
        await deleteRecord(id);
      }));
    }
    else {
      selectedRecordIds = [];
    }
    return selectedRecordIds;
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
      console.log(currentRecord?.data);
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
        console.log(currentField);
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
      console.log(state.changedRecords);
    },
  },
  extraReducers(builder) {
    builder.addCase(saveRecords.fulfilled, state => {
      state.changedRecords = [];
    });
    builder.addCase(saveRecords.rejected, (state, action) => {
      console.log(action.payload);
    });
    builder.addCase(deleteSelectedRecords.fulfilled, (state, action) => {
      state.changedRecords.filter(record =>
        action.payload.find((id: string) => record.id !== id));
    });
    builder.addCase(deleteSelectedRecords.rejected, (state, action) => {
      console.log(action);
    });
  },
});

export const { setChangedRecords } = RecordSlice.actions;

export default RecordSlice.reducer;
