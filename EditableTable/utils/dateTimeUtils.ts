import { timesList } from '../components/InputComponents/timeList';

export const getDateFormatWithHyphen = (date: Date | undefined) => {
  if (date === undefined) return '';

  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
  const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;

  return `${date.getFullYear()}-${month}-${day}`;
};

export const setTimeForDate = (value: Date | undefined, time: string | undefined) => {
  if (time === undefined || value === undefined) return value;

  const hours = time.split(':');
  const newValue = value;
  newValue.setHours(parseFloat(hours[0]), parseFloat(hours[1]));

  return newValue;
};

// 09:00 PM
export const formatTimeto12Hours = (date: Date | undefined): string => {
  if (date === undefined) return '';

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

export const getTimeKeyFromDate = (date: Date) => {
  const hour = date.getHours() > 9
    ? date.getHours()
    : `0${date.getHours()}`;

  const minutes = date.getMinutes() > 9
    ? date.getMinutes()
    : `0${date.getMinutes()}`;

  const time = timesList.find(time => time.key === `${hour}:${minutes}`);
  return time === undefined ? `${hour}:${minutes}` : time.key;
};

export const getTimeKeyFromTime = (value: string) => {
  let key = '';
  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5]\d\s(?:AM|PM)$/i;
  if (timeRegex.test(value.toLowerCase().toString())) {
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
  /* if (value.toLowerCase().toString().includes('m')) {
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
  else if (value.toLowerCase().toString().includes(':')) {
    key = `${value.toString()}`;
  }
  else {
    key = '00:00';
  } */
  return key;
};
