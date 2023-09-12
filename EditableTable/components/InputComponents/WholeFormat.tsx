/* eslint-disable react/display-name */
import { ComboBox, FontIcon, IComboBox, IComboBoxOption, Stack } from '@fluentui/react';
import React, { memo, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, wholeFormatStyles } from '../../styles/ComponentsStyles';
import { getDurationOption } from '../../utils/durationUtils';
import { durationList } from './durationList';
import { ErrorIcon } from '../ErrorIcon';

export interface IWholeFormatProps {
  value: string | null | undefined;
  formattedValue?: string;
  type: string;
  _onChange: Function;
  isRequired: boolean;
  isDisabled: boolean;
  isSecured: boolean
}

export const WholeFormat = memo(({ value, formattedValue, type, isDisabled, isSecured,
  isRequired, _onChange } : IWholeFormatProps) => {
  const [isInvalid, setInvalid] = useState(false);

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
      setInvalid(true);
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
        onFocus={() => setInvalid(false)}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
      <ErrorIcon id={`wholeFormat${Date.now().toString()}`}
        errorText={'Required fields must be filled in.'}
        isInvalid={isInvalid}
        isRequired={isRequired}
      ></ErrorIcon>
    </Stack>
  );
});
