/* eslint-disable react/display-name */
import { FontIcon, SpinButton, Stack } from '@fluentui/react';
import React, { memo } from 'react';
import { IDataverseService } from '../../services/DataverseService';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  asteriskClassStyle,
  numberFormatStyles,
} from '../../styles/ComponentsStyles';
import { formatCurrency, formatDecimal, formatNumber } from '../../utils/formattingUtils';
import { CurrencySymbol, NumberFieldMetadata } from '../../store/features/NumberSlice';
import { ErrorIcon } from '../ErrorIcon';
import { setInvalidFields } from '../../store/features/ErrorSlice';

export interface INumberProps {
  fieldId: string;
  fieldName: string | undefined;
  value: string;
  rowId?: string;
  isRequired: boolean;
  isDisabled: boolean;
  isSecured: boolean;
  _onChange: Function;
  _service: IDataverseService;
}

export const NumberFormat = memo(({ fieldId, fieldName, value, rowId, isRequired, isDisabled,
  isSecured, _onChange, _service } : INumberProps) => {
  const dispatch = useAppDispatch();

  const numbers = useAppSelector(state => state.number.numberFieldsMetadata);
  const currencySymbols = useAppSelector(state => state.number.currencySymbols);
  const changedRecords = useAppSelector(state => state.record.changedRecords);
  const changedRecord = changedRecords.find(transaction => transaction.id === rowId);
  const changedTransactionId = changedRecord?.data.find(data =>
    data.fieldName === 'transactioncurrencyid');

  let currentCurrency: CurrencySymbol | null = null;
  const currentNumber = numbers.find(num => num.fieldName === fieldName);
  if (changedTransactionId?.newValue) {
    const transactionId = changedTransactionId.newValue.match(/\(([^)]+)\)/)[1];
    _service.getCurrencyById(transactionId).then(result => {
      currentCurrency = { recordId: rowId || '',
        symbol: result.symbol,
        precision: result.precision };
    });
  }

  if (currentCurrency === null) {
    currentCurrency = currencySymbols.find(currency => currency.recordId === rowId) ?? null;
  }

  function changeNumberFormat(currentCurrency: CurrencySymbol | null,
    currentNumber: NumberFieldMetadata | undefined,
    precision: number | undefined,
    newValue?: string) {
    const numberValue = formatNumber(_service, newValue!);
    const stringValue = currentCurrency && currentNumber?.isBaseCurrency !== undefined
      ? formatCurrency(_service, numberValue || 0,
        precision, currentCurrency?.symbol)
      : formatDecimal(_service, numberValue || 0, currentNumber?.precision);
    _onChange(numberValue, stringValue);
  }

  const onNumberChange = (newValue?: string) => {
    if (newValue === '') {
      _onChange(null, '');
    }
    else if (currentCurrency && currentNumber) {
      if (currentNumber?.precision === 2) {
        changeNumberFormat(currentCurrency, currentNumber, currentCurrency.precision, newValue);
      }
      else {
        changeNumberFormat(currentCurrency, currentNumber, currentNumber.precision, newValue);
      }
    }
    else {
      changeNumberFormat(currentCurrency, currentNumber, currentNumber?.precision, newValue);
    }
  };

  const checkValidation = (newValue: string) => {
    if (isRequired && !newValue) {
      dispatch(setInvalidFields({ fieldId, isInvalid: true,
        errorMessage: 'Required fields must be filled in.' }));
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
        disabled={currentNumber?.isBaseCurrency || isDisabled || isSecured}
        title={value}
        onBlur={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const elem = event.target as HTMLInputElement;
          if (value !== elem.value) {
            onNumberChange(elem.value);
          }
          checkValidation(elem.value);
        }}
        onFocus={() => dispatch(setInvalidFields({ fieldId, isInvalid: false, errorMessage: '' }))}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
      <ErrorIcon id={fieldId} isRequired={isRequired} />
    </Stack>
  );
});
