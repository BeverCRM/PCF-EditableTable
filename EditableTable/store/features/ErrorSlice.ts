import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
});

export const { setInvalid, setInvalidFields } = ErrorSlice.actions;

export default ErrorSlice.reducer;
