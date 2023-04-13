import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Field } from '../../hooks/useLoadStore';
import { IDataverseService } from '../../services/DataverseService';

export type TextMetadata = {
  fieldName: string,
  textMaxLength: number
}

export interface ITextState {
  textFields: TextMetadata[]
}

const initialState: ITextState = {
  textFields: [],
};

type TextMetadataPayload = {
  textFields: Field[],
  _service: IDataverseService
};

export const getTextMetadata = createAsyncThunk<TextMetadata[], TextMetadataPayload>(
  'text/getTextMetadata',
  async payload =>
    await Promise.all(payload.textFields.map(async textField => {
      const maxLength = await payload._service.getTextFieldMetadata(textField.key, textField.data);

      return {
        fieldName: textField.key,
        textMaxLength: maxLength,
      };
    })),
);

export const TextSlice = createSlice({
  name: 'text',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder.addCase(getTextMetadata.fulfilled, (state, action) => {
      state.textFields = [...action.payload];
    });

    builder.addCase(getTextMetadata.rejected, state => {
      state.textFields.push({ fieldName: '', textMaxLength: 100 });
    });
  },
});

export default TextSlice.reducer;
