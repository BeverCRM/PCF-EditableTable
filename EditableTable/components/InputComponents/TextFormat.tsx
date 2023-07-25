/* eslint-disable react/display-name */
import { FontIcon, Stack, TextField } from '@fluentui/react';
import React, { memo, useState } from 'react';
import { asteriskClassStyle, errorTooltip, textFieldStyles } from '../../styles/ComponentsStyles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setInvalid } from '../../store/features/ErrorSlice';

export type errorProp = {
  isInvalid: boolean,
  errorText: string
};

export interface ITextProps {
  index: number | undefined,
  fieldName: string,
  value: string | undefined,
  ownerValue: string | undefined,
  isDisabled?: boolean,
  isRequired: boolean,
  _onChange: Function,
}

export const TextFormat = memo(({ value, isRequired, isDisabled,
  fieldName, index, ownerValue, _onChange } : ITextProps) => {
  const currentValue = ownerValue !== undefined ? ownerValue : value;
  const errorProp = {
    isInvalid: !!(isRequired && currentValue === ''),
    errorText: 'Required fields must be filled in.',
  };

  const [errorProps, setErrorProps] = useState<errorProp>(errorProp);
  const textFields = useAppSelector(state => state.text.textFields);
  const currentTextField = textFields.find(textField => textField.fieldName === fieldName);
  const dispatch = useAppDispatch();

  const checkValidation = (newValue: string) => {
    if (isRequired && newValue === '') {
      setErrorProps({
        isInvalid: true,
        errorText: 'Required fields must be filled in.',
      });
      dispatch(setInvalid(true));
    }
    else if (currentTextField?.textMaxLength && newValue.length > currentTextField?.textMaxLength) {
      setErrorProps({
        isInvalid: true,
        errorText: 'You have exceeded the maximum number of characters in this field.',
      });
      dispatch(setInvalid(true));
    }
    else {
      dispatch(setInvalid(false));
    }
  };

  return (
    <Stack>
      <TextField defaultValue={currentValue}
        key={currentValue}
        styles={textFieldStyles(isRequired)}
        disabled={isDisabled}
        onBlur={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const elem = event.target as HTMLInputElement;
          _onChange(elem.value);
          checkValidation(elem.value);
        }}
        onFocus={() => setErrorProps({ isInvalid: false, errorText: '' })}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)} />
      <FontIcon iconName={'StatusErrorFull'}
        className={errorTooltip(errorProps.isInvalid, errorProps.errorText, index)} />
    </Stack>
  );
});
