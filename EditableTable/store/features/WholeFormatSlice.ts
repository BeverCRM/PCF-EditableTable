import { IComboBoxOption } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getTimeZoneDefinitions,
  getProvisionedLanguages,
  openErrorDialog,
} from '../../services/DataverseService';
import store from '../store';
import { setLoading } from './LoadingSlice';

interface IWholeFormatState {
  timezones: IComboBoxOption[];
  languages: IComboBoxOption[]
}

const initialState: IWholeFormatState = {
  timezones: [],
  languages: [],
};

export const getTimeZones = createAsyncThunk(
  'wholeFormat/getTimeZones',
  async () => {
    const timezones = await getTimeZoneDefinitions();
    return timezones;
  },
);

export const getLanguages = createAsyncThunk(
  'wholeFormat/getLanguages',
  async () => {
    const languages = await getProvisionedLanguages();
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
      state.timezones = [...action.payload];
    });

    builder.addCase(getTimeZones.rejected, (state, action) => {
      console.log(action.payload);
      openErrorDialog(action.error).then(() => {
        store.dispatch(setLoading(false));
      });
    });

    builder.addCase(getLanguages.fulfilled, (state, action) => {
      state.languages = [...action.payload];
    });

    builder.addCase(getLanguages.rejected, (state, action) => {
      console.log(action.payload);
      openErrorDialog(action.error).then(() => {
        store.dispatch(setLoading(false));
      });
    });
  },
});

export default WholeFormatSlice.reducer;
