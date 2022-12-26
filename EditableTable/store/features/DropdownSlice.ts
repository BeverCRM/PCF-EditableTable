import { IColumn, IDropdownOption } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getDropdownOptions } from '../../services/DataverseService';
import { DynamicsError, showErrorDialog } from './ErrorSlice';

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
  async (dropdownFields, thunkApi) => {
    try {
      return await Promise.all(dropdownFields.map(async dropdownField => {
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
      }));
    }
    catch (error) {
      thunkApi.dispatch(showErrorDialog(error as DynamicsError));
      return [];
    }
  },
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
      console.log(action.payload);
      state.dropdownFields = [];
    });
  },
});

export default DropdownSlice.reducer;
