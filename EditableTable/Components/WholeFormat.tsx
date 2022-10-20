import { ComboBox, IComboBox, IComboBoxOption, IComboBoxStyles, Stack } from '@fluentui/react';
import * as React from 'react';
import DataverseService from '../Services/DataverseService';
import { durationList } from '../Utils/DurationList';

export interface IWholeFormatProps {
  defaultValue: string;
  type: string;
  _onChange: any
}

export const WholeFormat = ({ defaultValue, type, _onChange } : IWholeFormatProps) => {
  const comboBoxStyles: Partial<IComboBoxStyles> = {
    optionsContainer: { maxHeight: 260, maxWidth: 300 },
  };
  const [options, setOptions] = React.useState<IComboBoxOption[]>([]);
  const [selectedKey, setSelectedKey] = React.useState<string | number | undefined>('');

  React.useMemo(
    () => {
      if (type === 'duration') {
        setOptions(durationList);
      }
      if (type === 'timezone') {
        const timezoneList = DataverseService.getTimeZones();
        setOptions(timezoneList);
      }
      if (type === 'language') {
        DataverseService.getLanguages().then(languages => {
          setOptions(languages);
        });
      }
    },
    [type],
  );

  React.useEffect(
    () => {
      if (type === 'timezone') {
        const selectedOpt = options.find(opt => opt.text === defaultValue);
        setSelectedKey(selectedOpt?.key);
      }
      else {
        const selectedOpt = options.find(opt => opt.key === defaultValue);
        setSelectedKey(selectedOpt?.key);
      }
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
