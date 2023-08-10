import { IButtonStyles, IIconProps } from '@fluentui/react';
import { mergeStyleSets } from '@fluentui/react/lib/Styling';

export const buttonStyles = mergeStyleSets({
  commandBarButton: {
    root: {
      color: 'black',
    },
    icon: {
      color: 'black',
    },
  },
  buttons: {
    height: '44px',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 20,
    position: 'sticky',
    top: '0',
    background: 'white',
    left: '0',
    zIndex: 3,
  },
});

export const commandBarButtonStyles: Partial<IButtonStyles> = {
  root: {
    color: 'black',
    backgroundColor: 'white',
  },
  rootHovered: {
    pointerEvents: 'cursor',
  },
  icon: {
    color: 'black',
  },
};

export const deleteIcon: IIconProps = { iconName: 'Delete' };
export const refreshIcon: IIconProps = { iconName: 'Refresh' };
export const addIcon: IIconProps = { iconName: 'Add' };
export const saveIcon: IIconProps = { iconName: 'Save' };
