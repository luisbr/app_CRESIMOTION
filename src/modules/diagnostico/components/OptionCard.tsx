import React from 'react';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector} from 'react-redux';
import {styles} from '../../../theme';
import CText from '../../../components/common/CText';
import {moderateScale} from '../../../common/constants';

type Props = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

export default function OptionCard({label, selected, onPress}: Props) {
  const colors = useSelector(state => state.theme.theme);
  return (
    <TouchableOpacity
      style={[
        localStyles.card,
        {
          borderColor: selected ? colors.primary : colors.inputBg,
          backgroundColor: selected ? colors.primary : colors.inputBg,
        },
      ]}
      onPress={onPress}
    >
      <CText type={'S16'} color={selected ? colors.white : colors.textColor}>
        {label}
      </CText>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  card: {
    ...styles.p15,
    ...styles.mb10,
    borderWidth: 1,
    borderRadius: moderateScale(16),
  },
});
