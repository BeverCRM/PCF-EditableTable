import { IColumn } from '@fluentui/react';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

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

export const mapDataSetItems = (dataset: DataSet): any[] =>
  dataset.sortedRecordIds.map(id => {
    const record = dataset.records[id];
    const attributes = dataset.columns.map(column => ({
      [column.name]: record.getFormattedValue(column.name),
    }));

    return Object.assign({
      key: record.getRecordId(),
      raw: record,
    }, ...attributes);
  });
