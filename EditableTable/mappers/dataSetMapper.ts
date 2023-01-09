import { IColumn } from '@fluentui/react';
type DataSet = ComponentFramework.PropertyTypes.DataSet;

export type Row = {
  key: string,
  columns: Column[]
};

export type Column = {
  schemaName: string,
  formattedValue: string,
  rawValue: string | undefined,
  lookupValue?: ComponentFramework.EntityReference,
  wholeFormatValue?: any,
  newValue?: any
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

export const mapDataSetItems = (dataset: DataSet): any[] =>
  dataset.sortedRecordIds.map(id => {
    const record = dataset.records[id];
    // const attributes = dataset.columns.map(column => ({
    //   [column.name]: record.getFormattedValue(column.name),
    // }));

    const columns = dataset.columns.map<Column>(column => ({
      schemaName: column.name,
      rawValue: record.getValue(column.name)?.toString(), // fieldValue | optionsetValue
      formattedValue: record.getFormattedValue(column.name), // fieldContent
      lookupValue: record.getValue(column.name) as ComponentFramework.EntityReference,
      wholeFormatValue: record.getValue(column.name) as any,
    }));

    // const fieldContent = item[column?.fieldName as keyof any] as any;
    // const fieldValue = item.raw?._record?.fields[column?.fieldName as keyof any]?.value;
    // const optionsetValue: string = item.raw?._record?.fields[column?.fieldName!]?.valueString;
    // const multiselectValue = column?.data === 'MultiSelectPicklist' ? fieldValue?.split(',') : [];
    // const currentRecord = item[column?.fieldName!] === '' || item[column?.fieldName!] === null
    //   ? '' : item?.raw?.getValue(column?.fieldName!);

    // const lookupReference = currentRecord?.etn;
    // const lookupDefaultValue = column?.data === 'Lookup.Simple' && fieldContent && currentRecord
    //   ? [{ name: fieldContent, key: currentRecord?.id?.guid }] : undefined;
    // need to pass whatever is in the console now. thats the items[] i need.
    // change the editable grid to get this items and pass them to grid cell
    // in grid cell change the logic of passing the default values

    // (onchange sets the value to the state)
    // need to have hof in editable grid to change the itsm and the changedValue in gridCell

    return {
      key: record.getRecordId(),
      columns,
    };
  });
