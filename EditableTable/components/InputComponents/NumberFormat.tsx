/* eslint-disable react/display-name */
import { FontIcon, SpinButton, Stack } from '@fluentui/react';
import React, { memo, useState } from 'react';
import { IDataverseService } from '../../services/DataverseService';
import { useAppSelector } from '../../store/hooks';
import {
  asteriskClassStyle,
  errorTooltip,
  numberFormatStyles,
} from '../../styles/ComponentsStyles';
import { formatCurrency, formatDecimal, formatNumber } from '../../utils/formattingUtils';
import { CurrencySymbol, NumberFieldMetadata } from '../../store/features/NumberSlice';

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
  const [isInvalid, setInvalid] = useState(false);
  const errorText = 'Required fields must be filled in.';
  const numbers = useAppSelector(state => state.number.numberFieldsMetadata);
  const currencySymbols = useAppSelector(state => state.number.currencySymbols);
  const changedRecords = useAppSelector(state => state.record.changedRecords);
  const changedRecord = changedRecords.find(transaction => transaction.id === rowId);
  const changedTransactionId = changedRecord?.data.find(data =>
    data.fieldName === 'transactioncurrencyid');

  // const currentLookup = lookups.find(lookup => lookup.);
  // const options = currentLookup?.options ?? [];
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
    else {
      let precision = 0;
      if (currentCurrency && currentNumber) {
        if (currentNumber?.precision === 1) {
          _service.getGlobbalPrecision().then(result => {
            precision = result;
            changeNumberFormat(currentCurrency, currentNumber, precision, newValue);
          });
        }
        else if (currentNumber?.precision === 2) {
          precision = currentNumber?.precisionNumber;
          changeNumberFormat(currentCurrency, currentNumber, currentCurrency.precision, newValue);
        }
        else {
          changeNumberFormat(currentCurrency, currentNumber, currentNumber.precision, newValue);
        }
      }
      // changeNumberFormat(currentCurrency, currentNumber, currentNumber?.precision, newValue);
    }
  };

  const checkValidation = (newValue: string) => {
    if (isRequired && !newValue) {
      setInvalid(true);
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
        disabled={currentNumber?.isBaseCurrency}
        onDoubleClick={() => _onDoubleClick()}
        onBlur={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const elem = event.target as HTMLInputElement;
          onNumberChange(elem.value);
          checkValidation(elem.value);
        }}
        onFocus={() => setInvalid(false)}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
      <FontIcon iconName={'StatusErrorFull'} className={errorTooltip(isInvalid, errorText)} />
    </Stack>
  );
});
