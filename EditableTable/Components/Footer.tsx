import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { usePagination } from './Pagination';
import { BackIcon, footerButtonStyles, footerStyles,
  ForwardIcon, PreviousIcon } from '../Styles/FooterStyles';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IGridFooterProps {
    dataset: DataSet;
    selectedCount: number;
}

export const GridFooter = ({ dataset, selectedCount } : IGridFooterProps) => {
  const {
    currentPage,
    firstItemNumber,
    lastItemNumber,
    totalRecords,
    moveToFirst,
    movePrevious,
    moveNext,
  } = usePagination(dataset);

  const { hasPreviousPage } = dataset.paging;
  const { hasNextPage } = dataset.paging;

  const selected = `${firstItemNumber} - ${lastItemNumber}
  of ${totalRecords} ${selectedCount !== 0 ? `(${selectedCount} Selected)` : ''}`;

  const page = `Page ${currentPage}`;

  return <div>
    <div className={footerStyles.content}>
      <span > {selected} </span>
      <div>
        <IconButton styles = {footerButtonStyles} iconProps={PreviousIcon}
          onClick={moveToFirst} disabled={!hasPreviousPage}/>
        <IconButton styles = {footerButtonStyles} iconProps={BackIcon}
          onClick={movePrevious} disabled={!hasPreviousPage}/>
        <span> {page} </span>
        <IconButton styles = {footerButtonStyles} iconProps={ForwardIcon}
          onClick={moveNext} disabled={!hasNextPage}/>
      </div>
    </div>
  </div>;
};
