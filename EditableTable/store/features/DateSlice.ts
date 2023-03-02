import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Field } from '../../hooks/useLoadStore';
import { DateMetadata, IDataverseService } from '../../utils/types';

export interface IDateState {
  dates: DateMetadata[]
}

const initialState: IDateState = {
  dates: [],
};

type DateBehaviorPayload = {
  dateFields: Field[],
  _service: IDataverseService
};

export const getDateBehavior = createAsyncThunk<DateMetadata[], DateBehaviorPayload>(
  'date/getDateBehavior',
  async payload =>
    await Promise.all(payload.dateFields.map(async date => {
      const behavior = await payload._service.getDateMetadata(date.key);

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

    builder.addCase(getDateBehavior.rejected, state => {
      state.dates.push({ fieldName: '', dateBehavior: '' });
    });
  },
});

export default dateSlice.reducer;
