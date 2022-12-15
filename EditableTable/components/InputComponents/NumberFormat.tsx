import { ISpinButtonStyles, SpinButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { CurrencySymbol, NumberFieldMetadata } from '../../store/features/NumberSlice';
import { useAppSelector } from '../../store/hooks';

export interface IInputNumberProps {
  fieldName: string | undefined;
  defaultValue: string;
  type: string;
  rowId?: string;
  onNumberChange: any
}

export const NumberFormat = ({ fieldName,
  defaultValue, rowId, onNumberChange } : IInputNumberProps) => {
  const styles: Partial<ISpinButtonStyles> = {
    arrowButtonsContainer: {
      display: 'none',
    },
    spinButtonWrapper: {
      maxWidth: '150px',
    },
  };
  const [val, setVal] = React.useState(defaultValue);
  const [currentNumber, setCurrentNumber] = React.useState<NumberFieldMetadata>();
  const [currentCurrency, setCurrentCurrency] = React.useState<CurrencySymbol>();

  const numbers = useAppSelector(state => state.number.numberFieldsMetadata);
  const currencySymbols = useAppSelector(state => state.number.currencySymbols);

  React.useEffect(() => {
    const number = numbers.find(num => num.fieldName === fieldName);
    console.log(number);
    setCurrentNumber(number);
  }, [numbers]);

  React.useEffect(() => {
    if (rowId !== undefined) {
      const currentCurrency = currencySymbols.find(currency => currency.recordId === rowId);
      setCurrentCurrency(currentCurrency);
    }
  });

  const _onValidate = (value: string): string | void => {
    if (value.slice(0, 1) === currentCurrency?.symbol) {
      value = value.slice(1);
    }
    return String(parseFloat(value).toFixed(currentNumber?.precision));
  };

  const _onChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
    console.log(newValue);
    if (newValue !== undefined && newValue !== null) {
      setVal(currentCurrency?.symbol !== undefined
        ? currentCurrency?.symbol + newValue
        : newValue);
      onNumberChange(parseFloat(parseFloat(newValue).toFixed(currentNumber?.precision)));
    }
  };

  return (
    <Stack>
      <SpinButton
        defaultValue={currentCurrency?.symbol !== undefined
          ? currentCurrency?.symbol
          : `${defaultValue}`}
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
