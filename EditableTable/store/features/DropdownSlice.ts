import { IColumn, IDropdownOption } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataverseService from '../../services/DataverseService';
import { RootState } from '../store';

export type Dropdown = {
  fieldName: string,
  isMultiple: boolean,
  isTwoOptions: boolean,
  attributeType: string,
  options: IDropdownOption[]
}

interface IDropdownState {
  dropdowns: Dropdown[]
}

const initialState: IDropdownState = {
  dropdowns: [],
};

type AsyncThunkConfig = {
  state: RootState,
  rejectValue: string
};

export const getDropdowns = createAsyncThunk<Dropdown[], IColumn[], AsyncThunkConfig>(
  'dropdown/getDropdowns', async dropdownFields => {
    const dropdowns = dropdownFields.map(dropdown => {
      let attributeType = 'PicklistAttributeMetadata';
      let isTwoOptions = false;
      let isMultiple = false;

      if (dropdown.data === 'TwoOptions') {
        attributeType = 'BooleanAttributeMetadata';
        isTwoOptions = true;
      }
      if (dropdown.data === 'MultiSelectPicklist') {
        attributeType = 'MultiSelectPicklistAttributeMetadata';
        isMultiple = true;
      }
      if (dropdown.fieldName === 'statuscode') attributeType = 'StatusAttributeMetadata';

      if (dropdown.fieldName === 'statecode') attributeType = 'StateAttributeMetadata';
      console.log(attributeType);
      return {
        fieldName: dropdown.fieldName,
        isMultiple,
        isTwoOptions,
        attributeType,
        options: [],
      } as Dropdown;
    });

    await Promise.all(
      dropdowns.map(async dropdown => {
        const options = await DataverseService.getDropdownOptions(
          dropdown.fieldName,
          dropdown.attributeType,
          dropdown.isTwoOptions);
        dropdown.options = [...options];
      }));

    return dropdowns;
  },
);

export const dropdownSlice = createSlice({
  name: 'lookup',
  initialState,
  reducers: {
  },
  extraReducers: builder => {
    builder.addCase(getDropdowns.fulfilled, (state, action) => {
      console.log(state, action);
      state.dropdowns = [...action.payload];
    });
    builder.addCase(getDropdowns.rejected, (state, action) => {
      console.log(action.payload);
      state.dropdowns = [];
    });
  },
});

export default dropdownSlice.reducer;
