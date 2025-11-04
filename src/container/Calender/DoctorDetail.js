import {Image, ScrollView, StyleSheet, View} from 'react-native';
import React from 'react';
import Octicons from 'react-native-vector-icons/Octicons';

// custom imports
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import {deviceWidth, getHeight, moderateScale} from '../../common/constants';
import {styles} from '../../theme';
import CText from '../../components/common/CText';
import {useSelector} from 'react-redux';
import images from '../../assets/images';
import CButton from '../../components/common/CButton';
import {StackNav} from '../../navigation/NavigationKey';

export default function DoctorDetail({route, navigation}) {
  const item = route?.params?.item;
  const colors = useSelector(state => state.theme.theme);

  const onPressBookAppointment = () => {
    navigation.navigate(StackNav.Appointment, {item: item});
  };

  return (
    <CSafeAreaView>
      <CHeader title={strings.detailDoctor} />
      <ScrollView
        contentContainerStyle={localStyles.mainContainer}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <Image source={item.image} style={localStyles.imageStyle} />
        <View style={localStyles.drNameContainer}>
          <CText type={'B16'}>{item.drName}</CText>
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
        <CText type={'S12'} color={colors.labelColor} style={styles.mt5}>
          {item.specialist}
        </CText>
        <CText type={'B16'} style={localStyles.descriptionHeader}>
          {strings.description}
        </CText>
        <CText
          type={'M14'}
          color={colors.labelColor}
          style={localStyles.descriptionText}>
          {strings.descriptionDesc}
        </CText>
        <CText type={'B16'} style={localStyles.descriptionHeader}>
          {strings.location}
        </CText>
        <Image source={images.MapImage} style={localStyles.mapImageStyle} />
        <CButton
          title={strings.makeAppointment}
          onPress={onPressBookAppointment}
        />
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  imageStyle: {
    width: deviceWidth - moderateScale(40),
    height: getHeight(200),
    borderRadius: moderateScale(16),
    ...styles.mt25,
    ...styles.mb15,
  },
  mainContainer: {
    ...styles.ph20,
  },
  drNameContainer: {
    ...styles.rowSpaceBetween,
  },
  ratingContainer: {
    ...styles.flexRow,
    ...styles.g5,
  },
  descriptionHeader: {
    ...styles.mt15,
    ...styles.mb8,
  },
  descriptionText: {
    lineHeight: moderateScale(22),
  },
  mapImageStyle: {
    height: getHeight(144),
    borderRadius: moderateScale(16),
    width: deviceWidth - moderateScale(40),
    ...styles.mt10,
  },
});
