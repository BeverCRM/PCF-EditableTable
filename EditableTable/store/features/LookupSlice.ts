// import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IColumn, ITag } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import DataverseService from '../../services/DataverseService';
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
  'lookup/setLogicalNames', async () => {
    const relationships = await DataverseService.getRelationships();
    return relationships;
  },
);

export const setLookups = createAsyncThunk<Lookup[], LookupField[], AsyncThunkConfig>(
  'lookup/setLookups', async (lookupFields, thunkApi) => {
    const { logicalNames } = thunkApi.getState().lookup;
    const lookups: Lookup[] = [];

    lookupFields.forEach(lookup => {
      const { lookupRefEntity } = lookup;
      console.log(lookupRefEntity);

      const fieldName = lookup.lookupColumn.fieldName || '';

      if (logicalNames.length > 0) {
        const lookupRef: Relationship | undefined =
          logicalNames.find((ref: Relationship) => {
            if (lookupRefEntity) {
              if (ref.entityNameRef === lookupRefEntity) return true;
            }
            else if (ref.fieldNameRef === fieldName) {
              return true;
            }
          });
        lookups.push({ logicalName: fieldName, reference: lookupRef, options: [] });
      }
    });
    console.log(lookupFields);

    await Promise.all(lookups.map(async lookup => {
      const entityName = lookup.reference ? lookup.reference.entityNameRef : '';
      lookup.entityPluralName = await DataverseService.getEntityPluralName(entityName);
      const options = await DataverseService.getLookupOptions(entityName);
      lookup.options = [...options];
    }));
    console.log(lookups);

    return lookups;
  },
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
