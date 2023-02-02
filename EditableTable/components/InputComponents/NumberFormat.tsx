import { SpinButton, Stack } from '@fluentui/react';
import React, { memo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { numberFormatStyles } from '../../styles/ComponentsStyles';
import { formatCurrency, formatDecimal, formatNumber } from '../../utils/formattingUtils';

export interface INumberProps {
  fieldName: string | undefined;
  value: string;
  rowId?: string;
  _onChange: Function;
  _onDoubleClick: Function;
}

export const NumberFormat = memo(({ fieldName, value, rowId,
  _onChange, _onDoubleClick } : INumberProps) => {
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
        min={currentNumber?.minValue}
        max={currentNumber?.maxValue}
        precision={currentNumber?.precision ?? 0}
        styles={numberFormatStyles}
        onChange={onNumberChange}
        onValidate={onValidate}
        value={value}
        onDoubleClick={() => _onDoubleClick()}
        // onClick={(event: any) => {
        //   if (event.detail === 2) {
        //     _onDoubleClick();
        //   }
        // }}
      />
    </Stack>
  );
});
