import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Field } from '../../hooks/useLoadStore';
import { IDataverseService } from '../../services/DataverseService';

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

export interface INumberState {
  numberFieldsMetadata: NumberFieldMetadata[],
  currencySymbols: CurrencySymbol[]
}

const initialState: INumberState = {
  numberFieldsMetadata: [],
  currencySymbols: [],
};
type NumberPayload = {
  numberFields: Field[],
  _service: IDataverseService,
};

type CurrencyPayload = { recordIds: string[], _service: IDataverseService };

export const getNumberFieldsMetadata = createAsyncThunk<NumberFieldMetadata[], NumberPayload>(
  'number/getNumberFieldsMetadata',
  async payload =>
    await Promise.all(payload.numberFields.map(async numberField => {
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

      const currentNumber = await payload._service.getNumberFieldMetadata(
        numberField.fieldName!,
        attributeType,
        selection);
      return <NumberFieldMetadata>currentNumber;
    })),
);

export const getCurrencySymbols = createAsyncThunk<CurrencySymbol[], CurrencyPayload>(
  'number/getCurrencySymbols',
  async payload =>
    await Promise.all(payload.recordIds.map(async recordId => {
      const currencySymbol = await payload._service.getCurrencySymbol(recordId);
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

    builder.addCase(getNumberFieldsMetadata.rejected, state => {
      state.numberFieldsMetadata = [];
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
