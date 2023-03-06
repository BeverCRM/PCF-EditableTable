import { IComboBoxOption } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { IDataverseService } from '../../services/DataverseService';

export interface IWholeFormatState {
  timezones: IComboBoxOption[];
  languages: IComboBoxOption[]
}

const initialState: IWholeFormatState = {
  timezones: [],
  languages: [],
};

export const getTimeZones = createAsyncThunk<IComboBoxOption[], IDataverseService>(
  'wholeFormat/getTimeZones',
  async _service => {
    const timezones = await _service.getTimeZoneDefinitions();
    return timezones;
  },
);

export const getLanguages = createAsyncThunk<IComboBoxOption[], IDataverseService>(
  'wholeFormat/getLanguages',
  async _service => {
    const languages = await _service.getProvisionedLanguages();
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

    builder.addCase(getLanguages.fulfilled, (state, action) => {
      state.languages = [...action.payload];
    });
  },
});

export default WholeFormatSlice.reducer;
