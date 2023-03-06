import { IDropdownOption } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Field } from '../../hooks/useLoadStore';
import { IDataverseService } from '../../services/DataverseService';

export type DropdownField = {
  fieldName: string,
  options: IDropdownOption[]
}

export interface IDropdownState {
  dropdownFields: DropdownField[]
}

const initialState: IDropdownState = {
  dropdownFields: [],
};

export const getDropdownsOptions =
createAsyncThunk<DropdownField[], {dropdownFields: Field[], _service: IDataverseService}>(
  'dropdown/getDropdownsOptions',
  async payload =>
    await Promise.all(payload.dropdownFields.map(async dropdownField => {
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

      const currentDropdown = await payload._service.getDropdownOptions(
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

    builder.addCase(getDropdownsOptions.rejected, state => {
      state.dropdownFields = [];
    });
  },
});

export default DropdownSlice.reducer;
