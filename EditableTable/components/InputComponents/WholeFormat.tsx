/* eslint-disable react/display-name */
import { ComboBox, FontIcon, IComboBox, IComboBoxOption, Stack } from '@fluentui/react';
import React, { memo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, wholeFormatStyles } from '../../styles/ComponentsStyles';
import { getDurationOption } from '../../utils/durationUtils';
import { durationList } from './durationList';
import { ErrorIcon } from '../ErrorIcon';
import { setInvalidFields } from '../../store/features/ErrorSlice';

export interface IWholeFormatProps {
  fieldId: string;
  value: string | null | undefined;
  formattedValue?: string;
  type: string;
  _onChange: Function;
  isRequired: boolean;
  isDisabled: boolean;
  isSecured: boolean
}

export const WholeFormat = memo(({ fieldId, value, formattedValue, type, isDisabled, isSecured,
  isRequired, _onChange } : IWholeFormatProps) => {
  const dispatch = useAppDispatch();
  const wholeFormat = useAppSelector(state => state.wholeFormat);

  let options: IComboBoxOption[] = [];
  switch (type) {
    case 'timezone':
      options = wholeFormat.timezones;
      break;

    case 'language':
      options = wholeFormat.languages;
      break;

    case 'duration':
      options = [
        { key: value, text: formattedValue, hidden: true } as IComboBoxOption,
        ...durationList,
      ];
      break;
  }

  const durationValidation = (value: string | undefined): IComboBoxOption | undefined => {
    if (type === 'duration' && value) {
      const newOption = getDurationOption(value) as IComboBoxOption;
      if (newOption) {
        options.push(newOption);
        return newOption;
      }
    }
  };

  const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption,
    index?: number | undefined, value?: string | undefined): void => {
    if (option) {
      const { key } = option;
      type === 'duration'
        ? _onChange(key, option.text)
        : _onChange(key);
    }
    else {
      const newOption = durationValidation(value);
      _onChange(newOption?.key || null, newOption?.text);
    }
  };

  const checkValidation = () => {
    if (isRequired && (value === '' || value === null)) {
      dispatch(setInvalidFields({ fieldId, isInvalid: true,
        errorMessage: 'Required fields must be filled in.' }));
    }
  };

  return (
    <Stack>
      <ComboBox
        options={options}
        onChange={onChange}
        autoComplete='off'
        selectedKey={value}
        title={formattedValue || ''}
        styles={wholeFormatStyles(isRequired)}
        allowFreeform={type === 'duration'}
        disabled={isDisabled || isSecured}
        onBlur={() => checkValidation()}
        onFocus={() => dispatch(setInvalidFields({ fieldId, isInvalid: false, errorMessage: '' }))}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
      <ErrorIcon id={fieldId} isRequired={isRequired} />
    </Stack>
  );
});
