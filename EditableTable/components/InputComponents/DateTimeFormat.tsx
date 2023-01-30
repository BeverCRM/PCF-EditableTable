import React, { memo } from 'react';
import {
  DatePicker, IDatePicker,
  defaultDatePickerStrings,
  Stack,
  ComboBox,
  IComboBox,
  IComboBoxOption,
} from '@fluentui/react';
import { comboBoxStyles, stackComboBox } from '../../styles/ComponentsStyles';
import { useAppSelector } from '../../store/hooks';
import { shallowEqual } from 'react-redux';
import {
  getDateFormatWithHyphen,
  setTimeForDate,
  getDateFormatWithSlash,
  getDateFromString,
  getTimeKeyFromTime,
  getTimeKeyFromDate,
  formatTimeto12Hours,
} from '../../utils/dateTimeUtils';
import { dateFormatStyles } from '../../styles/ComponentsStyles';
import { formatDateShort, formatUserDateTimeToUTC } from '../../utils/formattingUtils';
import { timesList } from './timeList';

export interface IDatePickerProps {
  fieldName: string,
  dateOnly: boolean,
  value: string | null,
  _onChange: any
}

export const DateTimeFormat = memo((
  { fieldName, dateOnly, value, _onChange }: IDatePickerProps) => {
  let currentDate = value ? new Date(value) : undefined;
  let timeKey: string | number | undefined;
  const options = timesList;

  const datePickerRef = React.useRef<IDatePicker>(null);

  const dateFields = useAppSelector(state => state.date.dates, shallowEqual);
  const currentDateMetadata = dateFields.find(dateField => dateField.fieldName === fieldName);
  const dateBehavior = currentDateMetadata?.dateBehavior ?? '';

  if (currentDate !== undefined && !isNaN(currentDate.getTime())) {
    const newKey = getTimeKeyFromDate(currentDate);
    timeKey = newKey;
    if (options.find(option => option.key === newKey) === undefined) {
      options.push({
        key: newKey,
        text: formatTimeto12Hours(currentDate),
      });
    }
  }
  else {
    timeKey = undefined;
  }

  const onParseDateFromString = React.useCallback(
    (newValue: string): Date => getDateFromString(newValue, currentDate),
    [currentDate],
  );

  const setChangedDateTime = (date: Date | undefined, key: string | number | undefined) => {
    const currentDateTime = setTimeForDate(date, key?.toString());
    if (currentDateTime !== undefined) {
      if (dateBehavior === 'TimeZoneIndependent') {
        _onChange(`${getDateFormatWithHyphen(currentDateTime)}T${key ?? '00:00'}:00Z`,
          formatDateShort(currentDateTime, true));
      }
      else {
        const dateInUTC = new Date(formatUserDateTimeToUTC(currentDateTime, 1));
        _onChange(`${getDateFormatWithHyphen(dateInUTC)}T${getTimeKeyFromDate(dateInUTC)}:00Z`,
          formatDateShort(currentDateTime, true));
      }
    }
  };

  const onDateChange = (date: Date | null | undefined) => {
    if (date !== null && date !== undefined) {
      if (dateOnly) {
        currentDate = date;
        _onChange(`${getDateFormatWithHyphen(date)}T00:00:00Z`);
      }
      else {
        setChangedDateTime(date, timeKey);
      }
    }
  };

  const onTimeChange = (event: React.FormEvent<IComboBox>, option?: IComboBoxOption,
    index?: number, value?: string): void => {
    let key = option?.key;
    if (!option && value) {
      key = getTimeKeyFromTime(value);
      options.push({ key: key!, text: value.toUpperCase() });
    }
    timeKey = key;

    setChangedDateTime(currentDate, key);
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
        className={dateFormatStyles(dateOnly).control}
        strings={defaultDatePickerStrings}
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
});
