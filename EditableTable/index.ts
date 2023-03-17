import { IInputs, IOutputs } from './generated/ManifestTypes';
import * as React from 'react';
import { DataverseService, IDataverseService } from './services/DataverseService';
import { Wrapper } from './components/AppWrapper';
import { Store } from './utils/types';
import { callConfigureStore } from './store/store';

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
    this._store = callConfigureStore();
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    if (context.mode.allocatedWidth > 0) {
      return React.createElement(Wrapper, {
        dataset: context.parameters.dataset,
        isControlDisabled: context.mode.isControlDisabled,
        width: context.mode.allocatedWidth,
        _service: this._service,
        _store: this._store,
      });
    }
    return React.createElement('div');
  }

  public getOutputs(): IOutputs { return {}; }

  public destroy(): void { }
}
