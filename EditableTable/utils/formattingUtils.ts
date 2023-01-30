import { getContext } from '../services/DataverseService';

// eslint-disable-next-line no-useless-escape
export const formatNumber = (value: string) => Number(value.replace(/[^0-9\.-]+/g, ''));

export const formatCurrency = (value: number, precision?: number, symbol?: string) =>
  getContext().formatting.formatCurrency(value, precision, symbol);

export const formatDecimal = (value: number, precision?: number | undefined) => {
  if (value === null || value === undefined || value === 0) return '';
  return getContext().formatting.formatDecimal(value, precision);
};

export const formatLanguage = (langageCode: number) =>
  getContext().formatting.formatLanguage(langageCode);

export const formatDateShort = (value: Date, includeTime?: boolean) =>
  getContext().formatting.formatDateShort(value, includeTime);

export const formatUserDateTimeToUTC = (userDateTime: Date, behavior: 0 | 1 | 2 | 3) =>
  // @ts-ignore
  getContext().formatting.formatUserDateTimeToUTC(userDateTime, behavior);
