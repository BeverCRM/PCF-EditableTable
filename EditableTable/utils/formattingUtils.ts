import { IDataverseService } from './types';

export const formatNumber = (value: string) => Number(value.replace(/[^0-9.-]+/g, ''));

export const formatCurrency =
(_service: IDataverseService, value: number, precision?: number, symbol?: string) =>
  _service.getContext().formatting.formatCurrency(value, precision, symbol);

export const formatDecimal =
(_service: IDataverseService, value: number, precision?: number | undefined) => {
  if (value === null || value === undefined) return '';
  return _service.getContext().formatting.formatDecimal(value, precision);
};

export const formatDateShort =
(_service: IDataverseService, value: Date, includeTime?: boolean) =>
  _service.getContext().formatting.formatDateShort(value, includeTime);

export const formatUserDateTimeToUTC =
(_service: IDataverseService, userDateTime: Date, behavior: 0 | 1 | 2 | 3) =>
  // @ts-ignore
  _service.getContext().formatting.formatUserDateTimeToUTC(userDateTime, behavior);
