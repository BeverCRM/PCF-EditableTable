import { IColumn } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDateMetadata, openErrorDialog } from '../../services/DataverseService';
import store from '../store';
import { setLoading } from './LoadingSlice';

type DateMetadata = {
  fieldName: string,
  dateBehavior: string
}

interface IDateState {
  dates: DateMetadata[]
}

const initialState: IDateState = {
  dates: [],
};

export const getDateBehavior = createAsyncThunk<DateMetadata[], IColumn[]>(
  'date/getDateBehavior',
  async dateFields =>
    await Promise.all(dateFields.map(async date => {
      const behavior = await getDateMetadata(date.key);
      return {
        fieldName: date.key,
        dateBehavior: behavior,
      };
    })),
);

export const dateSlice = createSlice({
  name: 'date',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getDateBehavior.fulfilled, (state, action) => {
      state.dates = [...action.payload];
    });
    builder.addCase(getDateBehavior.rejected, (state, action) => {
      state.dates.push({ fieldName: '', dateBehavior: '' });
      openErrorDialog(action.error).then(() => {
        store.dispatch(setLoading(false));
      });
    });
  },
});

export default dateSlice.reducer;
