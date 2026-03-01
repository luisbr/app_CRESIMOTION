import React, {useState} from 'react';
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
  showInfoIcon?: boolean;
};

export default function ChecklistItem({title, description, selected, onPress, showInfoIcon}: Props) {
  const colors = useSelector(state => state.theme.theme);
  const [showInfo, setShowInfo] = useState(false);
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
          {!!description && !showInfoIcon && (
            <CText type={'S12'} color={colors.labelColor}>
              {description}
            </CText>
          )}
        </View>
        {!!description && showInfoIcon && (
          <TouchableOpacity
            onPress={() => setShowInfo(prev => !prev)}
            style={localStyles.infoButton}
          >
            <Ionicons
              name={'information-circle-outline'}
              size={moderateScale(18)}
              color={colors.primary}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!description && showInfoIcon && showInfo && (
        <View style={[localStyles.tooltip, {backgroundColor: colors.inputBg}]}>
          <CText type={'S12'} color={colors.labelColor}>
            {description}
          </CText>
        </View>
      )}
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
    ...styles.itemsCenter,
  },
  textBlock: {
    ...styles.flex,
  },
  infoButton: {
    paddingLeft: moderateScale(6),
    paddingVertical: moderateScale(4),
  },
  tooltip: {
    marginTop: moderateScale(8),
    padding: moderateScale(8),
    borderRadius: moderateScale(8),
  },
});
