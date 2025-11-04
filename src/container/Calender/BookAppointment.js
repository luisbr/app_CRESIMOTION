import {
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useState} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom imports
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import {styles} from '../../theme';
import {getWidth, moderateScale} from '../../common/constants';
import CText from '../../components/common/CText';
import {CalendarIcon, GroupIcon} from '../../assets/svg';
import CDivider from '../../components/common/CDivider';
import CInput from '../../components/common/CInput';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import CButton from '../../components/common/CButton';
import {PaymentMethodData} from '../../api/constant';
import PasswordSuccessModel from '../../components/model/PasswordSuccessModel';
import {StackNav} from '../../navigation/NavigationKey';

export default function BookAppointment({route, navigation}) {
  const item = route.params.item;
  const colors = useSelector(state => state.theme.theme);
  const [promo, setPromo] = useState('');
  const [isSelect, setIsSelect] = useState(1);
  const [modelVisible, setModelVisible] = useState(false);

  const onPressPayNow = () => {
    setModelVisible(true);
  };

  const onChangePromo = text => {
    setPromo(text);
  };

  const onPressPayment = item => {
    setIsSelect(item.id);
  };

  const onPressContinue = () => {
    setModelVisible(false);
    navigation.navigate(StackNav.WaitingRoom, {item: item});
  };
  const DrProfile = () => {
    return (
      <View>
        <View style={localStyles.drProfileContainer}>
          <Image source={item.image} style={localStyles.drImage} />
          <View style={styles.g5}>
            <CText type={'B14'}>{item.drName}</CText>
            <CText type={'M12'} color={colors.grayScale1}>
              {item.specialist}
            </CText>
          </View>
        </View>
        <View style={localStyles.experienceContainer}>
          <View style={localStyles.innerContainer}>
            <View
              style={[
                localStyles.iconBg,
                {
                  backgroundColor: colors.dark
                    ? colors.indicatorColor
                    : colors.secondary,
                },
              ]}>
              <CalendarIcon
                height={moderateScale(15)}
                width={moderateScale(18)}
              />
            </View>
            <CText type={'M14'}>{'3 Years'}</CText>
          </View>
          <View style={localStyles.innerContainer}>
            <View
              style={[
                localStyles.iconBg,
                {
                  backgroundColor: colors.dark
                    ? colors.indicatorColor
                    : colors.secondary,
                },
              ]}>
              <GroupIcon />
            </View>
            <CText type={'M14'}>{'1,099 Patients'}</CText>
          </View>
        </View>
      </View>
    );
  };

  const CostComponent = ({title}) => {
    return (
      <View>
        <View style={localStyles.costText}>
          <CText type={'S12'} color={colors.labelColor}>
            {title}
          </CText>
          <CText type={'B16'}>{'IDR. 50.000'}</CText>
        </View>
        <CDivider style={styles.mv20} />
      </View>
    );
  };

  const rightIcon = () => {
    return (
      <CButton title={strings.apply} containerStyle={localStyles.applyBtn} />
    );
  };

  const renderPaymentMethod = ({item, index}) => {
    return (
      <TouchableOpacity
        style={[
          localStyles.methodContainer,
          {
            borderColor:
              isSelect === item.id
                ? colors.primary
                : colors.dark
                ? colors.dividerColor
                : colors.grayScale2,
          },
        ]}
        onPress={() => onPressPayment(item)}>
        {item.icon}
        <View style={localStyles.innerPaymentRoot}>
          <CText type={'S12'}>{item.cardNumber}</CText>
          <Ionicons
            name={
              isSelect === item.id
                ? 'radio-button-on-outline'
                : 'radio-button-off-outline'
            }
            color={
              isSelect === item.id
                ? colors.primary
                : colors.dark
                ? colors.dividerColor
                : colors.indicatorColor
            }
            size={moderateScale(24)}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <CSafeAreaView>
      <CHeader title={strings.appointment} />
      <KeyBoardAvoidWrapper contentContainerStyle={localStyles.mainContainer}>
        <DrProfile />
        <View
          style={[
            localStyles.constContainer,
            {
              borderColor: colors.dark
                ? colors.dividerColor
                : colors.grayScale2,
            },
          ]}>
          <CostComponent title={strings.totalCost} />
          <CostComponent title={strings.toPay} />
          <CText type={'B14'}>{strings.promoCode}</CText>
          <CInput
            placeHolder={strings.promoCode}
            keyBoardType={'default'}
            _value={promo}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangePromo}
            rightAccessory={rightIcon}
          />
        </View>
        <CText type={'B16'}>{strings.paymentMethod}</CText>
        <FlatList
          data={PaymentMethodData}
          renderItem={renderPaymentMethod}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            localStyles.methodRoot,
            {
              borderColor: colors.dark
                ? colors.dividerColor
                : colors.grayScale2,
            },
          ]}
        />
        <CButton title={strings.payNow} onPress={onPressPayNow} />
      </KeyBoardAvoidWrapper>
      <PasswordSuccessModel
        visible={modelVisible}
        desc={strings.paymentSuccessText}
        onPressContinue={onPressContinue}
      />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  drProfileContainer: {
    ...styles.flexRow,
    ...styles.g25,
    ...styles.itemsCenter,
  },
  drImage: {
    height: moderateScale(54),
    width: moderateScale(54),
    borderRadius: moderateScale(54),
  },
  mainContainer: {
    ...styles.p20,
  },
  experienceContainer: {
    ...styles.flexRow,
    ...styles.g15,
  },
  innerContainer: {
    ...styles.flexRow,
    ...styles.g5,
    ...styles.itemsCenter,
    left: moderateScale(75),
    ...styles.mv5,
  },
  iconBg: {
    height: moderateScale(24),
    width: moderateScale(24),
    borderRadius: moderateScale(12),
    ...styles.center,
  },
  constContainer: {
    borderRadius: moderateScale(24),
    borderWidth: moderateScale(1),
    ...styles.p20,
    ...styles.mv25,
  },
  costText: {
    ...styles.rowSpaceBetween,
  },
  applyBtn: {
    height: moderateScale(30),
    width: getWidth(97),
    ...styles.mt10,
  },
  methodContainer: {
    borderRadius: moderateScale(24),
    ...styles.p20,
    ...styles.flexRow,
    ...styles.g15,
    ...styles.itemsCenter,
    borderWidth: moderateScale(1),
  },
  innerPaymentRoot: {
    ...styles.rowSpaceBetween,
    ...styles.flex,
  },
  methodRoot: {
    borderRadius: moderateScale(24),
    borderWidth: moderateScale(1),
    ...styles.p20,
    ...styles.mv10,
    ...styles.g15,
  },
});
