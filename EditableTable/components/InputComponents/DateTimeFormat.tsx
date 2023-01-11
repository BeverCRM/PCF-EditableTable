import * as React from 'react';
import {
  DatePicker, IDatePicker,
  defaultDatePickerStrings,
  mergeStyleSets,
  Stack,
} from '@fluentui/react';
import { stackComboBox } from '../../styles/ComboBoxStyles';
import { useAppSelector } from '../../store/hooks';
import { shallowEqual } from 'react-redux';
import { getUserTimeZoneOffset } from '../../services/DataverseService';
import {
  getDateFormatWithHyphen,
  getDateInUTC,
  setTimeForDate,
  getDateFormatWithSlash,
  getDateFromString,
  backToLocalTimezone,
} from '../../utils/dateTimeUtils';
import { TimeFormat } from './TimeFormat';

export interface IDatePickerProps {
  fieldName: string,
  dateOnly: boolean,
  value: Date | undefined,
  _onChange: any
}

export const DateTimeFormat = (
  { fieldName, dateOnly, value, _onChange }: IDatePickerProps) => {
  const styles = mergeStyleSets({
    root: { selectors: { '> *': { marginBottom: 15 } } },
    control: { maxWidth: dateOnly ? 200 : 150, marginBottom: 15 },
  });

  const [timeKey, setTimeKey] = React.useState<string | number | undefined>();
  const datePickerRef = React.useRef<IDatePicker>(null);

  const dates = useAppSelector(state => state.date.dates, shallowEqual);
  const currentDateMetadata = dates.find(date => date.fieldName === fieldName);
  const dateBehavior = currentDateMetadata?.dateBehavior ?? '';
  const userTimeZoneOffset = getUserTimeZoneOffset();

  if (value !== undefined) {
    if (!isNaN(value.getTime()) && dateBehavior === 'TimeZoneIndependent') {
      value = getDateInUTC(value);
    }
    if (!isNaN(value.getTime()) && dateBehavior === 'UserLocal') {
      value = new Date(value.getTime() +
        ((new Date().getTimezoneOffset() + userTimeZoneOffset) * 60 * 1000));
    }
  }

  const onParseDateFromString = React.useCallback(
    (newValue: string): Date => getDateFromString(newValue, value),
    [value],
  );

  const onDateChange = (date: Date | null | undefined) => {
    if (date !== null && date !== undefined) {
      if (dateOnly) {
        value = date;
        _onChange(`${getDateFormatWithHyphen(date)}T00:00:00Z`);
      }
      else {
        const dateTime = setTimeForDate(date, timeKey?.toString());
        if (dateTime !== undefined) {
          value = new Date(dateTime.getTime() +
          ((new Date().getTimezoneOffset() + userTimeZoneOffset) * 60 * 1000));
          if (dateBehavior === 'TimeZoneIndependent') {
            _onChange(`${getDateFormatWithHyphen(dateTime)}T${timeKey ?? '00:00'}:00Z`);
          }
          else {
            const rawValue = backToLocalTimezone(value, userTimeZoneOffset);
            _onChange(`${dateTime.toISOString().split('.')[0]}Z`, rawValue.toISOString());
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
        value={value}
        onSelectDate={onDateChange}
        formatDate={getDateFormatWithSlash}
        parseDateFromString={onParseDateFromString}
        className={styles.control}
        strings={defaultDatePickerStrings}
      />
      {!dateOnly &&
        <TimeFormat
          currentDate={value}
          _onChange={_onChange}
          dateBehavior={dateBehavior}
          userTimeZoneOffset={userTimeZoneOffset}
          setKey={setTimeKey}
        />
      }
    </Stack>
  );
};
