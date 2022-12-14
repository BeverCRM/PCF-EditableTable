import { ComboBox, IComboBox, IComboBoxOption, Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import { durationList } from './durationList';

export interface IWholeFormatProps {
  defaultValue: string;
  type: string;
  _onChange: any
}

export const WholeFormat = ({ defaultValue, type, _onChange } : IWholeFormatProps) => {
  const [selectedKey, setSelectedKey] = React.useState<string | number | undefined>('');
  const timezones = useAppSelector(state => state.wholeFormat.timezones);
  const lagnauges = useAppSelector(state => state.wholeFormat.languages);

  let options: IComboBoxOption[] = [];
  switch (type) {
    case 'timezone':
      options = timezones;
      break;

    case 'language':
      options = lagnauges;
      break;

    case 'duration':
      options = durationList;
      break;
  }

  const selectedOption = options.find(opt => opt.key === defaultValue);
  setSelectedKey(selectedOption?.key);

  const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
    const key = option?.key;
    setSelectedKey(key);
    _onChange(key);
  };

  return (
    <Stack>
      <ComboBox
        options={options}
        onChange={onChange}
        selectedKey={selectedKey}
        styles={{
          optionsContainer: {
            maxHeight: 260,
            maxWidth: 300,
          },
          container: {
            maxWidth: 200,
          },
        }}
      />
    </Stack>
  );
};
