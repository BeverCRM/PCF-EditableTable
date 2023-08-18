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

export type CalculatedField = {
  fieldName: string;
  isCalculated: boolean;
}

export type Updates = {
  rowKey: string;
  columnName: string;
  newValue: any;
}

export type FieldSecurity = {
  fieldName: string;
  hasUpdateAccess: boolean;
}

export interface IDatasetState {
  rows: Row[],
  newRows: Row[],
  columns: DatasetColumn[],
  requirementLevels: RequirementLevel[],
  entityPrivileges: EntityPrivileges,
  calculatedFields: CalculatedField[],
  securedFields: FieldSecurity[],
}

const initialState: IDatasetState = {
  rows: [],
  newRows: [],
  columns: [],
  requirementLevels: [],
  entityPrivileges: <EntityPrivileges>{},
  calculatedFields: [],
  securedFields: [],
};

type DatasetPayload = {
  columnKeys: string[],
  _service: IDataverseService,
}

export const setCalculatedFields = createAsyncThunk<CalculatedField[], DatasetPayload>(
  'dataset/setCalculatedFields',
  async payload => await Promise.all(payload.columnKeys.map(async columnKey => {
    const isCalculated = await payload._service.isCalculatedField(columnKey);
    return { fieldName: columnKey, isCalculated };
  })),
);

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

export const setSecuredFields = createAsyncThunk<any[], DatasetPayload>(
  'dataset/setSecuredFields',
  async payload => await Promise.all(payload.columnKeys.map(async columnKey => {
    const fieldPermissionRecord =
    await payload._service.getUserRelatedFieldServiceProfile(columnKey);
    if (fieldPermissionRecord.entities.length > 0) {
      const hasUpdateAccess = fieldPermissionRecord.entities[0].canupdate;
      return { fieldName: columnKey, hasReadAccess: hasUpdateAccess === 0 };
    }
    return { fieldName: columnKey, hasReadAccess: false };
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

    readdNewRowsAfterDelete: (state, action: PayloadAction<Row[]>) => {
      state.newRows = action.payload;
    },

    removeNewRows: state => {
      state.newRows = [];
    },

    setColumns: (state, action: PayloadAction<DatasetColumn[]>) => {
      state.columns = action.payload;
    },
  },
  extraReducers: builder => {
    builder.addCase(setCalculatedFields.fulfilled, (state, action) => {
      state.calculatedFields = [...action.payload];
    });

    builder.addCase(setCalculatedFields.rejected, state => {
      state.calculatedFields = [];
    });

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

    builder.addCase(setSecuredFields.fulfilled, (state, action) => {
      state.securedFields = [...action.payload];
    });

    builder.addCase(setSecuredFields.rejected, state => {
      state.securedFields = [];
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
} = datasetSlice.actions;

export default datasetSlice.reducer;
