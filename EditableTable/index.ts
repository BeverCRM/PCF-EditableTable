import { IInputs, IOutputs } from './generated/ManifestTypes';
import * as React from 'react';
import DataverseService from './Services/DataverseService';
import { IDataSetProps } from './Components/EditableGrid';
import { Wrapper } from './Components/AppWrapper';

export class EditableTable implements ComponentFramework.ReactControl<IInputs, IOutputs> {
  private notifyOutputChanged: () => void;

  private context: ComponentFramework.Context<IInputs>;

  constructor() { }

  public init(
    context: ComponentFramework.Context<IInputs>,
    notifyOutputChanged: () => void,
  ): void {
    this.notifyOutputChanged = notifyOutputChanged;
    this.context = context;
    this.context.mode.trackContainerResize(true);
  }

  public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
    DataverseService.setContext(context);
    const props: IDataSetProps = {
      dataset: context.parameters.dataset,
      targetEntityType: context.parameters.dataset.getTargetEntityType(),
      width: context.mode.allocatedWidth,
      height: context.mode.allocatedHeight,
    };
    return React.createElement(Wrapper, props);
  }

  public getOutputs(): IOutputs { return {}; }

  public destroy(): void { }
}
