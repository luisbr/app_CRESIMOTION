import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {styles} from '../../../theme';
import {moderateScale} from '../../../common/constants';

type Props = {
  progress: number;
};

export default function ProgressBar({progress}: Props) {
  const colors = useSelector(state => state.theme.theme);
  const width = Math.max(0, Math.min(1, progress)) * 100;
  return (
    <View style={[localStyles.track, {backgroundColor: colors.inputBg}]}
    >
      <View
        style={[
          localStyles.fill,
          {backgroundColor: colors.primary, width: `${width}%`},
        ]}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  track: {
    ...styles.mb15,
    height: moderateScale(8),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
  },
});
