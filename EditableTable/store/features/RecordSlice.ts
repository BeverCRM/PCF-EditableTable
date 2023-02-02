import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  deleteRecord,
  openRecordDeleteDialog,
  saveRecord,
  openErrorDialog,
} from '../../services/DataverseService';
import store, { RootState } from '../store';
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

interface IRecordState {
  changedRecords: Record[],
}

const initialState: IRecordState = {
  changedRecords: [],
};

type AsyncThunkConfig = {
  state: RootState,
};

export const saveRecords = createAsyncThunk<void, undefined, AsyncThunkConfig>(
  'record/saveRecords',
  async (a, thunkApi) => {
    const { changedRecords } = thunkApi.getState().record;
    await Promise.all(changedRecords.map(record => saveRecord(record)));
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
    },
    clearChangedRecords: state => {
      state.changedRecords = [];
    },
  },
  extraReducers(builder) {
    builder.addCase(saveRecords.fulfilled, state => {
      state.changedRecords = [];
    });
    builder.addCase(saveRecords.rejected, (state, action) => {
      openErrorDialog(action.error).then(() => {
        store.dispatch(setLoading(false));
      });
    });
    builder.addCase(deleteRecords.fulfilled, (state, action) => {
      const recordsToRemove = new Set(action.payload);
      state.changedRecords = state.changedRecords.filter(record =>
        !recordsToRemove.has(record.id));

      console.log(state.changedRecords);
    });
    builder.addCase(deleteRecords.rejected, (state, action) => {
      if (action.payload) {
        openErrorDialog(action.error).then(() => {
          store.dispatch(setLoading(false));
        });
      }
      // store.dispatch(setLoading(false));
    });
  },
});

export const { setChangedRecords, clearChangedRecords } = RecordSlice.actions;

export default RecordSlice.reducer;
