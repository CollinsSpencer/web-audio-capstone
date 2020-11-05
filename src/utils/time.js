export const dateFromSeconds = (seconds) =>
  new Date(0, 0, 0, 1, 0, seconds, (seconds % 1) * 1000);
export const secondsFromDate = (date) => {
  const baseDate = dateFromSeconds(0);
  return (date.getTime() - baseDate.getTime()) / 1000;
};
