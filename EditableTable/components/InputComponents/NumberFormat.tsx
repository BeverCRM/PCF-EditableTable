import { ISpinButtonStyles, SpinButton, Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import { formatCurrency, formatDecimal, formatNumber } from '../../utils/formattingUtils';

export interface INumberProps {
  fieldName: string | undefined;
  value: string;
  rowId?: string;
  _onChange: Function;
}

export const NumberFormat = ({ fieldName, value, rowId, _onChange } : INumberProps) => {
  const styles: Partial<ISpinButtonStyles> = {
    arrowButtonsContainer: {
      display: 'none',
    },
    spinButtonWrapper: {
      maxWidth: '150px',
    },
  };

  const numbers = useAppSelector(state => state.number.numberFieldsMetadata);
  const currencySymbols = useAppSelector(state => state.number.currencySymbols);

  const currentNumber = numbers.find(num => num.fieldName === fieldName);
  const currentCurrency = currencySymbols.find(currency => currency.recordId === rowId) ?? null;

  const onValidate = (value: string): string | void => {
    const numberValue = formatNumber(value);
    return currentCurrency
      ? formatCurrency(numberValue, currentNumber?.precision, currentCurrency?.symbol)
      : formatDecimal(numberValue, currentNumber?.precision);
  };

  const onNumberChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
    const numberValue = formatNumber(newValue!);
    _onChange(numberValue, newValue);
  };

  return (
    <Stack>
      <SpinButton
        // defaultValue={value}
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
