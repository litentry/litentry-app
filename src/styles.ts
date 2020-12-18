import {StyleSheet, Platform} from 'react-native';

export const standardPadding = 8;

const dividerPlain = {
  height: 2,
  width: '100%',
};

const globalStyles = StyleSheet.create({
  paddedContainer: {
    padding: standardPadding * 2,
  },
  divider: {
    marginVertical: standardPadding,
    ...dividerPlain,
  },
  dividerPlain,
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },
  inlineIconDimension: {
    width: 20,
    height: 20,
  },
  dialogMinHeight: {
    minHeight: 240,
  },
});

export const monofontFamily = Platform.OS === 'ios' ? 'Menlo' : 'monospace';
export const colorGreen = '#1BC575';
export const colorRed = '#FF3D71';

export default globalStyles;
