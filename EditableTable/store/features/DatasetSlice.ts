import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Row, isNewRow } from '../../mappers/dataSetMapper';
import { IDataverseService } from '../../services/DataverseService';
import { AsyncThunkConfig } from '../../utils/types';

export type DatasetColumn = {
  name: string;
  fieldName: string;
  minWidth: number;
  key: string;
  isResizable: boolean;
  data: string;
  calculatedWidth: number;
}

export type RequirementLevel = {
  fieldName: string;
  isRequired: boolean;
}

export type Updates = {
  rowKey: string;
  columnName: string;
  newValue: any;
}

export interface IDatasetState {
  rows: Row[],
  newRows: Row[],
  columns: DatasetColumn[],
  requirementLevels: RequirementLevel[]
}

const initialState: IDatasetState = {
  rows: [],
  newRows: [],
  columns: [],
  requirementLevels: [],
};

type DatasetPayload = {
  columnKeys: string[],
  _service: IDataverseService,
}

export const setRequirementLevels = createAsyncThunk<any[], DatasetPayload, AsyncThunkConfig>(
  'dataset/setRequirementLevels',
  async payload => await Promise.all(payload.columnKeys.map(async columnKey => {
    const isRequired = await payload._service.getReqirementLevel(columnKey) !== 'None';
    return { fieldName: columnKey, isRequired };
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
    setColumns: (state, action: PayloadAction<DatasetColumn[]>) => {
      state.columns = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setRequirementLevels.fulfilled, (state, action) => {
      state.requirementLevels = [...action.payload];
    });

    builder.addCase(setRequirementLevels.rejected, state => {
      state.requirementLevels = [];
    });
  },
});

export const {
  setRows,
  updateRow,
  addNewRow,
  readdNewRowsAfterDelete,
  removeNewRows,
  setColumns,
  // resizeColumn,
} = datasetSlice.actions;

export default datasetSlice.reducer;
