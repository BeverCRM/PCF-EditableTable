
function getLastSunday(year: number, month: number) {
  let d = new Date(year, month, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function setDateTime(localDate: Date) {
  let utcDate = new Date(localDate.getUTCFullYear(), localDate.getUTCMonth(), localDate.getUTCDate(),
      localDate.getUTCHours(), localDate.getUTCMinutes(), localDate.getUTCSeconds());
  utcDate.setTime(utcDate.getTime() + (1 * 60 * 60 * 1000));
  let additionalHour = 0;
  let lastSundayOfMarch = getLastSunday(utcDate.getFullYear(), 3);
  lastSundayOfMarch = new Date(lastSundayOfMarch.getFullYear(), lastSundayOfMarch.getMonth(), lastSundayOfMarch.getDate(),
      2, 0, 0);
  let lastSundayOfOctober = getLastSunday(utcDate.getFullYear(), 10);
  lastSundayOfOctober = new Date(lastSundayOfOctober.getFullYear(), lastSundayOfOctober.getMonth(), lastSundayOfOctober.getDate(),
      2, 0, 0);

  if (utcDate.getTime() >= lastSundayOfMarch.getTime() && utcDate.getTime() < lastSundayOfOctober.getTime())
      additionalHour = 1;

  localDate.setTime(utcDate.getTime() + (additionalHour * 60 * 60 * 1000));
  return localDate;
}