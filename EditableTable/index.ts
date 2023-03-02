import { IInputs, IOutputs } from './generated/ManifestTypes';
import * as React from 'react';
import { DataverseService } from './services/DataverseService';
import { Wrapper } from './components/AppWrapper';
import { IDataverseService, Store } from './utils/types';
import { configureStore } from '@reduxjs/toolkit';
import lookupReducer from './store/features/LookupSlice';
import loadingReducer from './store/features/LoadingSlice';
import recordReducer from './store/features/RecordSlice';
import dropdownReducer from './store/features/DropdownSlice';
import numberReducer from './store/features/NumberSlice';
import wholeFormatReducer from './store/features/WholeFormatSlice';
import dateReducer from './store/features/DateSlice';
import datasetReducer from './store/features/DatasetSlice';

export class EditableTable implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private notifyOutputChanged: () => void;
  private _service: IDataverseService;
  public _store: Store;

  constructor() { }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this._service = new DataverseService(context);
    context.mode.trackContainerResize(true);
    this._store = configureStore({
      reducer: {
        dataset: datasetReducer,
        lookup: lookupReducer,
        number: numberReducer,
        dropdown: dropdownReducer,
        loading: loadingReducer,
        record: recordReducer,
        wholeFormat: wholeFormatReducer,
        date: dateReducer,
      },
    });
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    return React.createElement(Wrapper, {
      dataset: context.parameters.dataset,
      isControlDisabled: context.mode.isControlDisabled,
      width: context.mode.allocatedWidth,
      _service: this._service,
      _store: this._store,
    });
  }

  public getOutputs(): IOutputs { return {}; }

  public destroy(): void { }
}
