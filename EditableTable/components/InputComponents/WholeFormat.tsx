import { ComboBox, FontIcon, IComboBox, IComboBoxOption, Stack } from '@fluentui/react';
import React, { memo } from 'react';
import { useAppSelector } from '../../store/hooks';
import { asteriskClassStyle, wholeFormatStyles } from '../../styles/ComponentsStyles';
import { durationList } from './durationList';

export interface IWholeFormatProps {
  value: string | null | undefined;
  type: string;
  _onChange: Function;
  _onDoubleClick: Function;
  isRequired: boolean;
}

export const WholeFormat = memo(({ value, type, _onChange, isRequired,
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
      break;
  }

  const onChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption): void => {
    const key = option?.key;
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
      />
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
    </Stack>
  );
});
