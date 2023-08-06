export const NEW_RECORD_ID_LENGTH_CHECK = 15;

export const isEmailValid = (value: string) => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-]+$/i;
  return emailRegex.test(value);
};

export const validateUrl = (value: string) => {
  if (value === '') return value;

  if (value.includes('http') && value.includes('://')) {
    return value;
  }
  return `https://${value}`;
};
