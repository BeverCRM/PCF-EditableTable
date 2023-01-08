import { ISpinButtonStyles, SpinButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';

export interface IInputNumberProps {
  fieldName: string | undefined;
  defaultValue: string;
  type: string;
  rowId?: string;
  _onChange: Function;
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
  const [value, setValue] = React.useState<string>(defaultValue);
  // const [currentCurrency, setCurrentCurrency] = React.useState<CurrencySymbol>();

  const numbers = useAppSelector(state => state.number.numberFieldsMetadata);
  const currencySymbols = useAppSelector(state => state.number.currencySymbols);

  const currentNumber = numbers.find(num => num.fieldName === fieldName);
  const currentCurrency = currencySymbols.find(currency => currency.recordId === rowId) ?? null;

  const onValidate = (value: string): string | void => {
    const newValue = value.slice(0, 1) === currentCurrency?.symbol ? value.slice(1) : value;
    return String(parseFloat(newValue).toFixed(currentNumber?.precision));
  };

  const onNumberChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
    if (newValue !== undefined && newValue !== null) {
      setValue(currentCurrency?.symbol !== undefined
        ? currentCurrency?.symbol + newValue
        : newValue);
      _onChange(parseFloat(parseFloat(newValue).toFixed(currentNumber?.precision)), newValue);
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
        value={value}
      />
    </Stack>
  );
};
