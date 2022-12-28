// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IColumn, ITag } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import {
  getLookupOptions,
  getRelationships,
  getEntityPluralName,
} from '../../services/DataverseService';
import { RootState } from '../store';

export type Relationship = {
  fieldNameRef: string,
  entityNameRef: string,
  entityNavigation?: string
}

export type Lookup = {
  logicalName: string | undefined,
  reference: Relationship | undefined,
  entityPluralName: string | undefined,
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

export const setLookups = createAsyncThunk<Lookup[], IColumn[], AsyncThunkConfig>(
  'lookup/setLookups',
  async (lookupColumns, thunkApi) =>
    await Promise.all(lookupColumns.map(async lookupColumn => {
      const { relationships } = thunkApi.getState().lookup;
      const { fieldName } = lookupColumn;

      const relationship: Relationship | undefined =
        relationships.find(relationship => {
          if (relationship.fieldNameRef === fieldName) return true;

          return false;
        });

      const entityName = relationship?.entityNameRef ?? '';
      const entityPluralName = await getEntityPluralName(entityName);
      const options = await getLookupOptions(entityName);

      return <Lookup>{
        logicalName: fieldName,
        reference: relationship,
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
