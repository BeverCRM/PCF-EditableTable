import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Row, isNewRow } from '../../mappers/dataSetMapper';
import { EntityPrivileges, IDataverseService } from '../../services/DataverseService';
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
  requirementLevels: RequirementLevel[],
  entityPrivileges: EntityPrivileges,
}

const initialState: IDatasetState = {
  rows: [],
  newRows: [],
  columns: [],
  requirementLevels: [],
  entityPrivileges: <EntityPrivileges>{},
};

type DatasetPayload = {
  columnKeys: string[],
  _service: IDataverseService,
}

export const setRequirementLevels = createAsyncThunk<any[], DatasetPayload>(
  'dataset/setRequirementLevels',
  async payload => await Promise.all(payload.columnKeys.map(async columnKey => {
    const isRequired = await payload._service.getReqirementLevel(columnKey) !== 'None';
    return { fieldName: columnKey, isRequired };
  })),
);

export const setEntityPrivileges = createAsyncThunk<EntityPrivileges, IDataverseService>(
  'dataset/setEntityPrivileges',
  async _service => await _service.getSecurityPrivileges(),
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

    readdNewRowsAfterDelete: (state, action: PayloadAction<Row[]>) => {
      state.newRows = action.payload;
    },

    removeNewRows: state => {
      state.newRows = [];
    },
  },
  extraReducers: builder => {
    builder.addCase(setRequirementLevels.fulfilled, (state, action) => {
      state.requirementLevels = [...action.payload];
    });

    builder.addCase(setRequirementLevels.rejected, state => {
      state.requirementLevels = [];
    });

    builder.addCase(setEntityPrivileges.fulfilled, (state, action) => {
      state.entityPrivileges = { ...action.payload };
    });

    builder.addCase(setEntityPrivileges.rejected, state => {
      state.entityPrivileges = <EntityPrivileges>{};
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
