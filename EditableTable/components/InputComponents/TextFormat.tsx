/* eslint-disable react/display-name */
import { FontIcon, Stack, TextField } from '@fluentui/react';
import React, { memo, useState } from 'react';
import { asteriskClassStyle, textFieldStyles } from '../../styles/ComponentsStyles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setInvalid } from '../../store/features/ErrorSlice';
import { isEmailValid, validateUrl } from '../../utils/textUtils';
import { ErrorIcon } from '../ErrorIcon';

export type errorProp = {
  isInvalid: boolean,
  errorText: string
};

export interface ITextProps {
  fieldName: string;
  value: string | undefined;
  ownerValue: string | undefined;
  type?: string;
  isDisabled: boolean;
  isRequired: boolean;
  isSecured: boolean;
  _onChange: Function;
}

export const TextFormat = memo(({ value, isRequired, isDisabled, type, isSecured,
  fieldName, ownerValue, _onChange } : ITextProps) => {
  const currentValue = ownerValue !== undefined ? ownerValue : value;
  const errorProp = {
    isInvalid: false,
    errorText: 'Required fields must be filled in.',
  };

  const [errorProps, setErrorProps] = useState<errorProp>(errorProp);
  const textFields = useAppSelector(state => state.text.textFields);
  const currentTextField = textFields.find(textField => textField.fieldName === fieldName);
  const dispatch = useAppDispatch();

  const onChange = (newValue: string) => {
    if (type?.includes('URL')) {
      _onChange(validateUrl(newValue));
    }
    else {
      _onChange(newValue);
    }
  };

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
    else if (type?.includes('Email') && !isEmailValid(newValue)) {
      setErrorProps({
        isInvalid: true,
        errorText: 'Enter a valid email address.',
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
        title={currentValue}
        styles={textFieldStyles(isRequired)}
        disabled={isDisabled || isSecured}
        onBlur={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>) => {
          const elem = event.target as HTMLInputElement;
          if (currentValue !== elem.value) {
            onChange(elem.value);
          }
          checkValidation(elem.value);
        }}
        onFocus={() => setErrorProps({ isInvalid: false, errorText: '' })}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)} />
      <ErrorIcon id={`textFormat${Date.now().toString()}`}
        errorText={errorProps.errorText}
        isInvalid={errorProps.isInvalid}
        isRequired={isRequired}
      ></ErrorIcon>
    </Stack>
  );
});
