import { IDataverseService } from '../services/DataverseService';

export const formatNumber = (value: string) =>
  Number(value.replace(',', '.').replace(/[^0-9.-]+/g, ''));

export const formatCurrency =
(_service: IDataverseService, value: number, precision?: number, symbol?: string) =>
  _service.getContext().formatting.formatCurrency(value, precision, symbol);

export const formatDecimal =
(_service: IDataverseService, value: number, precision?: number | undefined) => {
  if (value === null || value === undefined) return '';
  return _service.getContext().formatting.formatDecimal(value, precision);
};

export const formatDateShort =
(_service: IDataverseService, value: Date, includeTime?: boolean): string =>
  _service.getContext().formatting.formatDateShort(value, includeTime);

export const formatUserDateTimeToUTC =
(_service: IDataverseService, userDateTime: Date, behavior: 1 | 3 | 4): string =>
  // @ts-ignore
  _service.getContext().formatting.formatUserDateTimeToUTC(userDateTime, behavior);

export const formatUTCDateTimeToUserDate =
(_service: IDataverseService, value: string): Date =>
  // @ts-ignore
  _service.getContext().formatting.formatUTCDateTimeToUserDate(value);

export const parseDateFromString =
(_service: IDataverseService, value: string): Date =>
  // @ts-ignore
  _service.getContext().formatting.parseDateFromString(value);
