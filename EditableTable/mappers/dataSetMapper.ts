import { IColumn, ITag } from '@fluentui/react';
import { IDataverseService } from '../services/DataverseService';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export type Row = {
  key: string,
  columns: Column[]
};

export type Column = {
  schemaName: string,
  formattedValue: string,
  rawValue: string | null,
  lookup?: ITag,
  type: string,
};

const SELECTION_WIDTH = 48;
const PADDING_WIDTH = 16;
const EXCESS_WIDTH = 20;

export const isNewRow = (row: Row) => row.key.length < 15;

export const getColumnsTotalWidth = (dataset: DataSet) =>
  dataset.columns.reduce((result, column) => result + column.visualSizeFactor, 0);

const calculateAdditinalWidth =
(dataset: DataSet, columnTotalWidth: number, tableWidth: number) => {
  const widthDiff = tableWidth - columnTotalWidth;
  const columnCount = dataset.columns.length;

  if (widthDiff > 0) {
    return Math.floor((widthDiff / columnCount) -
      (SELECTION_WIDTH + PADDING_WIDTH * columnCount) / columnCount) - EXCESS_WIDTH;
  }
  return 0;
};

export const mapDataSetColumns =
(dataset: DataSet, _service: IDataverseService): IColumn[] => {
  const columnTotalWidth = getColumnsTotalWidth(dataset);
  const tableWidth = _service.getAllocatedWidth();
  const sortingColumns = dataset.sorting;

  return dataset.columns
    .sort((column1, column2) => column1.order - column2.order)
    .filter(column => !column.isHidden)
    .map<IColumn>((column): IColumn => ({
      name: column.displayName,
      fieldName: column.name,
      minWidth: 20,
      key: column.name,
      isResizable: true,
      data: column.dataType,
      calculatedWidth: column.visualSizeFactor +
        calculateAdditinalWidth(dataset, columnTotalWidth, tableWidth),
      isSorted: sortingColumns.some(col => col.name === column.name),
      isSortedDescending: sortingColumns.find(col => col.name === column.name)?.sortDirection === 1,
      showSortIconWhenUnsorted: true,
    }));
};

export const mapDataSetRows = (dataset: DataSet): Row[] =>
  dataset.sortedRecordIds.map(id => {
    const record = dataset.records[id];

    const columns = dataset.columns.map<Column>(column => ({
      schemaName: column.name,
      rawValue: record.getValue(column.name)?.toString() as string || null,
      formattedValue: record.getFormattedValue(column.name),
      lookup: record.getValue(column.name)
        ? {
          name: record.getFormattedValue(column.name) ?? '(No Name)',
          // eslint-disable-next-line no-extra-parens
          key: (record.getValue(column.name) as ComponentFramework.EntityReference)?.id?.guid,
        }
        : undefined,
      type: column.dataType,
    }));

    return {
      key: record.getRecordId(),
      columns,
    };
  });
