import { useEffect, useState } from 'react';
import { setLoading } from '../store/features/LoadingSlice';
import { useAppDispatch } from '../store/hooks';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export const usePagination = (dataset: DataSet) => {
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useAppDispatch();

  const {
    totalResultCount: totalRecords,
    pageSize,
    hasNextPage,
    hasPreviousPage,
  } = dataset.paging;

  const totalPages = totalRecords !== -1
    ? Math.ceil(totalRecords / pageSize)
    : 5000;

  const firstItemNumber = totalPages === 0
    ? 0
    : (currentPage - 1) * pageSize + 1;
  const lastItemNumber = totalPages === 0
    ? 0
    : currentPage !== totalPages
      ? (currentPage - 1) * pageSize + pageSize
      : totalRecords;

  useEffect(() => {
    if (currentPage !== dataset.paging.firstPageNumber) {
      setCurrentPage(dataset.paging.firstPageNumber);
    }
  }, [dataset.paging.firstPageNumber]);

  function moveToPage(pageNumber: number) {
    dispatch(setLoading(true));
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
