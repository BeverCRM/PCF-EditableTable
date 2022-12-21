import { IColumn } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDateMetadata, _userTimeZoneUtcOffsetMinutes } from '../../services/DataverseService';

type Date = {
  fieldName: string,
  dateBehavior: string
}

interface IDateState {
  userTimeZoneOffset: number;
  dates: Date[]
}

const initialState: IDateState = {
  userTimeZoneOffset: _userTimeZoneUtcOffsetMinutes,
  dates: [],
};

export const getDateBehavior = createAsyncThunk<Date[], IColumn[]>(
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
      console.log(action.payload, action.error);
    });
  },
});

export default dateSlice.reducer;
