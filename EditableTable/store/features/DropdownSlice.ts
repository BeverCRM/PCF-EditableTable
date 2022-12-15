import { IColumn, IDropdownOption } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataverseService from '../../services/DataverseService';

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

        case 'statuscode':
          attributeType = 'StatusAttributeMetadata';
          isTwoOptions = false;
          break;

        case 'statecode':
          attributeType = 'StateAttributeMetadata';
          isTwoOptions = false;
          break;

        default:
          attributeType = 'PicklistAttributeMetadata';
          isTwoOptions = false;
      }

      const currentDropdown = await DataverseService.getDropdownOptions(
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
      console.table(state.dropdownFields);
    });
    builder.addCase(getDropdownsOptions.rejected, (state, action) => {
      console.log(action.payload);
      state.dropdownFields = [];
    });
  },
});

export default DropdownSlice.reducer;
