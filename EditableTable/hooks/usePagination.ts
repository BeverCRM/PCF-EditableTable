import { useEffect, useState } from 'react';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export const usePagination = (dataset: DataSet) => {
  const [currentPage, setCurrentPage] = useState(1);

  const {
    totalResultCount: totalRecords,
    pageSize,
  } = dataset.paging;

  const totalPages = Math.ceil(totalRecords / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const firstItemNumber = (currentPage - 1) * pageSize + 1;
  const lastItemNumber = (currentPage - 1) * pageSize + pageSize;

  useEffect(() => {
    if (!dataset.loading && dataset.paging.firstPageNumber !== currentPage) {
      dataset.paging.loadExactPage(currentPage);
    }
  }, [currentPage, dataset.loading]);

  function moveToFirst() {
    setCurrentPage(1);
  }

  function movePrevious() {
    setCurrentPage(currentPage - 1);
  }

  function moveNext() {
    setCurrentPage(currentPage + 1);
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
