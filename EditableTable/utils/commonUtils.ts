export const NEW_RECORD_ID_LENGTH_CHECK = 15;

export const getContainerHeight = (rowsLength: number) => {
  const height = rowsLength === 0
    ? 282
    : rowsLength < 10
      ? (rowsLength * 50) + 160
      : window.innerHeight - 280;
  return height;
};
