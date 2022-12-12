import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, IColumn,  IDetailsList,  IDetailsListProps,  Stack, TextField } from '@fluentui/react';
import { useSelection } from './Selection';
import { dataSetStyles } from '../Styles/DataSetStyles';
import {  _onRenderDetailsHeader, _onRenderRow } from '../Utils/Utils';
import { CommandBar } from './CommandBar';
import DataverseService from '../Services/DataverseService';
import { GridFooter } from './Footer';
import { useAppDispatch } from '../Store/Hooks';
import { deleteSelectedRecords, setChangedRecords } from '../Store/Features/RecordSlice';
import { Lookup } from './Lookup';
import { InputNumber } from './InputNumber';
import { DropDown } from './DropDown';
import { DateTimePicker } from './DatePicker';
import { setLogicalNames, setLookups } from '../Store/Features/LookupSlice';
import { getDropdowns } from '../Store/Features/DropdownSlice';
import { LookupField } from '../Store/Features/LookupSlice';
import { setCurrencySymbols, setNumber } from '../Store/Features/NumberSlice';
import { getLanguages, getTimeZones } from '../Store/Features/WholeFormatSlice';
import { WholeFormat } from './WholeFormat';
import { getDateBehavior } from '../Store/Features/DateSlice';
import { setLoading } from '../Store/Features/LoadingSlice';

type DataSet = ComponentFramework.PropertyTypes.DataSet;
// type Entity = ComponentFramework.WebApi.Entity;

export interface IDataSetProps {
  dataset: DataSet;
  targetEntityType: string;
  width: number;
  height: number;
}

