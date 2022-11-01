import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn,
  IDetailsList,
  IDetailsListProps, Stack, TextField } from '@fluentui/react';
import { GridFooter } from './Footer';
import { useSelection } from './Selection';
import { dataSetStyles } from '../Styles/DataSetStyles';
import { showMessage, _onRenderDetailsHeader, _onRenderRow } from '../Utils/Utils';
import { CommandBar } from './CommandBar';
import { DropDown } from './DropDown';
import { Lookup } from './Lookup';
import { DateTimePicker } from './DatePicker';
import { InputNumber } from './InputNumber';
import { WholeFormat } from './WholeFormat';
import { Loading } from './Loading';
import { Record } from '../Utils/RecordModel';
import DataverseService from '../Services/DataverseService';

type DataSet = ComponentFramework.PropertyTypes.DataSet;
// type Entity = ComponentFramework.WebApi.Entity;

export interface IDataSetProps {
  dataset: DataSet;
  targetEntityType: string;
  width?: number;
  height?: number;
  isLoading: boolean;
}

// eslint-disable-next-line react/display-name
export const EditableGrid = React.memo(
  ({ dataset, targetEntityType, width, height }: IDataSetProps) => {
    const [items, setItems] = React.useState<any>([]);
    const [columns, setColumns] = React.useState<IColumn[]>([]);
    const [isLoading, setIsLoading] = React.useState<boolean>(true);
    const [changedRecords, setChangedRecords] = React.useState<Record[]>([]);

    const { selection, selectedRecordIds, onItemInvoked } = useSelection(dataset);
    const listRef = React.useRef<IDetailsList | null>(null);

    const refreshGrid = () => {
      setIsLoading(true);
      listRef.current?.forceUpdate();
      return dataset.refresh();
    };

    React.useEffect(() => {     
      setIsLoading(false);
    }, [isLoading]);

    React.useEffect(() => {
      const datasetColumns = dataset.columns.sort((column1, column2) =>
        column1.order - column2.order).map(column => ({
        name: column.displayName,
        fieldName: column.name,
        minWidth: column.visualSizeFactor,
        key: column.name,
        isResizable: true,
        data: column.dataType,
      }));
      setColumns(datasetColumns);

      const datasetItems = dataset.sortedRecordIds.map(id => {
        const entityId = dataset.records[id];
        const attributes = dataset.columns.map(column => ({ [column.name]:
          entityId.getFormattedValue(column.name) }));

        return Object.assign({
          key: entityId.getRecordId(),
          raw: entityId,
        }, ...attributes);
      });
      // const emptyAttributes = dataset.columns.map((column:any) => ({[column.name]: ""}));
      // items.unshift(Object.assign({key: 0, raw: ""}, ...emptyAttributes));

      setItems(datasetItems);
    }, [dataset]);

    const changedValue =
    (id: string, fieldName: string, fieldType: string, newValue: any): void => {
      const currentRecord = changedRecords?.find(record => record.id === id);
      if (currentRecord === undefined) {
        changedRecords?.push({ id, data: [{ fieldName, newValue, fieldType }] });
      }
      else {
        const currentField = currentRecord.data.find(data => data.fieldName === fieldName);
        if (currentField === undefined) {
          currentRecord.data.push({ fieldName, newValue, fieldType });
        }
        else {
          currentField.newValue = newValue;
        }
      }
      setChangedRecords(changedRecords);
    };

    const rootContainerStyle: React.CSSProperties = React.useMemo(() => ({
      height,
      width,
    }), [width, height]);

    const _renderItemColumn: IDetailsListProps['onRenderItemColumn'] = 
    (item: any, index: number | undefined, column: IColumn | undefined) => {
      const fieldContent = item[column?.fieldName as keyof any] as any;
      const fieldKey = item.raw?._record?.fields[column?.fieldName as keyof any]?.value;
      const lookupReference = item.raw?._record?.fields[column?.fieldName as keyof any]?.reference?.etn;

      if (column !== undefined && fieldContent !== undefined) {
        switch (column.data) {
          case 'SingleLine.Text':
            return <TextField defaultValue={fieldContent}
              styles={{root: {maxWidth: '300px'}}}
              onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                newValue?: string) => changedValue(item.key,
                column?.fieldName || '', '', newValue || '')}/>;

          case 'DateAndTime.DateAndTime':
            return <DateTimePicker entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              dateOnly={false} key={column.key}
              defaultValue={new Date(fieldKey)}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />; // TODO

          case 'DateAndTime.DateOnly':
            return <DateTimePicker entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              dateOnly={true} defaultValue={new Date(fieldKey)}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'OptionSet':
            return <DropDown entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={false}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Lookup.Simple':
            return <Lookup fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent}
              _onChange={changedValue.bind('', item.key)}
              entityName={targetEntityType}
              lookupReference={lookupReference} />;

          case 'TwoOptions':
            return <DropDown entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={false} isTwoOptions={true}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Decimal':
            return <InputNumber entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'decimal'}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Currency':
            return <InputNumber entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'currency'}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'FP':
            return <InputNumber entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'float'}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Multiple':
            return <TextField defaultValue={fieldContent}
              styles={{root: {maxWidth: '400px'}}}
              onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                newValue?: string) => changedValue(item.key,
                column?.fieldName || '', '', newValue || '')}/>;

          case 'MultiSelectPicklist':
            return <DropDown entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={true}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Whole.None':
            return <InputNumber entityName={targetEntityType}
              fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={''}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Whole.Duration':
            return <WholeFormat defaultValue={fieldKey} type={'duration'}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Whole.Language':
            return <WholeFormat defaultValue={fieldKey} type={'language'}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Whole.TimeZone':
            return <WholeFormat defaultValue={fieldContent} type={'timezone'}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          default:
            return <TextField defaultValue={fieldContent}
              styles={{root: {maxWidth: '300px'}}}
              onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                newValue?: string) => changedValue(item.key,
                column?.fieldName || '', '', newValue || '')}/>;
        }
      }
    };

    if (items.length === 0) showMessage();

    const newRow = () => {
      console.log(targetEntityType);
      setIsLoading(true);
      console.log(listRef.current);

      const emptyColumns = DataverseService.getColumns();
      const emptyAttributes = emptyColumns.map((column:any) => ({[column.name]: ''}));
      items.unshift(Object.assign({key: '0', raw: ''}, ...emptyAttributes));
      setItems(items);

      listRef.current?.forceUpdate();
    }

    const setLoading = (e: any) => {
      console.log(e);
      setIsLoading(true);
    }

    return <div className='container'>
      <Stack>
        <Loading isLoading={isLoading} />
        <Stack horizontal horizontalAlign="end" className={dataSetStyles.buttons}>
          <CommandBar
            isDisabled={isLoading}
            refreshGrid={refreshGrid}
            selectedRecordIds={selectedRecordIds}
            changedRecordIds={changedRecords}
            entityName={targetEntityType}
            newRow={newRow}
            setLoading={setLoading.bind(this)}
          ></CommandBar>
        </Stack>
        <Stack style={rootContainerStyle}>
          <DetailsList
            items = {items}
            columns = {columns}
            onRenderItemColumn={_renderItemColumn}
            onItemInvoked = {onItemInvoked}
            selection={selection}
            onRenderRow={_onRenderRow}
            onRenderDetailsHeader={_onRenderDetailsHeader}
            layoutMode={DetailsListLayoutMode.fixedColumns}
            onActiveItemChanged={()=> console.log('clicked')}
            componentRef={listRef}
            styles={{ contentWrapper: {display: isLoading ? 'none' : 'flex' }}}
          >
          </DetailsList>
          <GridFooter dataset={dataset} selectedCount={selection.count}></GridFooter>
        </Stack>
      </Stack>
    </div>;
  });
