import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type InvalidField = {
  fieldId: string;
  isInvalid: boolean;
  errorMessage: string;
};

export interface IErrorState {
  invalidFields: InvalidField[];
  isError: boolean;
}

const initialState: IErrorState = {
  invalidFields: [],
  isError: false,
};

export const ErrorSlice = createSlice({
  name: 'error',
  initialState,
  reducers: {
    setInvalidFields: (state, action: PayloadAction<InvalidField>) => {
      const { invalidFields } = state;
      const field = invalidFields.find(field => field.fieldId === action.payload.fieldId);

      if (field === undefined) {
        state.invalidFields.push(action.payload);
      }
      else {
        state.invalidFields = invalidFields.map(elem => {
          if (elem.fieldId === field.fieldId) {
            return action.payload;
          }
          return elem;
        });
      }

      if (state.invalidFields.some(field => field.isInvalid)) {
        state.isError = true;
      }
      else {
        state.isError = false;
      }
    },

    clearInvalidFields: state => {
      state.invalidFields = [];
      state.isError = false;
    },
  },
});

export const { setInvalidFields, clearInvalidFields } = ErrorSlice.actions;

export default ErrorSlice.reducer;
