/* eslint-disable react/display-name */
import { ComboBox, FontIcon, IComboBox, IComboBoxOption, Stack } from '@fluentui/react';
import React, { memo, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, errorTooltip, wholeFormatStyles } from '../../styles/ComponentsStyles';
import { getDurationOption } from '../../utils/durationUtils';
import { durationList } from './durationList';

export interface IWholeFormatProps {
  value: string | null | undefined;
  formattedValue?: string;
  type: string;
  _onChange: Function;
  _onDoubleClick: Function;
  isRequired: boolean;
}

export const WholeFormat = memo(({ value, formattedValue, type, _onChange, isRequired,
  _onDoubleClick } : IWholeFormatProps) => {
  const [isInvalid, setInvalid] = useState(false);
  const errorText = 'Required fields must be filled in.';

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
      _onChange(newOption?.key, newOption?.text);
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
        selectedKey={value}
        styles={wholeFormatStyles(isRequired)}
        onDoubleClick={() => _onDoubleClick()}
        allowFreeform={type === 'duration'}
        onBlur={() => checkValidation()}
        onFocus={() => setInvalid(false)}
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
      <FontIcon iconName={'StatusErrorFull'} className={errorTooltip(isInvalid, errorText)} />
    </Stack>
  );
});
