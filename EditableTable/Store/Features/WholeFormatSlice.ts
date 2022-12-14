import { IComboBoxOption } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataverseService from '../../services/DataverseService';

interface IWholeFormatState {
  timezones: IComboBoxOption[];
  languages: IComboBoxOption[]
}

const initialState: IWholeFormatState = {
  timezones: [],
  languages: [],
};

export const getTimeZones = createAsyncThunk(
  'record/getTimeZones',
  async (a, thunkApi) => {
    console.log(a, thunkApi);
    const timezones = await DataverseService.getTimeZones();
    console.log(timezones);
    return timezones;
  },
);

export const getLanguages = createAsyncThunk(
  'record/getLanguages',
  async () => {
    const languages = await DataverseService.getLanguages();
    console.log(languages);
    return languages;
  },
);

const WholeFormatSlice = createSlice({
  name: 'wholeFormat',
  initialState,
  reducers: {
  },
  extraReducers(builder) {
    builder.addCase(getTimeZones.fulfilled, (state, action) => {
      console.log(action.payload);
      state.timezones = [...action.payload];
    });
    builder.addCase(getTimeZones.rejected, (state, action) => {
      console.log(action.payload);
    });
    builder.addCase(getLanguages.fulfilled, (state, action) => {
      console.log(action.payload);
      state.languages = [...action.payload];
    });
    builder.addCase(getLanguages.rejected, (state, action) => {
      console.log(action.payload);
    });
  },
});

export default WholeFormatSlice.reducer;
