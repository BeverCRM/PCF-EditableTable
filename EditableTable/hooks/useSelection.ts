import * as React from 'react';
import { Selection } from '@fluentui/react/lib/DetailsList';

type DataSet = ComponentFramework.PropertyTypes.DataSet;
type Entity = ComponentFramework.WebApi.Entity;

export const useSelection = (dataset: DataSet) => {
  const [selectedRecordIds, setSelectedRecordIds] = React.useState<any[]>([]);

  const selection = new Selection({
    onSelectionChanged: () => {
      const recordIds = selection.getSelection()
        .filter((row: Entity) => row.key.length > 15)
        .map((row : Entity) => row.key);

      dataset.setSelectedRecordIds(recordIds);
      setSelectedRecordIds(recordIds);
    },
  });

  return {
    selection,
    selectedRecordIds,
  };
};
