import {StyleSheet, View} from 'react-native';
import React, {memo} from 'react';
import {moderateScale} from '../../common/constants';
import {useSelector} from 'react-redux';
import {styles} from '../../theme';

// Custom Imports

const CDivider = ({style, color}) => {
  const colors = useSelector(state => state.theme.theme);
  return (
    <View
      style={[
        localStyles.divider,
        style,
        {
          backgroundColor: color ? color : colors.dividerColor,
        },
      ]}
    />
  );
};
const localStyles = StyleSheet.create({
  divider: {
    height: moderateScale(1),
    width: '100%',
    ...styles.mv10,
  },
});
export default memo(CDivider);
