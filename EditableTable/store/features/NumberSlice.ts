import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Field } from '../../hooks/useLoadStore';
import {
  getNumberFieldMetadata,
  getCurrencySymbol,
  openErrorDialog,
} from '../../services/DataverseService';
import store from '../store';
import { setLoading } from './LoadingSlice';

export type NumberFieldMetadata = {
  fieldName: string,
  precision: number,
  minValue: number,
  maxValue: number,
}

export type CurrencySymbol = {
  recordId: string,
  symbol: string
}

interface INumberState {
  numberFieldsMetadata: NumberFieldMetadata[],
  currencySymbols: CurrencySymbol[]
}

const initialState: INumberState = {
  numberFieldsMetadata: [],
  currencySymbols: [],
};

export const getNumberFieldsMetadata = createAsyncThunk<NumberFieldMetadata[], Field[]>(
  'number/getNumberFieldsMetadata',
  async numberFields =>
    await Promise.all(numberFields.map(async numberField => {
      let attributeType, selection: string;

      switch (numberField.data) {
        case 'Currency':
          attributeType = 'MoneyAttributeMetadata';
          selection = 'PrecisionSource,MaxValue,MinValue';
          break;

        case 'Decimal':
          attributeType = 'DecimalAttributeMetadata';
          selection = 'Precision,MaxValue,MinValue';
          break;

        case 'FP':
          attributeType = 'DoubleAttributeMetadata';
          selection = 'Precision,MaxValue,MinValue';
          break;

        default:
          attributeType = 'IntegerAttributeMetadata';
          selection = 'MaxValue,MinValue';
      }

      const currentNumber = await getNumberFieldMetadata(
        numberField.fieldName!,
        attributeType,
        selection);
      return <NumberFieldMetadata>currentNumber;
    })),
);

export const getCurrencySymbols = createAsyncThunk<CurrencySymbol[], string[]>(
  'number/getCurrencySymbols',
  async recordIds =>
    await Promise.all(recordIds.map(async recordId => {
      const currencySymbol = await getCurrencySymbol(recordId);
      return <CurrencySymbol>{
        recordId,
        symbol: currencySymbol,
      };
    })),
);

const NumberSlice = createSlice({
  name: 'number',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getNumberFieldsMetadata.fulfilled, (state, action) => {
      state.numberFieldsMetadata = [...action.payload];
    });

    builder.addCase(getNumberFieldsMetadata.rejected, (state, action) => {
      state.numberFieldsMetadata = [];
      openErrorDialog(action.error).then(() => {
        store.dispatch(setLoading(false));
      });
    });

    builder.addCase(getCurrencySymbols.fulfilled, (state, action) => {
      state.currencySymbols = [...action.payload];
    });

    builder.addCase(getCurrencySymbols.rejected, (state, action) => {
      console.log(action.error);
      state.currencySymbols = [];
    });
  },
});

export default NumberSlice.reducer;
