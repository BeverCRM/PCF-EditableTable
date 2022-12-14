import * as React from 'react';
import { IconButton } from '@fluentui/react/lib/Button';
import { usePagination } from '../../hooks/Pagination';
import { BackIcon, footerButtonStyles, footerStyles,
  ForwardIcon, PreviousIcon } from '../../styles/FooterStyles';

type DataSet = ComponentFramework.PropertyTypes.DataSet;

export interface IGridFooterProps {
    dataset: DataSet;
    selectedCount: number;
}

// type IconButtonProps = {
//   order: number,
//   icon: IIconProps,
//   onClick: () => void,
//   disabled: boolean
// }

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

  const selected = `${firstItemNumber} - ${lastItemNumber} of ${totalRecords}
    ${selectedCount !== 0 ? `(${selectedCount} Selected)` : ''}`;
  const page = `Page ${currentPage}`;

  // const buttons: IconButtonProps[] = [
  //   { order: 1, icon: PreviousIcon, onClick: moveToFirst, disabled: !hasPreviousPage },
  //   { order: 2, icon: BackIcon, onClick: movePrevious, disabled: !hasPreviousPage },
  //   { order: 3, icon: ForwardIcon, onClick: moveNext, disabled: !hasNextPage },
  // ];

  // const listButtons = buttons.map(button =>
  //   <IconButton
  //     key={button.order}
  //     styles = {footerButtonStyles}
  //     iconProps={button.icon}
  //     onClick={button.onClick}
  //     disabled={button.disabled}
  //   />);

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
