import {Image, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Octicons from 'react-native-vector-icons/Octicons';

// custom import
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import CText from '../common/CText';
import { useNavigation } from '@react-navigation/native';
import { StackNav } from '../../navigation/NavigationKey';

export default function NearByDoctorsComponent({item}) {
  const colors = useSelector(state => state.theme.theme);
  const navigation = useNavigation();

    const onPressDoctorDetail = () => {
      navigation.navigate(StackNav.DoctorDetail, {item: item});
    };

  return (
    <TouchableOpacity style={localStyles.mainContainer} onPress={onPressDoctorDetail}>
      <Image source={item.image} style={localStyles.imageStyle} />
      <View>
        <CText type={'B16'}>{item.drName}</CText>
        <CText type={'S12'} color={colors.labelColor} style={styles.mt5}>
          {item.specialist}
        </CText>
        <View style={localStyles.ratingContainer}>
          <Octicons
            name={'star-fill'}
            size={moderateScale(16)}
            color={colors.ratingStar}
          />
          <CText type={'S12'}>{item.rate}</CText>
          <CText color={colors.labelColor} type={'S12'}>
            {item.review}
          </CText>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.flexRow,
    ...styles.g15,
    ...styles.itemsCenter,
  },
  imageStyle: {
    height: moderateScale(88),
    width: moderateScale(88),
  },
  ratingContainer: {
    ...styles.flexRow,
    ...styles.g5,
    ...styles.mt15,
  },
});
