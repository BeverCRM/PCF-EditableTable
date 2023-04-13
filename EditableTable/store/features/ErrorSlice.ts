import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IErrorState {
  isInvalid: boolean;
  errorMessage: string;
}

const initialState: IErrorState = {
  isInvalid: false,
  errorMessage: '',
};

export const ErrorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setInvalid: (state, action: PayloadAction<boolean>) => {
      state.isInvalid = action.payload;
    },
  },
});

export const { setInvalid } = ErrorSlice.actions;

export default ErrorSlice.reducer;
