// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IColumn, ITag } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getLookupOptions,
  getRelationships,
  getEntityPluralName } from '../../services/DataverseService';
import { RootState } from '../store';

export type LookupField = {
  lookupColumn: IColumn;
  lookupRefEntity: string;
}

export type Relationship = {
  fieldNameRef: string,
  entityNameRef: string,
  entityNavigation?: string
}

export type Lookup = {
  logicalName: string | undefined,
  reference: Relationship | undefined,
  entityPluralName?: string,
  options: ITag[]
}

interface ILookupState {
  logicalNames: Array<Relationship>,
  lookups: Array<Lookup>
}

const initialState: ILookupState = {
  logicalNames: [],
  lookups: [],
};

type AsyncThunkConfig = {
  state: RootState
};

export const setLogicalNames = createAsyncThunk<Relationship[], string, AsyncThunkConfig>(
  'lookup/setLogicalNames', async () => await getRelationships(),
);

export const setLookups = createAsyncThunk<Lookup[], LookupField[], AsyncThunkConfig>(
  'lookup/setLookups',
  async (lookupFields, thunkApi) =>
    await Promise.all(lookupFields.map(async lookupField => {
      const { logicalNames } = thunkApi.getState().lookup;
      const { lookupRefEntity } = lookupField;
      const { fieldName } = lookupField.lookupColumn;

      const lookupRef: Relationship | undefined =
        logicalNames.find((ref: Relationship) => {
          if (lookupRefEntity) {
            if (ref.entityNameRef === lookupRefEntity) return true;
          }
          else if (ref.fieldNameRef === fieldName) {
            return true;
          }
        });

      const entityName = lookupRef ? lookupRef.entityNameRef : '';
      const entityPluralName = await getEntityPluralName(entityName);
      const options = await getLookupOptions(entityName);

      return <Lookup>{
        logicalName: fieldName,
        reference: lookupRef,
        entityPluralName,
        options,
      };
    })),
);

export const lookupSlice = createSlice({
  name: 'lookup',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(setLogicalNames.fulfilled, (state, action) => {
      state.logicalNames = [...action.payload];
    });
    builder.addCase(setLogicalNames.rejected, (state, action) => {
      state.logicalNames = [];
      console.log(action);
    });
    builder.addCase(setLookups.fulfilled, (state, action) => {
      state.lookups = [...action.payload];
    });
    builder.addCase(setLookups.rejected, (state, action) => {
      console.log(action.payload, action.error);
    });
  },
});

export default lookupSlice.reducer;

// export const { setLookupReference } = lookupSlice.actions;
