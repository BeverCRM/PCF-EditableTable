import * as React from 'react';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export const usePagination = (dataset: DataSet) => {

  const [firstItemNumber, setFirstItemNumber] = React.useState<number>(0);
  const [lastItemNumber, setLastItemNumber] = React.useState<number>();
  const [totalRecords, setTotalRecords] = React.useState<number>();
  const [currentPage, setCurrentPage] = React.useState<number>(0);
  const [pageSize, setPageSize] = React.useState<number>(0);

  React.useEffect(() => {
    if (!dataset.paging.hasPreviousPage) {
      setPageSize(dataset.sortedRecordIds.length);
      setCurrentPage(1);
      setTotalRecords(dataset.paging.totalResultCount);
    }
    setFirstItemNumber((currentPage - 1) * pageSize + 1);
    setLastItemNumber((currentPage - 1) * pageSize + dataset.sortedRecordIds.length);
  }, [dataset]);

  function moveToFirst() {
    setCurrentPage(1);
    dataset.paging.loadExactPage(1);
  }

  function movePrevious() {
    const newPage = currentPage - 1;
    setCurrentPage(newPage);
    dataset.paging.loadExactPage(newPage);
  }

  function moveNext() {
    const newPage = currentPage + 1;
    setCurrentPage(newPage);
    dataset.paging.loadExactPage(newPage);
  }

  return {
    currentPage,
    firstItemNumber,
    lastItemNumber,
    totalRecords,
    moveToFirst,
    movePrevious,
    moveNext,
  };
};
