import { IColumn } from "@fluentui/react";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import DataverseService from "../../Services/DataverseService";
import { RootState } from "../Store";


type Date = {
  fieldName: string,
  dateBehavior: string
}

interface IDateState {
  dates: Date[]
}

const initialState: IDateState = {
  dates: []
};

type AsyncThunkConfig = {
  state: RootState
};

export const getDateBehavior = createAsyncThunk<Date[], IColumn[], AsyncThunkConfig>(
  'date/getDateBehavior', async (dateFields) => {

    const dates = await Promise.all(dateFields.map(async date => { let behavior = await DataverseService.getDateMetadata(date.key);
       return {
        fieldName: date.key, 
        dateBehavior: behavior
       } as Date; 
    }));
    console.log(dates);
    // const dateBehavior = await DataverseService.getDateMetadata(fieldName);
    return dates;
  }
);

export const dateSlice = createSlice({
  name: 'lookup',
  initialState, 
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getDateBehavior.fulfilled, (state, action) => {
      state.dates = [...action.payload];
    }),
    builder.addCase(getDateBehavior.rejected, (state, action) => {
      state.dates.push({fieldName: '', dateBehavior: ''})
      console.log(action.payload, action.error);
    })
  },
});

export default dateSlice.reducer;