import { IInputs, IOutputs } from './generated/ManifestTypes';
import * as React from 'react';
import DataverseService from './Services/DataverseService';
import { EditableGrid, IDataSetProps } from './Components/EditableGrid';
import { Loading } from './Components/Loading';

export class EditableTable implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private theComponent: ComponentFramework.ReactControl<IInputs, IOutputs>;

    private notifyOutputChanged: () => void;

    private ok: any;
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
      React.createElement(Loading, { isLoading: true });
      const entityMetadata = context.utils.getEntityMetadata(this.targetEntityType);
      DataverseService.setContext(context, this.targetEntityType, entityMetadata);

      const allocatedWidth = parseInt(context.mode.allocatedWidth as unknown as string);
      const allocatedHeight = parseInt(context.mode.allocatedHeight as unknown as string);
      this.ok = 1;
      const props: IDataSetProps = {
        dataset: context.parameters.dataset,
        targetEntityType: this.targetEntityType,
        width: allocatedWidth,
        height: allocatedHeight,
        isLoading: true,
      };
      return React.createElement(EditableGrid, props);
    }

    public getOutputs(): IOutputs { return { }; }

    public destroy(): void { }
}
