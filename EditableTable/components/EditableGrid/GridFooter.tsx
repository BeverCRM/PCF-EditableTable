import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { usePagination } from '../../hooks/usePagination';
import { BackIcon, footerButtonStyles, footerStyles,
  ForwardIcon, PreviousIcon } from '../../styles/FooterStyles';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IGridFooterProps {
    dataset: DataSet;
    selectedCount: number;
    resetScroll: () => void
}

export const GridFooter = ({ dataset, selectedCount, resetScroll } : IGridFooterProps) => {
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

  const selected = `${firstItemNumber} - ${lastItemNumber} of
    ${totalRecords === -1 ? '5000+' : totalRecords}
    ${selectedCount !== 0 ? `(${selectedCount} Selected)` : ''}`;

  return (
    <div className={footerStyles.content}
      style={{ position: 'sticky', bottom: '0', background: 'white', zIndex: '3', left: '0' }}>
      <span>{selected}</span>
      <div>
        <IconButton
          styles={footerButtonStyles}
          iconProps={PreviousIcon}
          onClick={() => {
            resetScroll();
            moveToFirst();
          }}
          disabled={!hasPreviousPage}
        />
        <IconButton
          styles={footerButtonStyles}
          iconProps={BackIcon}
          onClick={() => {
            resetScroll();
            movePrevious();
          }}
          disabled={!hasPreviousPage}
        />
        <span>Page {currentPage}</span>
        <IconButton
          styles={footerButtonStyles}
          iconProps={ForwardIcon}
          onClick={() => {
            resetScroll();
            moveNext();
          }}
          disabled={!hasNextPage}
        />
      </div>
    </div>
  );
};
