import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { usePagination } from '../../hooks/usePagination';
import { BackIcon, footerButtonStyles, footerStyles,
  ForwardIcon, PreviousIcon } from '../../styles/FooterStyles';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IGridFooterProps {
    dataset: DataSet;
    selectedCount: number;
}

export const GridFooter = ({ dataset, selectedCount } : IGridFooterProps) => {
  const {
    totalRecords,
    currentPage,
    hasPreviousPage,
    hasNextPage,
    firstItemNumber,
    lastItemNumber,
    moveToFirst,
    movePrevious,
    moveNext,
  } = usePagination(dataset);

  // const isLoading = useAppSelector(state => state.loading.isLoading);
  const selected = `${firstItemNumber} - ${lastItemNumber} of
    ${totalRecords === -1 ? '5000+' : totalRecords}
    ${selectedCount !== 0 ? `(${selectedCount} Selected)` : ''}`;

  return (
    <div className={footerStyles.content}>
      <span>{selected}</span>
      <div>
        <IconButton
          styles={footerButtonStyles}
          iconProps={PreviousIcon}
          onClick={moveToFirst}
          disabled={!hasPreviousPage}
        />
        <IconButton
          styles={footerButtonStyles}
          iconProps={BackIcon}
          onClick={movePrevious}
          disabled={!hasPreviousPage}
        />
        <span>Page {currentPage}</span>
        <IconButton
          styles={footerButtonStyles}
          iconProps={ForwardIcon}
          onClick={moveNext}
          disabled={!hasNextPage}
        />
      </div>
    </div>
  );
};
