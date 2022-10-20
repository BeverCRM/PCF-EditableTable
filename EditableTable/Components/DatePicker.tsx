import * as React from 'react';
import { DatePicker, IDatePicker, mergeStyleSets,
  defaultDatePickerStrings } from '@fluentui/react';
import { ComboBox, IComboBox, IComboBoxOption, IComboBoxStyles, Stack } from '@fluentui/react';
import { timesList } from '../Utils/TimeList';
import { stackComboBox } from '../Styles/ComboBoxStyles';
import DataverseService from '../Services/DataverseService';

export interface IDatePickerProps {
  entityName: string,
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

export const DateTimePicker = ({ entityName, fieldName, dateOnly, defaultValue,
  _onChange }: IDatePickerProps) => {
  const comboBoxStyles: Partial<IComboBoxStyles> = {
    optionsContainer: { maxHeight: 260, maxWidth: 300 },
    container: { flexShrink: '2 !important' },
  };

  const [selectedValue, setValue] = React.useState<Date | undefined>(!isNaN(defaultValue.getTime())
    ? defaultValue : undefined);
  const [selectedKey, setSelectedKey] = React.useState<string | number | undefined>();
  const [options, setOptions] = React.useState(timesList);
  const [dateBehavior, setDateBehavior] = React.useState<string>('');
  const datePickerRef = React.useRef<IDatePicker>(null);

  React.useMemo(() => {
    const dateBehavior = DataverseService.getDateMetadata(entityName, fieldName);
    setDateBehavior(DataverseService.getDateMetadata(entityName, fieldName));
    if (!isNaN(defaultValue.getTime()) && dateBehavior === 'TimeZoneIndependent') {
      const newDate = DataverseService.formatTime(defaultValue);
      console.log(newDate);
      setValue(new Date(newDate));
    }
  }, [fieldName]);

  React.useEffect(() => { // set keys for date and time
    if (selectedValue !== undefined && !isNaN(selectedValue.getTime())) {
      const hour = selectedValue.getHours();
      const minutes = selectedValue.getMinutes();
      const time = timesList.find(time => time.key === `${hour}:${minutes}`);
      const newKey = time === undefined ? `${hour}:${minutes}` : time.key;
      setOptions(prevOptions => [...prevOptions, { key: newKey, text: formatTime(selectedValue) }]);
      setSelectedKey(newKey);
    }
    else {
      setSelectedKey(undefined);
    }
  }, [selectedValue],
  );

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

  const onChange = React.useCallback(
    (event: React.FormEvent<IComboBox>, option?: IComboBoxOption,
      index?: number, value?: string): void => {
      let key = option?.key;
      if (!option && value) {
        key = formatValue(value);
        setOptions(prevOptions => [...prevOptions, { key: key!, text: value }]);
      }
      setSelectedKey(key);
      const newValue = setTime(selectedValue, key?.toString());
      if (dateBehavior === 'TimeZoneIndependent') {
        _onChange(`${newValue?.toISOString().split('.')[0]}Z`);
      }
      else {
        _onChange(`${newValue?.toISOString().toLocaleString().split('.')[0]}Z`);
      }
    },
    [selectedValue],
  );

  const onSelectDate = (date: Date | null | undefined) => {
    if (date !== null) setValue(date);
    if (dateBehavior === 'TimeZoneIndependent') {
      _onChange(`${date?.toISOString().split('.')[0]}Z`);
    }
    else {
      _onChange(`${date?.toISOString().toLocaleString().split('.')[0]}Z`);
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
      />
      {!dateOnly &&
        <ComboBox
          options={options}
          allowFreeform={true}
          onChange={onChange}
          styles={comboBoxStyles}
          selectedKey={selectedKey}
        />
      }
    </Stack>
  );
};
