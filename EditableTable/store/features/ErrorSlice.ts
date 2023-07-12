import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { AsyncThunkConfig } from '../../utils/types';

export type InvalidField = {
  rowId: string;
  fieldName: string;
};

export interface IErrorState {
  isInvalid: boolean;
  invalidFields: InvalidField[];
  errorMessage: string;
}

const initialState: IErrorState = {
  isInvalid: false,
  invalidFields: [],
  errorMessage: '',
};

// export const checkFieldsValidity = createAsyncThunk<InvalidField[], void, AsyncThunkConfig>(
//   'error/checkFieldsValidity',
//   async (thunkApi) => {
//     const { changedRecords } = thunkApi.getState().record;
//     const { requirementLevels } = thunkApi.getState().dataset;

//     return [];
//   },
// );

export const ErrorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setInvalid: (state, action: PayloadAction<boolean>) => {
      state.isInvalid = action.payload;
    },
    setInvalidFields: (state, action: PayloadAction<InvalidField[]>) => {
      state.invalidFields = action.payload;
    },
  },
  // extraReducers(builder) {
  //   builder.addCase(checkFieldsValidity.fulfilled, (state, action) => {
  //     state.invalidFields = action.payload;
  //   });
  // },
});

export const { setInvalid, setInvalidFields } = ErrorSlice.actions;

export default ErrorSlice.reducer;
