import { ITag } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Field } from '../../hooks/useLoadStore';
import { IDataverseService } from '../../services/DataverseService';
import { AsyncThunkConfig } from '../../utils/types';

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

export interface ILookupState {
  relationships: Relationship[],
  lookups: Lookup[]
}

const initialState: ILookupState = {
  relationships: [],
  lookups: [],
};

type LookupPayload = {
  lookupColumns: Field[],
  _service: IDataverseService
};

export const setRelationships = createAsyncThunk<Relationship[], IDataverseService>(
  'lookup/setRelationships', async _service => await _service.getRelationships(),
);

export const setLookups = createAsyncThunk<Lookup[], LookupPayload, AsyncThunkConfig>(
  'lookup/setLookups',
  async (payload, thunkApi) =>
    await Promise.all(payload.lookupColumns.map(async lookupColumn => {
      const { relationships } = thunkApi.getState().lookup;
      const { fieldName } = lookupColumn;

      const relationship: Relationship | undefined =
        relationships.find(relationship => {
          if (relationship.fieldNameRef === fieldName) return true;

          return false;
        });

      const entityName = relationship?.entityNameRef ?? '';
      const entityPluralName = await payload._service.getEntityPluralName(entityName);
      const options = await payload._service.getLookupOptions(entityName);

      return <Lookup>{
        logicalName: fieldName,
        reference: relationship,
        entityPluralName,
        options,
      };
    })),
);

export const LookupSlice = createSlice({
  name: 'lookup',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(setRelationships.fulfilled, (state, action) => {
      state.relationships = [...action.payload];
    });

    builder.addCase(setRelationships.rejected, state => {
      state.relationships = [];
    });

    builder.addCase(setLookups.fulfilled, (state, action) => {
      state.lookups = [...action.payload];
    });

    builder.addCase(setLookups.rejected, state => {
      state.lookups = [];
    });
  },
});

export default LookupSlice.reducer;
