import { ErrorDetails } from '../services/DataverseService';

export const isError = (value: any):
  value is ErrorDetails => value !== undefined && <ErrorDetails>value.code !== undefined;

export const consolidateErrorMessages = (errors: ErrorDetails[]) => {
  let errorMsg = '';
  errors.forEach(err => {
    const recordId = err.recordId ? `Record Id: ${err.recordId}` : '';
    errorMsg += `\n ${recordId}  \n ${err.raw} \n \n`;
  });
  return errorMsg;
};

export const getConsolidatedError = (errors: ErrorDetails[], type: string): ErrorDetails => ({
  recordId: '',
  code: 0o0,
  errorCode: 0o0,
  message: `${errors.length} records had errors when ${type}`,
  raw: consolidateErrorMessages(errors),
  title: `Multiple errors when ${type} records`,
});
