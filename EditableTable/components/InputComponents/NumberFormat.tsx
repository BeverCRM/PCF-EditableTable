import { ISpinButtonStyles, SpinButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { CurrencySymbol, NumberFieldMetadata } from '../../store/features/NumberSlice';
import { useAppSelector } from '../../store/hooks';

export interface IInputNumberProps {
  fieldName: string | undefined;
  defaultValue: string;
  type: string;
  rowId?: string;
  _onChange: any
}

export const NumberFormat = ({ fieldName,
  defaultValue, rowId, _onChange } : IInputNumberProps) => {
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
    setCurrentNumber(number);
  }, [numbers]);

  React.useEffect(() => {
    if (rowId !== undefined) {
      const currentCurrency = currencySymbols.find(currency => currency.recordId === rowId);
      setCurrentCurrency(currentCurrency);
    }
  });

  const onValidate = (value: string): string | void => {
    let newValue = value;
    if (value.slice(0, 1) === currentCurrency?.symbol) {
      newValue = value.slice(1);
    }
    return String(parseFloat(newValue).toFixed(currentNumber?.precision));
  };

  const onNumberChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
    if (newValue !== undefined && newValue !== null) {
      setVal(currentCurrency?.symbol !== undefined
        ? currentCurrency?.symbol + newValue
        : newValue);
      _onChange(parseFloat(parseFloat(newValue).toFixed(currentNumber?.precision)));
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
        onChange={onNumberChange}
        onValidate={onValidate}
        value={val}
      />
    </Stack>
  );
};
