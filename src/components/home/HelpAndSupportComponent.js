import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {useSelector} from 'react-redux';
import CText from '../common/CText';
import {moderateScale} from '../../common/constants';
import {styles} from '../../theme';
import CDivider from '../common/CDivider';

const HelpAndSupportComponent = ({title, description}) => {
  const colors = useSelector(state => state.theme.theme);
  const [isDescShow, setIsDescShow] = useState(false);
  const onPressShow = () => setIsDescShow(!isDescShow);
  return (
    <View style={localStyles.helperContainer}>
      <TouchableOpacity onPress={onPressShow}>
        <View style={localStyles.helperInnerContainer}>
          <CText type={'S16'}>{title}</CText>
          <Ionicons
            name={!isDescShow ? 'chevron-down' : 'chevron-up'}
            size={moderateScale(18)}
            color={colors.textColor}
          />
        </View>
      </TouchableOpacity>
      {!!isDescShow && (
        <View style={localStyles.textContainer}>
          {!!description && (
            <CText type={'R14'} color={colors.grayScale1}>
              {description}
            </CText>
          )}
        </View>
      )}
      <CDivider />
    </View>
  );
};
export default HelpAndSupportComponent;
const localStyles = StyleSheet.create({
  helperContainer: {
    width: '100%',
  },
  helperInnerContainer: {
    ...styles.flexRow,
    ...styles.pv15,
    ...styles.justifyBetween,
  },
});
