import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { openErrorDialog } from '../../services/DataverseService';

export type DynamicsError = {
  code: number,
  errorCode: number,
  message: string,
  raw: string,
  title: string
};

interface IErrorState {
  error: boolean
}

const initialState: IErrorState = {
  error: false,
};

export const showErrorDialog = createAsyncThunk<void, DynamicsError>(
  'error/showErrorDialog',
  async errorMessage => {
    await openErrorDialog({ errorCode: errorMessage.errorCode, details: errorMessage.raw });
  },
);

const ErrorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(showErrorDialog.fulfilled, state => {
      state.error = true;
    });
    builder.addCase(showErrorDialog.rejected, action => {
      action.error;
    });
  },
});

export default ErrorSlice.reducer;
