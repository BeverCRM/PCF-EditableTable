import { IColumn, ITag } from '@fluentui/react';
import { getAllocatedWidth } from '../services/DataverseService';
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
};

export const isNewRow = (row: Row) => row.key.length < 15;

export const getColumnsTotalWidth = (dataset: DataSet) =>
  dataset.columns.reduce((a, b) => a + b.visualSizeFactor, 0);

const calculateAdditinalWidth = (dataset: DataSet, columnTotalWidth: number) => {
  const tableWidth = getAllocatedWidth();
  const widthDiff = tableWidth - columnTotalWidth;
  const columnCount = dataset.columns.length;

  if (widthDiff > 0) {
    return Math.floor((widthDiff / columnCount) - (48 + 16 * columnCount) / columnCount) - 20;
  }
  return 0;
};

export const mapDataSetColumns = (dataset: DataSet): IColumn[] => {
  const columnTotalWidth = getColumnsTotalWidth(dataset);
  return dataset.columns
    .sort((column1, column2) => column1.order - column2.order)
    .map<IColumn>((column): IColumn => ({
      name: column.displayName,
      fieldName: column.name,
      minWidth: 20,
      key: column.name,
      isResizable: true,
      data: column.dataType,
      calculatedWidth: column.visualSizeFactor + calculateAdditinalWidth(dataset, columnTotalWidth),
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
    }));

    return {
      key: record.getRecordId(),
      columns,
    };
  });