// eslint-disable-next-line react/display-name
export const EditableGrid = ({ dataset, targetEntityType, height, width }: IDataSetProps) => {
    const [items, setItems] = React.useState<any>([]);
    const [columns, setColumns] = React.useState<IColumn[]>([]);
    const { selection, selectedRecordIds, onItemInvoked } = useSelection(dataset);
    const listRef = React.useRef<IDetailsList | null>(null);

    const dispatch = useAppDispatch();

    const refreshGrid = () => {
      dispatch(setLoading(true));
      setItems([]);
      dataset.refresh();
      listRef.current?.forceUpdate();
    };

    const newRow = () => {
      console.log(items);
      console.log(listRef.current);
      const emptyColumns = DataverseService.getColumns();
      const emptyAttributes = emptyColumns.map((column:any) => ({[column.name]: ''}));
      // items.unshift(Object.assign({key: '0', raw: ''}, ...emptyAttributes));
      setItems((previousItems: any) => [Object.assign({key: Date.now().toString(), raw: []}, ...emptyAttributes), ...previousItems]);
      // hideNoDataMessage();
      listRef.current?.forceUpdate();
      dispatch(setLoading(false));
    };

    const deleteRecords = () => {
      console.log('delete');
      dispatch(deleteSelectedRecords(selectedRecordIds)).unwrap()
      .then(() => {
        dataset.refresh();
        listRef.current?.forceUpdate();
        dispatch(setLoading(false));
      })
      .catch((error) => {
        console.log(error);
        dispatch(setLoading(false));
      })
    }

    const changedValue = React.useCallback((id: string, fieldName: string, fieldType: string, newValue: any): void => {
      dispatch(setChangedRecords({id, fieldName, fieldType, newValue}));
    }, []);

    React.useEffect(() => {
      const datasetColumns = dataset.columns
        .sort((column1, column2) => column1.order - column2.order)
        .map<IColumn>((column) : IColumn => ({
          name: column.displayName,
          fieldName: column.name,
          minWidth: column.visualSizeFactor,
          key: column.name,
          isResizable: true,
          data: column.dataType,
      }));
      setColumns(datasetColumns);
      
      const datasetItems = dataset.sortedRecordIds.map(id => {
        const record = dataset.records[id];
        const attributes = dataset.columns.map(column => ({
          [column.name]: record.getFormattedValue(column.name) })
        );

        return Object.assign({
          key: record.getRecordId(),
          raw: record,
        }, ...attributes);
      });
      setItems(datasetItems);

      const lookupFields: LookupField[] =[];
      const lookupColumns = datasetColumns.filter(column => { return column.data === 'Lookup.Simple'});
      lookupColumns.forEach(lookupColumn => {
        const item = datasetItems.find(item => {
            return item.raw?._record?.fields[lookupColumn?.fieldName as keyof any]?.reference?.etn !== undefined;
        });
        const lookupRefEntity = item?.raw?._record?.fields[lookupColumn?.fieldName as keyof any]?.reference?.etn;
        console.log(lookupRefEntity); 

        lookupFields.push({lookupColumn, lookupRefEntity});
      }); 

      if(lookupFields.length > 0) {
        dispatch(setLogicalNames(targetEntityType)).unwrap()
        .then((response) => {
          console.log(response);
          dispatch(setLookups(lookupFields));
          }
        )
        .catch((err) => {console.log(err);}) 
      }

      const dropdownFields = datasetColumns.filter(column => { 
        return (column.data === 'OptionSet' || column.data === 'TwoOptions' || column.data === 'MultiSelectPicklist')
      });
      if(dropdownFields.length > 0) {
        dispatch(getDropdowns(dropdownFields));
      }

      const numberFields = datasetColumns.filter(column => {
        return (column.data === 'Decimal' || column.data === 'Currency' || column.data === 'FP' || column.data === 'Whole.None')
      });
      if(numberFields.length > 0) {
        console.log(numberFields);
        dispatch(setNumber(numberFields));
        if(numberFields.some(field => { return field.data === 'Currency' })) {
          dispatch(setCurrencySymbols(datasetItems.map(item => {return item.key})));       
        }
        // for currency symbol go to record by id and get transactioncurrencyid field (lookup)
      }

      if(datasetColumns.find(column => {return column.data === 'Whole.TimeZone'})) {
        dispatch(getTimeZones());
      }
      
      if(datasetColumns.find(column => {return column.data === 'Whole.Language'})) {
        dispatch(getLanguages());
      }


      const dateFields = datasetColumns.filter(column => {return column.data.includes('DateAndTime') })
      if(dateFields.length > 0) {
        dispatch(getDateBehavior(dateFields))
      }

      dispatch(setLoading(false));
    }, [dataset]);

    const rootContainerStyle: React.CSSProperties = React.useMemo(() => ({
      height,
      width,
    }), [width, height]);

    // eslint-disable-next-line no-unused-vars
    const _renderItemColumn: IDetailsListProps['onRenderItemColumn'] = React.useCallback(
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
            return <DateTimePicker fieldName={column?.fieldName ? column?.fieldName : ''}
              dateOnly={false} key={column.key}
              defaultValue={new Date(fieldKey)}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />; // TODO

          case 'DateAndTime.DateOnly':
            return <DateTimePicker fieldName={column?.fieldName ? column?.fieldName : ''}
              dateOnly={true} defaultValue={new Date(fieldKey)}
              _onChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'OptionSet':
            return <DropDown fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={false}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Lookup.Simple':
            return <Lookup fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent}
              _onChange={changedValue.bind('', item.key)}
              lookupReference={lookupReference} />;

          case 'TwoOptions':
            return <DropDown fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={false} isTwoOptions={true}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Decimal':
            return <InputNumber fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'decimal'}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Currency':
            return <InputNumber fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'currency'} rowId={item.key}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'FP':
            return <InputNumber fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} type={'float'}
              onNumberChange={changedValue.bind('', item.key, column?.fieldName || '', '')} />;

          case 'Multiple':
            return <TextField defaultValue={fieldContent}
              styles={{root: {maxWidth: '400px'}}}
              onChange={(event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
                newValue?: string) => changedValue(item.key,
                column?.fieldName || '', '', newValue || '')}/>;

          case 'MultiSelectPicklist':
            return <DropDown fieldName={column?.fieldName ? column?.fieldName : ''}
              defaultValue={fieldContent} isMultiple={true}
              onOptionChange={changedValue.bind('', item.key, column?.fieldName || '', '')}
            />;

          case 'Whole.None':
            return <InputNumber fieldName={column?.fieldName ? column?.fieldName : ''}
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
    }, []);
    
    // if (items.length === 0) {
    //   showNoDataMessage();
    // }

    return <div className='container'>
      <Stack>
          {/* {loading && <Loading />} */}
          {/* <Loading /> */}
          <Stack horizontal horizontalAlign="end" className={dataSetStyles.buttons} >
            <CommandBar
              refreshGrid={refreshGrid}
              selectedRecordIds={selectedRecordIds}
              entityName={targetEntityType}
              newRow={newRow}
              deleteRecords={deleteRecords}
            ></CommandBar>
          </Stack>
          <Stack style={rootContainerStyle} >
            <DetailsList
              items = {items}
              columns = {columns}
              onRenderItemColumn={_renderItemColumn}
              onItemInvoked = {onItemInvoked}
              selection={selection}
              onRenderRow={_onRenderRow}
              onRenderDetailsHeader={_onRenderDetailsHeader}
              layoutMode={DetailsListLayoutMode.fixedColumns} 
              onActiveItemChanged={(item?: any, index?: any)=> console.log(item, index)}
              componentRef={listRef}
              styles={{ contentWrapper: {padding: items.length === 0 ? '50px' : '0' }}}
              onRowDidMount={(item?: any, index?: any) => {
                if(index === (items.length -1)) dispatch(setLoading(false));
              }}
            > 
            </DetailsList>
            { !items.length && (
              <Stack horizontalAlign='center' className='noDataContainer'>
                <div className='nodata'><span>No data available</span></div> 
              </Stack>
              )}
            <GridFooter dataset={dataset} selectedCount={selection.count}></GridFooter>
          </Stack>
        </Stack>
    </div>;
  };
