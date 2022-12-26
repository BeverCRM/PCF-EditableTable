import * as React from 'react';
import { DatePicker, mergeStyleSets, defaultDatePickerStrings } from '@fluentui/react';
import { ComboBox, IComboBox, IComboBoxOption, IComboBoxStyles, Stack } from '@fluentui/react';
import { timesList } from './timeList';
import { stackComboBox } from '../../styles/ComboBoxStyles';
import { useAppSelector } from '../../store/hooks';
import { shallowEqual } from 'react-redux';
import { getUserTimeZoneOffset } from '../../services/DataverseService';
import { formatTime, formatDate } from '../../utils/dateTimeUtils';

export interface IDatePickerProps {
  fieldName: string;
  dateOnly: boolean;
  defaultValue: Date;
  _onChange: Function;
}

const styles = mergeStyleSets({
  root: { selectors: { '> *': { marginBottom: 15 } } },
  control: { maxWidth: 300, marginBottom: 15 },
});

export const DateTimeFormat = (
  { fieldName, dateOnly, defaultValue, _onChange }: IDatePickerProps) => {

  const comboBoxStyles: Partial<IComboBoxStyles> = {
    optionsContainer: { maxHeight: 260 },
    container: {
      flexShrink: '2 !important',
      marginLeft: dateOnly ? 0 : '-1px',
      maxWidth: 100,
    },
  };

  const [currentDate, setCurrentDate] = React.useState<Date | undefined>(
    !isNaN(defaultValue.getTime()) ? defaultValue : undefined);
  const [timeKey, setTimeKey] = React.useState<string | number | undefined>();
  const [options, setOptions] = React.useState(timesList);

  const dates = useAppSelector(state => state.date.dates, shallowEqual);
  const currentDateMetadata = dates.find(date => date.fieldName === fieldName);
  const dateBehavior = currentDateMetadata?.dateBehavior ?? '';
  const userTimeZoneOffset = getUserTimeZoneOffset();

  React.useEffect(() => {
    if (!isNaN(defaultValue.getTime()) && dateBehavior === 'TimeZoneIndependent') {
      const newDate = new Date(
        defaultValue.getUTCFullYear(),
        defaultValue.getUTCMonth(),
        defaultValue.getUTCDate(),
        defaultValue.getUTCHours(),
        defaultValue.getUTCMinutes(),
        defaultValue.getUTCSeconds());

      setCurrentDate(newDate);
    }
    if (!isNaN(defaultValue.getTime()) && dateBehavior === 'UserLocal') {
      setCurrentDate(new Date(defaultValue.getTime() +
        ((new Date().getTimezoneOffset() + userTimeZoneOffset) * 60 * 1000)));
    }
  }, [dateBehavior, userTimeZoneOffset]);

  React.useEffect(() => { // set keys for date and time
    if (currentDate !== undefined && !isNaN(currentDate.getTime())) {
      const hour = currentDate.getHours() > 9
        ? currentDate.getHours()
        : `0${currentDate.getHours()}`;
      const minutes = currentDate.getMinutes() > 9
        ? currentDate.getMinutes()
        : `0${currentDate.getMinutes()}`;
      const time = timesList.find(time => time.key === `${hour}:${minutes}`);
      const newKey = time === undefined ? `${hour}:${minutes}` : time.key;
      setTimeKey(newKey);
      setOptions(prevOptions => [...prevOptions, { key: newKey, text: formatTime(currentDate) }]);
    }
    else {
      setTimeKey(undefined);
    }
  }, [currentDate]);

  const onParseDateFromString = (newValue: string): Date => {
    const previousValue = currentDate || new Date();
    const newValueParts = (newValue || '').trim().split('/');
    const day =
      newValueParts.length > 0
        ? Math.max(1, Math.min(31, parseInt(newValueParts[0], 10))) : previousValue.getDate();
    const month =
      newValueParts.length > 1
        ? Math.max(1, Math.min(12, parseInt(newValueParts[1], 10))) - 1
        : previousValue.getMonth();
    let year = newValueParts.length > 2
      ? parseInt(newValueParts[2], 10) : previousValue.getFullYear();
    if (year < 100) {
      year += previousValue.getFullYear() - (previousValue.getFullYear() % 100);
    }
    return new Date(year, month, day);
  };

  const setTime = (value: Date | undefined, time: string | undefined) => {
    if (time !== undefined && value !== undefined) {
      const hours = time.split(':');
      value.setHours(parseFloat(hours[0]), parseFloat(hours[1]));
    }
    return value;
  };

  const formatValue = (value: string) => {
    let key = '';
    if (value.toLowerCase().toString().includes('m')) {
      const splitKey = value.match(/[a-zA-Z]+|[0-9]+/g);
      if (splitKey !== null) {
        if (splitKey[2].toLowerCase() === 'pm') {
          key = `${parseFloat(splitKey[0]) + 12}:${splitKey[1]}`;
        }
        else if (parseFloat(splitKey[0]) < 10) {
          key = `0${splitKey[0]}:${splitKey[1]}`;
        }
        else {
          key = `${splitKey[0]}:${splitKey[1]}`;
        }
      }
    }
    else {
      key = `${value.toString()}`;
    }
    return key;
  };

  const onTimeChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption,
    index?: number, value?: string): void => {
    let key = option?.key;
    if (!option && value) {
      key = formatValue(value);
      setOptions(prevOptions => [...prevOptions, { key: key!, text: value }]);
    }
    setTimeKey(key);
    const newValue = setTime(currentDate, key?.toString());
    if (newValue !== undefined) {
      if (dateBehavior === 'TimeZoneIndependent') {
        _onChange(`${newValue.toISOString().split('T')[0]}T${key}:00Z`);
      }
      else {
        _onChange(`${new Date(newValue.getTime() +
          (userTimeZoneOffset * 60 * 1000)).toISOString().split('.')[0]}Z`);
      }
    }
  };

  const onDateChange = (date: Date | null | undefined) => {
    if (date !== null && date !== undefined) {
      if (dateOnly) {
        setCurrentDate(date);
        _onChange(`${formatDate(date)}T00:00:00Z`);
      }
      else {
        const dateTime = setTime(date, timeKey?.toString());
        if (dateTime !== undefined) {
          setCurrentDate(dateTime);
          if (dateBehavior === 'TimeZoneIndependent') {
            _onChange(`${formatDate(dateTime)}T${timeKey ?? '00:00'}:00Z`);
          }
          else {
            _onChange(`${dateTime.toISOString().split('.')[0]}Z`);
          }
        }
      }
    }
  };

  return (
    <Stack styles={stackComboBox}>
      <DatePicker
        allowTextInput
        value={currentDate}
        onSelectDate={onDateChange}
        formatDate={formatDate}
        parseDateFromString={onParseDateFromString}
        className={styles.control}
        strings={defaultDatePickerStrings}
        styles={!dateOnly ? {
          textField: {
            borderLeft: 'none',
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            zIndex: 100,
          },
        } : {}}
      />
      {!dateOnly &&
        <ComboBox
          options={options}
          allowFreeform={true}
          onChange={onTimeChange}
          styles={comboBoxStyles}
          selectedKey={timeKey}
        />
      }
    </Stack>
  );
};
