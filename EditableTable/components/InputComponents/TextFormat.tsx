/* eslint-disable react/display-name */
import { FontIcon, Stack, TextField } from '@fluentui/react';
import React, { memo } from 'react';
import { asteriskClassStyle, textFieldStyles } from '../../styles/ComponentsStyles';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setInvalidFields } from '../../store/features/ErrorSlice';
import { isEmailValid, validateUrl } from '../../utils/textUtils';
import { ErrorIcon } from '../ErrorIcon';

export type errorProp = {
  isInvalid: boolean,
  errorText: string
};

export interface ITextProps {
  fieldId: string;
  fieldName: string;
  value: string | undefined;
  ownerValue: string | undefined;
  type?: string;
  isDisabled: boolean;
  isRequired: boolean;
  isSecured: boolean;
  _onChange: Function;
}

export const TextFormat = memo(({ fieldId, value, isRequired, isDisabled, type, isSecured,
  fieldName, ownerValue, _onChange } : ITextProps) => {
  const currentValue = ownerValue !== undefined ? ownerValue : value;
  const dispatch = useAppDispatch();
  const textFields = useAppSelector(state => state.text.textFields);
  const currentTextField = textFields.find(textField => textField.fieldName === fieldName);

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
      dispatch(setInvalidFields(
        { fieldId, isInvalid: true, errorMessage: 'Required fields must be filled in.' }));
    }
    else if (currentTextField?.textMaxLength && newValue.length > currentTextField?.textMaxLength) {
      dispatch(setInvalidFields(
        { fieldId, isInvalid: true,
          errorMessage: 'You have exceeded the maximum number of characters in this field.' }));
    }
    else if (type?.includes('Email') && !isEmailValid(newValue) && newValue !== '') {
      dispatch(setInvalidFields(
        { fieldId, isInvalid: true, errorMessage: 'Enter a valid email address.' }));
    }
    else if (!isRequired && newValue === '') {
      dispatch(setInvalidFields({ fieldId, isInvalid: false, errorMessage: '' }));
    }
    else {
      dispatch(setInvalidFields({ fieldId, isInvalid: false, errorMessage: '' }));
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
        onFocus={() => dispatch(setInvalidFields({ fieldId, isInvalid: false, errorMessage: '' }))}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)} />
      <ErrorIcon id={fieldId} isRequired={isRequired} />
    </Stack>
  );
});
