import { createAsyncThunk, createSlice,
  isAnyOf, isPending, PayloadAction } from '@reduxjs/toolkit';
import { Row } from '../../mappers/dataSetMapper';
import { EntityPrivileges, IDataverseService } from '../../services/DataverseService';

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

export type InactiveRecord = {
  recordId: string;
  isInactive: boolean;
}

export interface IDatasetState {
  rows: Row[],
  newRows: Row[],
  requirementLevels: RequirementLevel[],
  entityPrivileges: EntityPrivileges,
  calculatedFields: CalculatedField[],
  securedFields: FieldSecurity[],
  inactiveRecords: InactiveRecord[],
  isPending: boolean,
}

const initialState: IDatasetState = {
  rows: [],
  newRows: [],
  requirementLevels: [],
  entityPrivileges: <EntityPrivileges>{},
  calculatedFields: [],
  securedFields: [],
  inactiveRecords: [],
  isPending: true,
};

type DatasetPayload = {
  columnKeys: string[],
  _service: IDataverseService,
}

type RecordsPayload = {
  recordIds: string[],
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

export const setSecuredFields = createAsyncThunk<FieldSecurity[], DatasetPayload>(
  'dataset/setSecuredFields',
  async payload => await Promise.all(payload.columnKeys.map(async columnKey => {
    let hasUpdateAccess = true;

    const isFieldSecured = await payload._service.isFieldSecured(columnKey);
    if (!isFieldSecured) {
      return { fieldName: columnKey, hasUpdateAccess };
    }

    const hasReadAccess = await payload._service.checkFieldPermissionEntityAccess();
    if (!hasReadAccess) {
      return { fieldName: columnKey, hasUpdateAccess };
    }

    const fieldPermissionRecord =
    await payload._service.getUserRelatedFieldServiceProfile(columnKey);

    if (fieldPermissionRecord.entities.length > 0) {
      fieldPermissionRecord.entities.forEach(entity => {
        if (entity.canupdate === 4) {
          return { fieldName: columnKey, hasUpdateAccess: true };
        }
        hasUpdateAccess = false;
      });
      return { fieldName: columnKey, hasUpdateAccess };
    }

    if (fieldPermissionRecord.entities.length === 0 && isFieldSecured) {
      return { fieldName: columnKey, hasUpdateAccess: false };
    }

    return { fieldName: columnKey, hasUpdateAccess };
  })),
);

export const setInactiveRecords = createAsyncThunk<InactiveRecord[], RecordsPayload>(
  'dataset/setInactiveRecords',
  async payload => await Promise.all(payload.recordIds.map(async recordId => {
    const isEditable = await payload._service.isRecordEditable(recordId);
    return { recordId, isInactive: !isEditable };
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

    builder.addCase(setInactiveRecords.fulfilled, (state, action) => {
      state.inactiveRecords = [...action.payload];
    });

    builder.addMatcher(isAnyOf(isPending(setSecuredFields, setRequirementLevels,
      setCalculatedFields, setEntityPrivileges, setInactiveRecords)), state => {
      state.isPending = true;
    });

    builder.addMatcher(isAnyOf(setSecuredFields.fulfilled, setSecuredFields.rejected), state => {
      state.isPending = false;
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
