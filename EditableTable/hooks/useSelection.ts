import * as React from 'react';
import { Selection } from '@fluentui/react/lib/DetailsList';

type DataSet = ComponentFramework.PropertyTypes.DataSet;
type Entity = ComponentFramework.WebApi.Entity;

export const useSelection = (dataset: DataSet) => {
  const [selectedRecordIds, setSelectedRecordIds] = React.useState<string[]>([]);

  const selection = new Selection({
    onSelectionChanged: () => {
      const recordIds = selection.getSelection()
        .map<string>((row : Entity) => row.key);

      setSelectedRecordIds(recordIds);
      console.log(dataset.getSelectedRecordIds());
    },
  });

  return {
    selection,
    selectedRecordIds,
  };
};
