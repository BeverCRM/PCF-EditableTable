/* eslint-disable react/display-name */
import React, { memo, useState } from 'react';
import {
  DatePicker,
  defaultDatePickerStrings,
  Stack,
  ComboBox,
  IComboBox,
  IComboBoxOption,
  FontIcon,
} from '@fluentui/react';
import {
  asteriskClassStyle,
  timePickerStyles,
  datePickerStyles,
  stackComboBox,
  errorTooltip,
} from '../../styles/ComponentsStyles';
import { useAppSelector } from '../../store/hooks';
import { shallowEqual } from 'react-redux';
import {
  getDateFormatWithHyphen,
  setTimeForDate,
  getTimeKeyFromTime,
  getTimeKeyFromDate,
  formatTimeto12Hours,
} from '../../utils/dateTimeUtils';
import {
  formatUTCDateTimeToUserDate,
  formatUserDateTimeToUTC,
  formatDateShort,
  parseDateFromString,
} from '../../utils/formattingUtils';
import { timesList } from './timeList';
import { IDataverseService } from '../../services/DataverseService';

export interface IDatePickerProps {
  fieldName: string,
  dateOnly: boolean,
  value: string | null,
  isRequired: boolean;
  _onChange: any,
  _service: IDataverseService;
}

export const DateTimeFormat = memo(({ fieldName, dateOnly, value,
  isRequired, _onChange, _service }: IDatePickerProps) => {
  const [isInvalid, setInvalid] = useState(false);
  let timeKey: string | number | undefined;
  const options = timesList;

  const dateFields = useAppSelector(state => state.date.dates, shallowEqual);
  const currentDateMetadata = dateFields.find(dateField => dateField.fieldName === fieldName);
  const dateBehavior = currentDateMetadata?.dateBehavior ?? '';

  let currentDate: Date | undefined = value
    ? dateBehavior === 'TimeZoneIndependent'
      ? formatUserDateTimeToUTC(_service, new Date(value), 4)
      : formatUTCDateTimeToUserDate(_service, value)
    : undefined;

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

  const checkValidation = () => {
    if (isRequired && (currentDate === undefined || isNaN(currentDate.getTime()))) {
      setInvalid(true);
    }
  };

  const setChangedDateTime = (date: Date | undefined, key: string | number | undefined) => {
    const currentDateTime = setTimeForDate(date, key?.toString());
    if (currentDateTime !== undefined) {
      if (dateBehavior === 'TimeZoneIndependent') {
        _onChange(`${getDateFormatWithHyphen(currentDateTime)}T${key ?? '00:00'}:00Z`);
      }
      else {
        const dateInUTC = formatUserDateTimeToUTC(_service, currentDateTime, 1);
        _onChange(`${getDateFormatWithHyphen(dateInUTC)}T${getTimeKeyFromDate(dateInUTC)}:00Z`);
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
    else {
      _onChange(null);
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
        allowTextInput
        value={currentDate}
        onSelectDate={onDateChange}
        formatDate={(date?: Date) => date ? formatDateShort(_service, date) : ''}
        parseDateFromString={(newValue: string): Date => parseDateFromString(_service, newValue)}
        strings={defaultDatePickerStrings}
        styles={datePickerStyles(dateOnly ? isRequired : false)}
        onAfterMenuDismiss={() => checkValidation()}
        onClick={() => setInvalid(false)}
      />
      {!dateOnly &&
        <ComboBox
          options={options}
          allowFreeform={true}
          onChange={onTimeChange}
          styles={timePickerStyles(isRequired)}
          selectedKey={timeKey}
          onBlur={() => checkValidation()}
        />
      }
      <FontIcon iconName={'AsteriskSolid'} className={asteriskClassStyle(isRequired)}/>
      <FontIcon iconName={'StatusErrorFull'}
        className={errorTooltip(isInvalid, 'Required fields must be filled in.')} />
    </Stack>
  );
});
