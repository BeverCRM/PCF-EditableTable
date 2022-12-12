import { ISpinButtonStyles, SpinButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { shallowEqual } from 'react-redux';
import { CurrencySymbol, Number } from '../Store/Features/NumberSlice';
import { useAppSelector } from '../Store/Hooks';

export interface IInputNumberProps {
  fieldName: string | undefined;
  defaultValue: string;
  type: string;
  rowId?: string;
  onNumberChange: any
}

export const InputNumber = ({ fieldName,
  defaultValue, rowId, onNumberChange } : IInputNumberProps) => {
  const styles: Partial<ISpinButtonStyles> = { arrowButtonsContainer: { display: 'none' }, spinButtonWrapper: { maxWidth: '150px' } };
  const [val, setVal] = React.useState<string>(defaultValue);
  const [currentNumber, setCurrentNumber] = React.useState<Number>();
  const [currentCurrency, setCurrentCurrency] = React.useState<CurrencySymbol>();

  const numbers: Number[] = useAppSelector(state => state.number.numbers, shallowEqual);
  const currencySymbols: CurrencySymbol[] = useAppSelector(state => state.number.currencySymbols, shallowEqual);

  React.useEffect(() => {
    const number = numbers.find(num => num.fieldName === fieldName);
    console.log(number);
    setCurrentNumber(number);
  }, [numbers]);

  React.useEffect(() => {
    if(rowId !== undefined) {
      let currentCurrency = currencySymbols.find(currency => { return currency.recordId === rowId});
      setCurrentCurrency(currentCurrency);
      //number.symbol = currentCurrency?.symbol;
    }
  })
  
  const _onValidate = (value: string, event?: React.SyntheticEvent<HTMLElement>): string | void => {
    console.log(event);
    if(value.slice(0,1) === currentCurrency?.symbol){
      value.slice(1);
    }
    return String(parseFloat(value).toFixed(currentNumber?.precision));
  };

  const _onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
    console.log(newValue);
    if (newValue !== undefined && newValue !== null) {
      setVal(currentCurrency?.symbol + parseFloat(newValue).toFixed(currentNumber?.precision));
      onNumberChange(parseFloat(parseFloat(newValue).toFixed(currentNumber?.precision)));
    }
  };

  return (
    <Stack>
      <SpinButton
        defaultValue={currentCurrency?.symbol + defaultValue}
        min={currentNumber?.minValue}
        max={currentNumber?.maxValue}
        precision={currentNumber?.precision}
        styles={styles}
        onChange={_onChange}
        onValidate={_onValidate}
        value={val}
      />
    </Stack>
  );
};
