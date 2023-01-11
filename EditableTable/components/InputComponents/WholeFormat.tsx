import { ComboBox, IComboBox, IComboBoxOption, Stack } from '@fluentui/react';
import * as React from 'react';
import { useAppSelector } from '../../store/hooks';
import { durationList } from './durationList';

export interface IWholeFormatProps {
  value: string | number | undefined;
  type: string;
  _onChange: Function;
}

export const WholeFormat = ({ value, type, _onChange } : IWholeFormatProps) => {
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
      break;
  }

  const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
    const key = option?.key;
    value = key;
    // setSelectedKey(key);
    _onChange(key);
  };

  return (
    <Stack>
      <ComboBox
        options={options}
        onChange={onChange}
        selectedKey={value}
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
