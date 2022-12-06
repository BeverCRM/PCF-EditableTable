import { IColumn } from '@fluentui/react';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import DataverseService from '../../Services/DataverseService';
import { RootState } from '../Store';

export type Number = {
  fieldName: string,
  precision: number, 
  minValue: number, 
  maxValue: number,
  attributeType: string,
  selection: string 
}

interface INumberState {
  numbers: Number[]
}
const initialState: INumberState = {
  numbers: []
}

const NumberSlice = createSlice({
  name: "number",
  initialState,
  reducers: {    
  },
  extraReducers(builder) {
    builder.addCase(setNumber.fulfilled, (state, action) => {
      console.log("%c"+"NUMBER: "+action.payload, "color: red");
      state.numbers = [...action.payload];
      console.table(state.numbers);
    }),
    builder.addCase(setNumber.rejected, (state, action) => {
      console.log(state, action);
      state.numbers = [];
    })
  },
});

type AsyncThunkConfig = {
  state: RootState
};

export const setNumber = createAsyncThunk<Number[], IColumn[], AsyncThunkConfig>(
  'record/setNumber', 
  async (numberFields, thunkApi) => {
    console.log(numberFields, thunkApi);
    const numbers = numberFields.map(number => {
      let attributeType, selection : string;
      
      switch (number.data) {
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

      return {fieldName: number.fieldName, attributeType, selection} as Number;
    });

    let allNumbers = await Promise.all(numbers.map(async number => { let currentNumber = await DataverseService.getNumber(number.fieldName, number.attributeType, number.selection)
      // number = {fieldName: number.fieldName, attributeType: number.attributeType, selection: number.selection, ...currentNumber}; 
      number = Object.assign(number,currentNumber);
    }));
    console.log(allNumbers);
    return numbers;
  }   
);


// export const { } = NumberSlice.actions;

export default NumberSlice.reducer;