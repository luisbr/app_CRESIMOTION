import React from 'react';
import {StyleSheet, TouchableOpacity, View} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSelector} from 'react-redux';
import {styles} from '../../../theme';
import CText from '../../../components/common/CText';
import {moderateScale} from '../../../common/constants';

type Props = {
  title: string;
  description?: string | null;
  selected?: boolean;
  onPress?: () => void;
};

export default function ChecklistItem({title, description, selected, onPress}: Props) {
  const colors = useSelector(state => state.theme.theme);
  return (
    <TouchableOpacity
      style={[localStyles.container, {borderColor: colors.inputBg}]}
      onPress={onPress}
    >
      <View style={localStyles.row}>
        <Ionicons
          name={selected ? 'checkbox' : 'square-outline'}
          size={moderateScale(22)}
          color={selected ? colors.primary : colors.grayScale2}
        />
        <View style={localStyles.textBlock}>
          <CText type={'S16'}>{title}</CText>
          {!!description && (
            <CText type={'S12'} color={colors.labelColor}>
              {description}
            </CText>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  container: {
    ...styles.mb10,
    ...styles.p15,
    borderWidth: 1,
    borderRadius: moderateScale(12),
  },
  row: {
    ...styles.rowStart,
    ...styles.g10,
  },
  textBlock: {
    ...styles.flex,
  },
});
