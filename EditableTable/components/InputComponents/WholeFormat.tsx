import { ComboBox, IComboBox, IComboBoxOption, IComboBoxStyles, Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import { durationList } from '../../utils/DurationList';

export interface IWholeFormatProps {
  defaultValue: string;
  type: string;
  _onChange: any
}

export const WholeFormat = ({ defaultValue, type, _onChange } : IWholeFormatProps) => {
  const comboBoxStyles: Partial<IComboBoxStyles> = {
    optionsContainer: { maxHeight: 260, maxWidth: 300 },
    container: { maxWidth: '200px' },
  };
  const [options, setOptions] = React.useState<IComboBoxOption[]>([]);
  const [selectedKey, setSelectedKey] = React.useState<string | number | undefined>('');

  let timezoneList : IComboBoxOption[] = [];
  let languages : IComboBoxOption[] = [];

  if (type === 'timezone') {
    timezoneList = useAppSelector(state => state.wholeFormat.timezones);
  }
  if (type === 'language') {
    languages = useAppSelector(state => state.wholeFormat.languages);
  }

  React.useEffect(
    () => {
      if (type === 'duration') {
        setOptions(durationList);
      }
      if (type === 'timezone') {
        setOptions(timezoneList);
      }
      if (type === 'language') {
        setOptions(languages);
      }
    },
    [type, languages, timezoneList],
  );

  React.useEffect(
    () => {
      const selectedOpt = options.find(opt => opt.key === defaultValue);
      setSelectedKey(selectedOpt?.key);
    },
    [options],
  );

  const onChange = React.useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
      const key = option?.key;
      setSelectedKey(key);
      _onChange(key);
    },
    [defaultValue],
  );

  return (
    <Stack>
      <ComboBox
        options={options}
        onChange={onChange}
        selectedKey={selectedKey}
        styles={comboBoxStyles}
      />
    </Stack>
  );
};
