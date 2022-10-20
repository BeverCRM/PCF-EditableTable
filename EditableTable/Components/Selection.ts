import * as React from 'react';
import { Selection } from '@fluentui/react/lib/DetailsList';

type DataSet = ComponentFramework.PropertyTypes.DataSet;
type Entity = ComponentFramework.WebApi.Entity;

export const useSelection = (dataset: DataSet) => {
  const [selectedCount, setSelectedCount] = React.useState<number>(0);
  const [selectedItems, setSelectedItems] = React.useState<any>([]);
  const [selectedRecordIds, setSelectedRecordIds] = React.useState<any>([]);
  const [selection] = React.useState(new Selection({
    onSelectionChanged: () => {
      const recordIds = selection.getSelection().map((item : Entity) => item.key);
      dataset.setSelectedRecordIds(recordIds);
      setSelectedCount(recordIds.length);
      setSelectedItems(selection.getSelection());
      setSelectedRecordIds(recordIds);
    },
  }));

  const onItemInvoked = React.useCallback((item : Entity) : void => {
    const record = dataset.records[item.key];
    dataset.openDatasetItem(record.getNamedReference());
  }, [dataset]);
  return {
    selection,
    selectedCount,
    selectedItems,
    onItemInvoked,
    selectedRecordIds,
  };
};
