import * as React from 'react';
import { DatePicker, IDatePicker,
  defaultDatePickerStrings,
  mergeStyleSets,
  Stack } from '@fluentui/react';
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
} from '../../utils/dateTimeUtils';
import { TimeFormat } from './TimeFormat';

export interface IDatePickerProps {
  fieldName: string,
  dateOnly : boolean,
  defaultValue : Date,
  _onChange: any
}

export const DateTimeFormat = (
  { fieldName, dateOnly, defaultValue, _onChange }: IDatePickerProps) => {
  const styles = mergeStyleSets({
    root: { selectors: { '> *': { marginBottom: 15 } } },
    control: { maxWidth: dateOnly ? 200 : 150, marginBottom: 15 },
  });

  const [currentDate, setCurrentDate] = React.useState<Date | undefined>(
    !isNaN(defaultValue.getTime()) ? defaultValue : undefined);
  const [timeKey, setTimeKey] = React.useState<string | number | undefined>();
  const datePickerRef = React.useRef<IDatePicker>(null);

  const dates = useAppSelector(state => state.date.dates, shallowEqual);
  const currentDateMetadata = dates.find(date => date.fieldName === fieldName);
  const dateBehavior = currentDateMetadata?.dateBehavior ?? '';
  const userTimeZoneOffset = getUserTimeZoneOffset();

  React.useEffect(() => {
    if (!isNaN(defaultValue.getTime()) && dateBehavior === 'TimeZoneIndependent') {
      const newDate = getDateInUTC(defaultValue);
      setCurrentDate(newDate);
    }
    if (!isNaN(defaultValue.getTime()) && dateBehavior === 'UserLocal') {
      setCurrentDate(new Date(defaultValue.getTime() +
        ((new Date().getTimezoneOffset() + userTimeZoneOffset) * 60 * 1000)));
    }
  }, [dateBehavior, userTimeZoneOffset]);

  const onParseDateFromString = React.useCallback(
    (newValue: string): Date => getDateFromString(newValue, currentDate),
    [currentDate],
  );

  const onDateChange = (date: Date | null | undefined) => {
    if (date !== null && date !== undefined) {
      const dateTime = setTimeForDate(date, timeKey?.toString());
      if (dateTime !== undefined) {
        setCurrentDate(dateTime);
        _onChange(`${getDateFormatWithHyphen(dateTime)}T${timeKey ? timeKey : '00:00'}:00Z`);
      }
    }
  };

  return (
    <Stack styles={stackComboBox}>
      <DatePicker
        componentRef={datePickerRef}
        allowTextInput
        value={currentDate}
        onSelectDate={onDateChange}
        formatDate={getDateFormatWithSlash}
        parseDateFromString={onParseDateFromString}
        className={styles.control}
        strings={defaultDatePickerStrings}
      />
      {!dateOnly &&
        <TimeFormat
          currentDate={currentDate}
          _onChange={_onChange}
          dateBehavior={dateBehavior}
          userTimeZoneOffset={userTimeZoneOffset}
          setKey={setTimeKey}
        />
      }
    </Stack>
  );
};
