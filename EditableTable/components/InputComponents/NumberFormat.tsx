import { FontIcon, SpinButton, Stack } from '@fluentui/react';
import React, { memo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, numberFormatStyles } from '../../styles/ComponentsStyles';
import { formatCurrency, formatDecimal, formatNumber } from '../../utils/formattingUtils';
import { INumberProps } from '../../utils/types';

export const NumberFormat = memo(({ fieldName, value, rowId, isRequired,
  _onChange, _onDoubleClick, _service } : INumberProps) => {
  const numbers = useAppSelector(state => state.number.numberFieldsMetadata);
  const currencySymbols = useAppSelector(state => state.number.currencySymbols);

  const currentNumber = numbers.find(num => num.fieldName === fieldName);
  const currentCurrency = currencySymbols.find(currency => currency.recordId === rowId) ?? null;

  const onValidate = (value: string): string | void => {
    if (value === '') return '';

    const numberValue = formatNumber(value);
    return currentCurrency
      ? formatCurrency(_service, numberValue, currentNumber?.precision, currentCurrency?.symbol)
      : formatDecimal(_service, numberValue, currentNumber?.precision);
  };

  const onNumberChange = (event: React.SyntheticEvent<HTMLElement>, newValue?: string) => {
    const numberValue = newValue === '' ? null : formatNumber(newValue!);
    _onChange(numberValue, newValue);
  };

  return (
    <Stack>
      <SpinButton
        min={currentNumber?.minValue}
        max={currentNumber?.maxValue}
        precision={currentNumber?.precision ?? 0}
        styles={numberFormatStyles(isRequired)}
        onChange={onNumberChange}
        onValidate={onValidate}
        value={value}
        onDoubleClick={() => _onDoubleClick()}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
    </Stack>
  );
});
