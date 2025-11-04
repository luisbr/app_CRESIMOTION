import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import {moderateScale} from '../../common/constants';
import {MyPaymentData} from '../../api/constant';
import {styles} from '../../theme';
import CButton from '../../components/common/CButton';
import CText from '../../components/common/CText';
import CDivider from '../../components/common/CDivider';
import {StackNav} from '../../navigation/NavigationKey';

export default function MyPayment({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [isSelect, setIsSelect] = useState(1);

  const selectAddress = item => {
    setIsSelect(item.id);
  };

  const onPressAddCard = () => {
    navigation.navigate(StackNav.AddNewCard);
  };

  const onPressSelectPayment = () => {
    navigation.goBack();
  };
  const HeaderRIghtIcon = () => {
    return (
      <TouchableOpacity
        onPress={onPressAddCard}
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

  const paymentCardDetail = ({item, index}) => {
    return (
      <TouchableOpacity
        style={localStyles.addressContainer}
        onPress={() => selectAddress(item)}>
        <View
          style={[
            localStyles.iconContainer,
            {
              borderColor: colors.light && colors.grayScale2,
              backgroundColor: colors.dark
                ? colors.indicatorColor
                : colors.backgroundColor,
            },
          ]}>
          {item.icon}
        </View>
        <View style={styles.flex}>
          <View style={localStyles.innerContainer}>
            <View style={localStyles.textStyle}>
              <CText type={'S16'}>{item.title}</CText>
              <CText type={'S14'} color={colors.labelColor}>
                {item.cardNo}
              </CText>
              <CText type={'S14'} color={colors.labelColor} numberOfLines={2}>
                {item.holderName}
              </CText>
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
        title={strings.myPayment}
        rightAccessory={<HeaderRIghtIcon />}
        textStyle
      />
      <View style={localStyles.mainContainer}>
        <FlatList
          data={MyPaymentData}
          renderItem={paymentCardDetail}
          bounces={false}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item, index) => item.id.toString()}
        />
        <CButton title={strings.selectPayment} onPress={onPressSelectPayment} />
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
    borderWidth: moderateScale(1),
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
    ...styles.g8,
    ...styles.flex,
  },
});
