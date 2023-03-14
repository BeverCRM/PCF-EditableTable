import { IComboBoxOption } from '@fluentui/react';

const getTextFromString = (value: string) => value.replace(/\d+/g, '');

const getNumberFromString = (value: string) => value.replace(/[^0-9.-]+/g, '');

export const getDurationOption = (value: string) => {
  let key: number | undefined;
  let optionText: string;

  const numberString = getNumberFromString(value);
  const number = Number(numberString);
  const text = getTextFromString(value);
  if (numberString) {
    if (text.includes('day')) {
      key = Math.round(number * 60 * 24);
      optionText = number > 1 ? `${number} days` : `${number} day`;
    }
    else if (text.includes('hour')) {
      key = Math.round(number * 60);
      optionText = number > 1 ? `${number} hours` : `${number} hour`;
    }
    else {
      key = Math.round(number);
      optionText = key > 1 ? `${key} minutes` : `${key} minute`;
    }
    return { text: optionText, key: key.toString(), hidden: true } as IComboBoxOption;
  }
};
