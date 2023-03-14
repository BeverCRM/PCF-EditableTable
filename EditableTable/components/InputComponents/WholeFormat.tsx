import { ComboBox, FontIcon, IComboBox, IComboBoxOption, Stack } from '@fluentui/react';
import React, { memo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, wholeFormatStyles } from '../../styles/ComponentsStyles';
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
      options = durationList;
      options.push({ key: value, text: formattedValue, hidden: true } as IComboBoxOption);
      break;
  }

  const durationValidation = (value: string | undefined): string | undefined => {
    if (type === 'duration' && value) {
      const newOption = getDurationOption(value);
      if (newOption) {
        options.push(newOption);
        return newOption.key.toString();
      }
    }
  };

  const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption,
    index?: number | undefined, value?: string | undefined): void => {
    const key = option?.key || durationValidation(value) || '';
    _onChange(key);
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
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
    </Stack>
  );
});
