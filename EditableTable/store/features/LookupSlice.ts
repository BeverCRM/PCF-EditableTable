// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IColumn, ITag } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getLookupOptions,
  getRelationships,
  getEntityPluralName,
} from '../../services/DataverseService';
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
  logicalName?: string,
  reference?: Relationship,
  entityPluralName?: string,
  options: ITag[]
}

interface ILookupState {
  relationships: Relationship[],
  lookups: Lookup[]
}

const initialState: ILookupState = {
  relationships: [],
  lookups: [],
};

type AsyncThunkConfig = {
  state: RootState
};

export const setRelationships = createAsyncThunk<Relationship[], string>(
  'lookup/setRelationships', async () => await getRelationships(),
);

export const setLookups = createAsyncThunk<Lookup[], LookupField[], AsyncThunkConfig>(
  'lookup/setLookups',
  async (lookupFields, thunkApi) =>
    await Promise.all(lookupFields.map(async lookupField => {
      const { relationships } = thunkApi.getState().lookup;
      const { lookupRefEntity } = lookupField;
      const { fieldName } = lookupField.lookupColumn;

      const lookupRef: Relationship | undefined =
        relationships.find(relationship => {
          if (lookupRefEntity && relationship.entityNameRef === lookupRefEntity) return true;
          if (relationship.fieldNameRef === fieldName) return true;

          return false;
        });

      const entityName = lookupRef?.entityNameRef ?? '';
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
    builder.addCase(setRelationships.fulfilled, (state, action) => {
      state.relationships = [...action.payload];
    });
    builder.addCase(setRelationships.rejected, (state, action) => {
      state.relationships = [];
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
