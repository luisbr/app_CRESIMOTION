import {SafeAreaView, StyleSheet} from 'react-native';
import React from 'react';
import {useSelector} from 'react-redux';
import {styles} from '../../theme';

// custom import

export default CSafeAreaView = ({color, children, ...props}) => {
  const colors = useSelector(state => state.theme.theme);
  return (
    <SafeAreaView
      {...props}
      style={[
        localStyle(colors, props.style).root,
        {
          backgroundColor: color
            ? color
            : colors.dark
            ? colors.backgroundColor
            : colors.backgroundColor,
        },
      ]}>
      {children}
    </SafeAreaView>
  );
};

const localStyle = (colors, style) =>
  StyleSheet.create({
    root: {
      ...styles.flex,
      ...style,
    },
  });
