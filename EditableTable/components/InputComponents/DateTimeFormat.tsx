import * as React from 'react';
import { DatePicker, IDatePicker, mergeStyleSets,
  defaultDatePickerStrings } from '@fluentui/react';
import { ComboBox, IComboBox, IComboBoxOption, IComboBoxStyles, Stack } from '@fluentui/react';
import { timesList } from './timeList';
import { stackComboBox } from '../../styles/ComboBoxStyles';
import { useAppSelector } from '../../store/hooks';
import { shallowEqual } from 'react-redux';
import { getUserTimeZoneOffset } from '../../services/DataverseService';

export interface IDatePickerProps {
  fieldName: string,
  dateOnly : boolean,
  defaultValue : Date,
  _onChange: any
}

const styles = mergeStyleSets({
  root: { selectors: { '> *': { marginBottom: 15 } } },
  control: { maxWidth: 300, marginBottom: 15 },
});

const onFormatDate = (date?: Date): string => !date ? ''
  : `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;

const formatTime = (date? : Date): string => !date ? ''
  : date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
// .replace(/([\d]+:[\d]{2})(:[\d]{2})(.*)/, '$1$3');

export const DateTimeFormat = (
  { fieldName, dateOnly, defaultValue, _onChange }: IDatePickerProps) => {
  const left = dateOnly ? 0 : '-1px';
  const comboBoxStyles: Partial<IComboBoxStyles> = {
    optionsContainer: { maxHeight: 260 },
    container: { flexShrink: '2 !important',
      marginLeft: left, maxWidth: 100 },
  };

  const [selectedValue, setValue] = React.useState<Date | undefined>(!isNaN(defaultValue.getTime())
    ? defaultValue : undefined);
  const [selectedKey, setSelectedKey] = React.useState<string | number | undefined>();
  const [options, setOptions] = React.useState(timesList);
  const [dateBehavior, setDateBehavior] = React.useState<string>('');
  const datePickerRef = React.useRef<IDatePicker>(null);

  const dates = useAppSelector(state => state.date.dates, shallowEqual);
  const userTimeZoneOffset = getUserTimeZoneOffset();
  console.log(userTimeZoneOffset);

  const setUserLocalDateTime = (dateTime: Date) =>
    new Date(dateTime.getTime() +
    ((new Date().getTimezoneOffset() + userTimeZoneOffset) * 60 * 1000));

  React.useEffect(() => {
    const currentDate = dates.find(date => date.fieldName === fieldName);
    setDateBehavior(currentDate ? currentDate.dateBehavior : '');
  }, [dates]);

  React.useEffect(() => {
    if (!isNaN(defaultValue.getTime()) && dateBehavior === 'TimeZoneIndependent') {
      const newDate = new Date(
        defaultValue.getUTCFullYear(),
        defaultValue.getUTCMonth(),
        defaultValue.getUTCDate(),
        defaultValue.getUTCHours(),
        defaultValue.getUTCMinutes(),
        defaultValue.getUTCSeconds());

      setValue(newDate);
    }
    if (!isNaN(defaultValue.getTime()) && dateBehavior === 'UserLocal') {
      setValue(setUserLocalDateTime(defaultValue));
    }
  }, [dateBehavior, userTimeZoneOffset]);

  React.useEffect(() => { // set keys for date and time
    if (selectedValue !== undefined && !isNaN(selectedValue.getTime())) {
      const hour = selectedValue.getHours() > 9
        ? selectedValue.getHours()
        : `0${selectedValue.getHours()}`;
      const minutes = selectedValue.getMinutes() > 9
        ? selectedValue.getMinutes()
        : `0${selectedValue.getMinutes()}`;
      const time = timesList.find(time => time.key === `${hour}:${minutes}`);
      const newKey = time === undefined ? `${hour}:${minutes}` : time.key;
      setOptions(prevOptions => [...prevOptions, { key: newKey, text: formatTime(selectedValue) }]);
      setSelectedKey(newKey);
    }
    else {
      setSelectedKey(undefined);
    }
  }, [selectedValue]);

  const onParseDateFromString = React.useCallback( // when date is typed
    (newValue: string): Date => {
      const previousValue = selectedValue || new Date();
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
    },
    [selectedValue],
  );

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

  // setting the time is wrong
  // if using setUserLocalDateTime - sets two hrs earlier
  // if using local date - sets 4 hrs earlier
  const onSelectTime = React.useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption,
      index?: number, value?: string): void => {
      let key = option?.key;
      if (!option && value) {
        key = formatValue(value);
        setOptions(prevOptions => [...prevOptions, { key: key!, text: value }]);
      }
      setSelectedKey(key);
      const newValue = setTime(selectedValue, key?.toString());
      if (newValue !== undefined) {
        if (dateBehavior === 'TimeZoneIndependent') {
          _onChange(`${newValue.toISOString().split('T')[0]}T${key}:00Z`);
        }
        else {
          _onChange(`${new Date(newValue.getTime() +
            (userTimeZoneOffset * 60 * 1000)).toISOString().split('.')[0]}Z`);
        }
      }
    },
    [selectedValue],
  );

  const formatDate = (date: Date) => {
    const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
    const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
    const fullDate = `${date.getFullYear()}-${month}-${day}`;
    return fullDate;
  };

  const onSelectDate = (date: Date | null | undefined) => {
    if (date !== null && date !== undefined) {
      if (dateOnly) {
        setValue(date);
        _onChange(`${formatDate(date)}T00:00:00Z`);
      }
      else {
        const dateTime = setTime(date, selectedKey?.toString());
        if (dateTime !== undefined) {
          setValue(dateTime);
          if (dateBehavior === 'TimeZoneIndependent') {
            _onChange(`${formatDate(dateTime)}T${selectedKey ? selectedKey : '00:00'}:00Z`);
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
        componentRef={datePickerRef}
        allowTextInput
        value={selectedValue}
        onSelectDate={onSelectDate}
        formatDate={onFormatDate}
        parseDateFromString={onParseDateFromString}
        className={styles.control}
        strings={defaultDatePickerStrings}
        styles={!dateOnly ? { textField: {
          borderLeft: 'none',
          borderTopLeftRadius: 0,
          borderBottomLeftRadius: 0,
          zIndex: 100,
        } } : {}}
      />
      {!dateOnly &&
        <ComboBox
          options={options}
          allowFreeform={true}
          onChange={onSelectTime}
          styles={comboBoxStyles}
          selectedKey={selectedKey}
        />
      }
    </Stack>
  );
};
