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
    return { text: optionText, key: key.toString() } as IComboBoxOption;
  }
};

// export const getDurationOptionFromFormattedValue =
// (value: string | null | undefined, formattedValue: string | undefined) =>
// <IComboBoxOption>{ text: formattedValue, key: value, hidden: true };

// {
// let numberConverted: number | undefined;
// let optionText: string;

// const number = Number(value);

// if (value) {
//   if (number >= 1440) {
//     numberConverted = number / 60 / 24;
//     optionText = numberConverted > 1 ? `${numberConverted} days` : `${numberConverted} day`;
//   }
//   else if (number < 1440 && number >= 60) {
//     numberConverted = number / 60;
//     optionText = numberConverted > 1 ? `${numberConverted} hours` : `${numberConverted} hour`;
//   }
//   else {
//     numberConverted = number;
//     optionText = numberConverted > 1 ? `${numberConverted} minutes` : `${numberConverted} minute`;
//   }
//   return { text: optionText, key: value, hidden: true } as IComboBoxOption;
// }

// return { } as IComboBoxOption;
// };
