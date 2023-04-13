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
  isDisabled?: boolean,
  isRequired: boolean,
  _onChange: Function;
  _onDoubleClick: Function;
}

export const TextFormat = memo(({ value, isRequired, isDisabled, fieldName, index,
  _onChange, _onDoubleClick } : ITextProps) => {
  const errorProp = {
    isInvalid: !!(isRequired && value === ''),
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
      <TextField defaultValue={value}
        styles={textFieldStyles(isRequired)}
        disabled={isDisabled}
        onDoubleClick={() => _onDoubleClick()}
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
