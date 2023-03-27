import { FontIcon, SpinButton, Stack } from '@fluentui/react';
import React, { memo } from 'react';
import { IDataverseService } from '../../services/DataverseService';
import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, numberFormatStyles } from '../../styles/ComponentsStyles';
import { formatCurrency, formatDecimal, formatNumber } from '../../utils/formattingUtils';

export interface INumberProps {
  fieldName: string | undefined;
  value: string;
  rowId?: string;
  isRequired: boolean;
  _onChange: Function;
  _onDoubleClick: Function;
  _service: IDataverseService;
}

export const NumberFormat = memo(({ fieldName, value, rowId, isRequired,
  _onChange, _onDoubleClick, _service } : INumberProps) => {
  const numbers = useAppSelector(state => state.number.numberFieldsMetadata);
  const currencySymbols = useAppSelector(state => state.number.currencySymbols);

  const currentNumber = numbers.find(num => num.fieldName === fieldName);
  const currentCurrency = currencySymbols.find(currency => currency.recordId === rowId) ?? null;

  const onNumberChange = (newValue?: string) => {
    if (newValue === '') {
      _onChange(null, '');
    }
    else {
      const numberValue = formatNumber(newValue!);
      const stringValue = currentCurrency
        ? formatCurrency(_service, numberValue || 0,
          currentNumber?.precision, currentCurrency?.symbol)
        : formatDecimal(_service, numberValue || 0, currentNumber?.precision);
      _onChange(numberValue, stringValue);
    }
  };

  return (
    <Stack>
      <SpinButton
        min={currentNumber?.minValue}
        max={currentNumber?.maxValue}
        precision={currentNumber?.precision ?? 0}
        styles={numberFormatStyles(isRequired)}
        value={value}
        onDoubleClick={() => _onDoubleClick()}
        onBlur={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const elem = event.target as HTMLInputElement;
          console.log(elem.value);
          onNumberChange(elem.value);
        }}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
    </Stack>
  );
});
