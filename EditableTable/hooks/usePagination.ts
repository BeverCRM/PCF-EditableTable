import { useState } from 'react';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export const usePagination = (dataset: DataSet) => {
  const [currentPage, setCurrentPage] = useState(1);

  const { totalResultCount: totalRecords, hasPreviousPage, hasNextPage } = dataset.paging;

  const pageSize = dataset.sortedRecordIds.length;

  const firstItemNumber = (currentPage - 1) * pageSize + 1;
  const lastItemNumber = (currentPage - 1) * pageSize + pageSize;

  function moveToPage(pageNumber: number) {
    setCurrentPage(pageNumber);
    dataset.paging.loadExactPage(pageNumber);
  }

  function moveToFirst() {
    moveToPage(1);
  }

  function movePrevious() {
    moveToPage(currentPage - 1);
  }

  function moveNext() {
    moveToPage(currentPage + 1);
  }

  return {
    totalRecords,
    currentPage,
    hasPreviousPage,
    hasNextPage,
    firstItemNumber,
    lastItemNumber,
    moveToFirst,
    movePrevious,
    moveNext,
  };
};
