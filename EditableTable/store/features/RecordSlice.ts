import { IColumn } from '@fluentui/react';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import DataverseService from '../../services/DataverseService';
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

type RecordState = {
  changedRecords: Record[],
  items: any,
  columns: IColumn[]
}

const initialState: RecordState = {
  changedRecords: [],
  items: [],
  columns: [],
};

export const saveRecords = createAsyncThunk<void, undefined, AsyncThunkConfig>(
  'record/saveRecords',
  async (a, thunkApi) => {
    const recordsToSave = thunkApi.getState().record.changedRecords;
    await Promise.all(recordsToSave.map(record => DataverseService.saveRecords(record)));
  },
);

export const deleteSelectedRecords = createAsyncThunk<Array<string>, any, AsyncThunkConfig>(
  'record/deleteSelectedRecords',
  async selectedRecordIds => {
    const response = await DataverseService.openRecordDeleteDialog();
    if (response.confirmed) {
      await Promise.all(selectedRecordIds.map(async (id: string) => {
        await DataverseService.deleteSelectedRecords(id);
      }));
    }
    else {
      selectedRecordIds = [];
      console.log(`Delete denied! 
        New Array: ${selectedRecordIds}`);
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
        }
      }
      state.changedRecords = changedRecords;
      console.log(state);
    },
  },
  extraReducers(builder) {
    builder.addCase(saveRecords.fulfilled, (state, action) => {
      state.changedRecords = [];
      console.log(action.payload);
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

type AsyncThunkConfig = {
  state: RootState
};

export const { setChangedRecords } = RecordSlice.actions;

export default RecordSlice.reducer;