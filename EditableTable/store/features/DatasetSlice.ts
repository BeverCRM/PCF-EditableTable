import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Row } from '../../mappers/dataSetMapper';

export type updates = {
  rowKey: string;
  columnName: string;
  newValue: any;
}

interface IDatasetState {
  rows: Row[],
  newRows: Row[],
}

const initialState: IDatasetState = {
  rows: [],
  newRows: [],
};

export const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {
    setRows: (state, action: PayloadAction<Row[]>) => {
      state.rows = action.payload;
    },
    updateRow: (state, action: PayloadAction<updates>) => {
      state.rows.find(row => {
        if (row.key === action.payload.rowKey) {
          row.columns.find(column => {
            if (column.schemaName === action.payload.columnName) {
              column.rawValue = action.payload.newValue || undefined;
              column.formattedValue = action.payload.newValue;
              column.lookup = action.payload.newValue;
            }
          });
        }
      });
    },
    addNewRow: (state, action: PayloadAction<Row>) => {
      state.rows.unshift(action.payload);
    },
    readdNewRowsAfterDelete: (state, action: PayloadAction<string[]>) => {
      const rowsToRemove = new Set(action.payload);
      state.newRows = state.rows.filter(row => !rowsToRemove.has(row.key) && row.key.length < 15);
    },
    removeNewRows: state => {
      state.rows = state.rows.filter(row => row.key.length > 15);
      state.newRows = [];
    },
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
