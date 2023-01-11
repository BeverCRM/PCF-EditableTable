import { IButtonStyles, IIconProps } from '@fluentui/react';
import { getTheme, mergeStyleSets } from '@fluentui/react/lib/Styling';

const theme = getTheme();

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
    paddingRight: '20px',
    display: 'flex',
    justifyContent: 'flex-end',
    marginTop: 20,
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

export const iconButtonStyles = {
  root: {
    color: theme.palette.neutralPrimary,
    marginLeft: 'auto',
    marginTop: '4px',
    marginRight: '2px',
  },
  rootHovered: {
    color: theme.palette.neutralDark,
  },
};

export const deleteIcon: IIconProps = { iconName: 'Delete' };
export const refreshIcon: IIconProps = { iconName: 'Refresh' };
export const addIcon: IIconProps = { iconName: 'Add' };
export const saveIcon: IIconProps = { iconName: 'Save' };
