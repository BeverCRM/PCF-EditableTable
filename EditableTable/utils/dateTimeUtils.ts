// 09:00 PM
export const formatTime = (date: Date | undefined): string => {
  if (date === undefined) return '';

  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  });
};

export const formatDate = (date: Date | undefined) => {
  if (date === undefined) return '';

  const day = date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`;
  const month = date.getMonth() + 1 > 9 ? `${date.getMonth() + 1}` : `0${date.getMonth() + 1}`;
  const fullDate = `${date.getFullYear()}-${month}-${day}`;
  return fullDate;
};
