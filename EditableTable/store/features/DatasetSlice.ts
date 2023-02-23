import { IColumn } from '@fluentui/react';
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Row, isNewRow } from '../../mappers/dataSetMapper';
import { getReqirementLevel } from '../../services/DataverseService';
import { RootState } from '../store';

type Updates = {
  rowKey: string;
  columnName: string;
  newValue: any;
}

export type RequirementLevel = {
  fieldName: string;
  isRequired: boolean;
}

interface IDatasetState {
  rows: Row[],
  newRows: Row[],
  requirementLevels: RequirementLevel[]
}

const initialState: IDatasetState = {
  rows: [],
  newRows: [],
  requirementLevels: [],
};

type AsyncThunkConfig = {
  state: RootState,
};

export const setRequirementLevels = createAsyncThunk<any[], IColumn[], AsyncThunkConfig>(
  'dataset/setRequirementLevels',
  async columns => await Promise.all(columns.map(async column => {
    const isRequired = await getReqirementLevel(column.key) !== 'None';
    return { fieldName: column.key, isRequired };
  })),
);

export const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setRows: (state, action: PayloadAction<Row[]>) => {
      state.rows = action.payload;
    },

    updateRow: (state, action: PayloadAction<Updates>) => {
      const changedRow = state.rows.find(row => row.key === action.payload.rowKey);
      const changedColumn = changedRow!.columns
        .find(column => column.schemaName === action.payload.columnName);

      changedColumn!.rawValue = action.payload.newValue || undefined;
      changedColumn!.formattedValue = action.payload.newValue;
      changedColumn!.lookup = action.payload.newValue;
    },

    addNewRow: (state, action: PayloadAction<Row>) => {
      state.rows.unshift(action.payload);
    },

    readdNewRowsAfterDelete: (state, action: PayloadAction<string[]>) => {
      const newRowsToRemove = action.payload;
      state.newRows = state.rows
        .filter(row => isNewRow(row) && !newRowsToRemove.includes(row.key));
    },

    removeNewRows: state => {
      state.rows = state.rows.filter(row => isNewRow(row));
      state.newRows = [];
    },
  },
  extraReducers: builder => {
    builder.addCase(setRequirementLevels.fulfilled, (state, action) => {
      state.requirementLevels = [...action.payload];
    });

    builder.addCase(setRequirementLevels.rejected, (state, action) => {
      state.requirementLevels = [];
      console.log(action);
    });
  },
});

export const {
  setRows,
  updateRow,
  addNewRow,
  readdNewRowsAfterDelete,
  removeNewRows,
} = datasetSlice.actions;

export default datasetSlice.reducer;
