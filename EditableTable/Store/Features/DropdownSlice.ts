//import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IColumn, IDropdownOption } from '@fluentui/react';
import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import DataverseService from '../../Services/DataverseService';
import { RootState } from '../Store';

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
  dropdowns: []
};


type AsyncThunkConfig = {
  state: RootState,
  rejectValue: string
};

// type DropdownMetadata = {
//   entityName: string,
//   fieldName: string, 
//   isTwoOptions: boolean,
//   isMultiple: boolean,
//   attributeType: string
// };

// export const getDropdownOptions = createAsyncThunk<Dropdown, DropdownMetadata, AsyncThunkConfig>(
//   'dropdown/getOptions', async (metadata, thunkApi) => {
//     console.log(thunkApi.getState());
//     console.log(metadata);
//     const currentDropdown: Dropdown = {fieldName: metadata.fieldName, entityName: metadata.entityName, isTwoOptions: metadata.isTwoOptions, isMultiple: metadata.isMultiple, options: []}
//     const options = await DataverseService.getDropdownOptions(metadata.entityName, metadata.fieldName, metadata.attributeType, metadata.isTwoOptions);
//     currentDropdown.options = [...options];
//     return currentDropdown;
//   }
// );

export const getDropdowns = createAsyncThunk<Dropdown[], IColumn[], AsyncThunkConfig>(
  'dropdown/getDropdowns', async (dropdownFields) => {
    let dropdowns = dropdownFields.map(dropdown => {
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
      return {fieldName: dropdown.fieldName,
        isMultiple, 
        isTwoOptions,
        attributeType,
        options: []} as Dropdown;
    });

    await Promise.all(dropdowns.map(async dropdown => { let options = await DataverseService.getDropdownOptions(dropdown.fieldName, dropdown.attributeType, dropdown.isTwoOptions)
      dropdown.options= [...options]; 
    }));
    return dropdowns;
  }
);

export const dropdownSlice = createSlice({
  name: 'lookup',
  initialState, 
  reducers: {
  },
  extraReducers: (builder) => {
    // builder.addCase(getDropdownOptions.fulfilled, (state, action) => {
    //   console.log(state, action);
    //   state.dropdowns.push(action.payload);
    // }),
    // builder.addCase(getDropdownOptions.rejected, (state, action) => {
    //   state.dropdowns =[];
    //   console.log(action.payload)
    // })
    builder.addCase(getDropdowns.fulfilled, (state, action) => {
      console.log(state, action);
      state.dropdowns = [...action.payload];
    }),
    builder.addCase(getDropdowns.rejected, (state, action) => {
      state.dropdowns =[];
      console.log(action.payload)
    })
  },
});

export default dropdownSlice.reducer;

// export const { } = dropdownSlice.actions;