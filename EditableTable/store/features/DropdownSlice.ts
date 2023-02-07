import { IColumn, IDropdownOption } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDropdownOptions, openErrorDialog } from '../../services/DataverseService';
import store from '../store';
import { setLoading } from './LoadingSlice';

export type DropdownField = {
  fieldName: string,
  options: IDropdownOption[]
}

interface IDropdownState {
  dropdownFields: DropdownField[]
}

const initialState: IDropdownState = {
  dropdownFields: [],
};

export const getDropdownsOptions = createAsyncThunk<DropdownField[], IColumn[]>(
  'dropdown/getDropdownsOptions',
  async dropdownFields =>
    await Promise.all(dropdownFields.map(async dropdownField => {
      let attributeType: string;
      let isTwoOptions: boolean;

      switch (dropdownField.data) {
        case 'TwoOptions':
          attributeType = 'BooleanAttributeMetadata';
          isTwoOptions = true;
          break;

        case 'MultiSelectPicklist':
          attributeType = 'MultiSelectPicklistAttributeMetadata';
          isTwoOptions = false;
          break;

        default:
          attributeType = 'PicklistAttributeMetadata';
          isTwoOptions = false;
      }

      switch (dropdownField.fieldName) {
        case 'statuscode':
          attributeType = 'StatusAttributeMetadata';
          isTwoOptions = false;
          break;

        case 'statecode':
          attributeType = 'StateAttributeMetadata';
          isTwoOptions = false;
          break;
      }

      const currentDropdown = await getDropdownOptions(
        dropdownField.fieldName!,
        attributeType,
        isTwoOptions);
      return <DropdownField>currentDropdown;
    })),
);

const DropdownSlice = createSlice({
  name: 'dropdown',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getDropdownsOptions.fulfilled, (state, action) => {
      state.dropdownFields = [...action.payload];
    });

    builder.addCase(getDropdownsOptions.rejected, (state, action) => {
      state.dropdownFields = [];
      openErrorDialog(action.error).then(() => {
        store.dispatch(setLoading(false));
      });
    });
  },
});

export default DropdownSlice.reducer;
