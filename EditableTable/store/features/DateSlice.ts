import { IColumn } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDateMetadata } from '../../services/DataverseService';
import { DynamicsError, showErrorDialog } from './ErrorSlice';

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

// type AsyncThunkConfig = {
//   state: RootState,
// };

export const getDateBehavior = createAsyncThunk<DateMetadata[], IColumn[]>(
  'date/getDateBehavior',
  async (dateFields, thunkApi) => {
    try {
      return await Promise.all(dateFields.map(async date => {
        const behavior = await getDateMetadata(date.key);
        return {
          fieldName: date.key,
          dateBehavior: behavior,
        };
      }));
    }
    catch (error) {
      thunkApi.dispatch(showErrorDialog(error as DynamicsError));
      return [];
    }
  },
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
