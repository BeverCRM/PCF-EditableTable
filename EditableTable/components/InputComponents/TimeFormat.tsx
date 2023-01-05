import * as React from 'react';
import { ComboBox, IComboBox, IComboBoxOption } from '@fluentui/react';
import { timesList } from './timeList';
import { comboBoxStyles } from '../../styles/ComboBoxStyles';
import {
  formatTimeto12Hours,
  getDateFormatWithHyphen,
  getTimeKeyFromDate,
  getTimeKeyFromTime,
  setTimeForDate,
} from '../../utils/dateTimeUtils';

export interface ITimeFormatProps {
  currentDate: Date | undefined,
  _onChange: any,
  dateBehavior: string,
  userTimeZoneOffset: number,
  setKey: React.Dispatch<React.SetStateAction<string | number | undefined>>
}

export const TimeFormat = (
  { currentDate, dateBehavior,
    userTimeZoneOffset, _onChange, setKey }: ITimeFormatProps) => {
  const [options, setOptions] = React.useState(timesList);
  const [timeKey, setTimeKey] = React.useState<string | number | undefined>();

  React.useEffect(() => { // set keys for date and time
    if (currentDate !== undefined && !isNaN(currentDate.getTime())) {
      const newKey = getTimeKeyFromDate(currentDate);
      setTimeKey(newKey);
      setKey(newKey);
      setOptions(prevOptions => [...prevOptions, {
        key: newKey,
        text: formatTimeto12Hours(currentDate),
      }]);
    }
    else {
      setKey(undefined);
      setTimeKey(undefined);
    }
  }, [currentDate]);

  const onTimeChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption,
    index?: number, value?: string): void => {
    let key = option?.key;
    if (!option && value) {
      key = getTimeKeyFromTime(value);
      setOptions(prevOptions => [...prevOptions, { key: key!, text: value }]);
    }
    setKey(key);
    setTimeKey(key);
    const newValue = setTimeForDate(currentDate, key?.toString());
    if (newValue !== undefined) {
      if (dateBehavior === 'TimeZoneIndependent') {
        _onChange(`${newValue.toISOString().split('T')[0]}T${key}:00Z`);
      }
      else {
        const newDate = newValue;
        newDate.setTime(newValue.getTime() - (userTimeZoneOffset * 60 * 1e3));
        _onChange(`${getDateFormatWithHyphen(newDate)}T${getTimeKeyFromDate(newDate)}:00Z`);
      }
    }
  };

  return (
    <ComboBox
      options={options}
      allowFreeform={true}
      onChange={onTimeChange}
      styles={comboBoxStyles}
      selectedKey={timeKey}
    />
  );
};
