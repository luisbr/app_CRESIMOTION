import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import {useSelector} from 'react-redux';
import strings from '../../i18n/strings';
import {moderateScale} from '../../common/constants';
import {styles} from '../../theme';
import {MyAddressData} from '../../api/constant';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import CDivider from '../../components/common/CDivider';
import {StackNav} from '../../navigation/NavigationKey';

export default function MyAddress({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [isSelect, setIsSelect] = useState(1);

  const selectAddress = item => {
    setIsSelect(item.id);
  };

  const onPressAddIcon = () => {
    navigation.navigate(StackNav.AddNewAddress);
  };

  const onPressSelectAddress = () => {
    navigation.goBack();
  };

  const HeaderRIghtIcon = () => {
    return (
      <TouchableOpacity
        onPress={onPressAddIcon}
        style={[
          localStyles.addIconContainer,
          {
            borderColor: colors.dark ? colors.dividerColor : colors.grayScale2,
          },
        ]}>
        <Ionicons
          name={'add-outline'}
          color={colors.textColor}
          size={moderateScale(24)}
        />
      </TouchableOpacity>
    );
  };

  const addressDetail = ({item, index}) => {
    return (
      <TouchableOpacity
        style={localStyles.addressContainer}
        onPress={() => selectAddress(item)}>
        <View
          style={[
            localStyles.iconContainer,
            {
              backgroundColor: colors.inputBg,
            },
          ]}>
          <EvilIcons
            name={'location'}
            color={colors.primary}
            size={moderateScale(24)}
          />
        </View>
        <View style={styles.flex}>
          <View style={localStyles.innerContainer}>
            <View style={localStyles.textStyle}>
              <CText type={'S16'}>{item.title}</CText>
              <CText type={'S14'} color={colors.labelColor}>
                {item.phoneNo}
              </CText>
              <CText type={'S14'} color={colors.labelColor} numberOfLines={2}>
                {item.address}
              </CText>
              <CButton
                title={strings.changeAddress}
                bgColor={colors.backgroundColor}
                color={colors.primary}
                containerStyle={localStyles.btnStyle}
                type={'S12'}
                onPress={onPressAddIcon}
              />
            </View>
            <Ionicons
              name={
                isSelect === item.id ? 'checkmark-circle' : 'radio-button-off'
              }
              color={
                isSelect === item.id
                  ? colors.checkMark
                  : colors.dark
                  ? colors.dividerColor
                  : colors.indicatorColor
              }
              size={moderateScale(24)}
            />
          </View>
          <CDivider />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <CSafeAreaView>
      <CHeader
        title={strings.myAddress}
        rightAccessory={<HeaderRIghtIcon />}
        textStyle
      />
      <View style={localStyles.mainContainer}>
        <FlatList
          data={MyAddressData}
          renderItem={addressDetail}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => item.id.toString()}
        />
        <CButton title={strings.selectAddress} onPress={onPressSelectAddress} />
      </View>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  addIconContainer: {
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(24),
    ...styles.center,
    borderWidth: moderateScale(1),
  },
  addressContainer: {
    ...styles.flexRow,
    ...styles.g12,
  },
  iconContainer: {
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(24),
    ...styles.center,
  },
  mainContainer: {
    ...styles.p20,
    ...styles.g10,
    ...styles.flex,
    ...styles.justifyBetween,
  },
  innerContainer: {
    ...styles.flexRow,
    ...styles.justifyBetween,
  },
  textStyle: {
    ...styles.g5,
    ...styles.flex,
  },
  btnStyle: {
    ...styles.ph0,
    height: moderateScale(28),
    width: moderateScale(129),
    ...styles.mv5,
    ...styles.mt10,
  },
});
