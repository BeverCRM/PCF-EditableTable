import { IButtonStyles } from '@fluentui/react/lib/components/Button/Button.types';
import { IDetailsColumnStyles } from
  '@fluentui/react/lib/components/DetailsList/DetailsColumn.types';
import { IIconProps } from '@fluentui/react/lib/components/Icon/Icon.types';
import { IStackStyles } from '@fluentui/react/lib/components/Stack/Stack.types';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';

export const stackStyles: Partial<IStackStyles> = { root: { height: 44, marginLeft: 100 } };
export const deleteIcon: IIconProps = { iconName: 'Delete' };
export const refreshIcon: IIconProps = { iconName: 'Refresh' };
export const addIcon: IIconProps = { iconName: 'Add' };
export const saveIcon: IIconProps = { iconName: 'Save' };

export const dataSetStyles = mergeStyleSets({
  content: {
    width: '100%',
    display: 'inline-block',
    position: 'relative',
    height: '40px',
  },

  buttons: {
    height: '44px',
    paddingRight: '20px',
  },
  detailsList: {
    paddingTop: '0px',
  },
  commandBarButton: {
    root: {
      color: 'black',
    },
    icon: {
      color: 'black',
    },
  },
});

export const CommandBarButtonStyles: Partial<IButtonStyles> = {

  root: {
    color: 'black',
    backgroundColor: 'white',
  },
  icon: {
    color: 'black',
  },
};

export const detailsHeaderStyles: Partial<IDetailsColumnStyles> = {
  cellName: {
    fontSize: '12px',
  },
};
