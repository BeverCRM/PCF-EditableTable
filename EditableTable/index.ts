import { IInputs, IOutputs } from './generated/ManifestTypes';
import * as React from 'react';
import DataverseService from './Services/DataverseService';
import { EditableGrid, IDataSetProps } from './Components/EditableGrid';

export class EditableTable implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;

    private notifyOutputChanged: () => void;

    context: ComponentFramework.Context<IInputs>;
    targetEntityType: string;
    constructor() { }

    public init(
      context: ComponentFramework.Context<IInputs>,
      notifyOutputChanged: () => void,
    ): void {
      this.notifyOutputChanged = notifyOutputChanged;
      this.context = context;
      this.context.mode.trackContainerResize(true);
      this.targetEntityType = context.parameters.dataset.getTargetEntityType();
    }

    // eslint-disable-next-line max-len
    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
      DataverseService.setContext(context);
      
      const props: IDataSetProps = {
        dataset: context.parameters.dataset,
        targetEntityType: this.targetEntityType,
        width: context.mode.allocatedWidth,
        height: context.mode.allocatedHeight,
      };
      return React.createElement(EditableGrid, props);
    }

    public getOutputs(): IOutputs { return { }; }

    public destroy(): void { }
}
