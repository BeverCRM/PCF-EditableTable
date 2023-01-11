import { IColumn } from '@fluentui/react';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export type Row = {
  key: string,
  columns: Column[]
};

export type Column = {
  schemaName: string,
  formattedValue: string,
  rawValue: any | string | ComponentFramework.EntityReference | undefined,
};

export const mapDataSetColumns = (dataset: DataSet): IColumn[] =>
  dataset.columns
    .sort((column1, column2) => column1.order - column2.order)
    .map<IColumn>((column): IColumn => ({
      name: column.displayName,
      fieldName: column.name,
      minWidth: column.visualSizeFactor,
      key: column.name,
      isResizable: true,
      data: column.dataType,
    }));

export const mapDataSetItems = (dataset: DataSet): Row[] =>
  dataset.sortedRecordIds.map(id => {
    const record = dataset.records[id];

    const columns = dataset.columns.map<Column>(column => ({
      schemaName: column.name,
      rawValue: record.getValue(column.name), // fieldValue | optionsetValue
      formattedValue: record.getFormattedValue(column.name), // fieldContent
    }));

    return {
      key: record.getRecordId(),
      columns,
    };
  });
