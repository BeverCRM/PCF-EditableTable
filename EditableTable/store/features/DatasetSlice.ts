import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Row, isNewRow } from '../../mappers/dataSetMapper';

type Updates = {
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
});

export const {
  setRows,
  updateRow,
  addNewRow,
  readdNewRowsAfterDelete,
  removeNewRows,
} = datasetSlice.actions;

export default datasetSlice.reducer;
