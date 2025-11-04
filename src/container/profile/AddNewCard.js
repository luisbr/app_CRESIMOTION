import {StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

// custom import
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import {
  validateCardNumber,
  validateCvv,
  validName,
} from '../../utils/Validation';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import CInput from '../../components/common/CInput';
import {styles} from '../../theme';
import {getHeight, moderateScale} from '../../common/constants';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';

export default function AddNewCard({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [cardNumber, setCardNumber] = useState('');
  const [cardNumberError, setCardNumberError] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerNameError, setOwnerNameError] = useState('');
  const [cvv, setCvv] = useState('');
  const [cvvError, setCvvError] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const onChangeCardNumber = val => {
    const trimmedVal = val.trim();
    const {msg} = validateCardNumber(trimmedVal);
    setCardNumber(trimmedVal);
    setCardNumberError(msg);
  };

  const onChangeOwnerName = val => {
    const trimmedVal = val.trim();
    const {msg} = validName(trimmedVal);
    setOwnerName(trimmedVal);
    setOwnerNameError(msg);
  };

  const onChangeCvv = val => {
    const trimmedVal = val.trim();
    const {msg} = validateCvv(trimmedVal);
    setCvv(trimmedVal);
    setCvvError(msg);
  };
  const onPressCalender = () => setDatePickerVisible(true);
  const handleDateConfirm = date => {
    var expiryDate = date.toISOString().split('T')[0];
    const month = expiryDate.split('-')[1];
    const year = expiryDate.split('-')[0];
    setExpiryDate(month + '/' + year);
    setDatePickerVisible(false);
  };

  const hideDatePicker = () => setDatePickerVisible(false);

  const onPressAddNewCard = () => {
    navigation.goBack();
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.addNewCard} />
      <KeyBoardAvoidWrapper contentContainerStyle={localStyles.mainContainer}>
        <View>
          <CInput
            label={strings.cardNumber}
            placeHolder={strings.enterCardNumber}
            keyBoardType={'number-pad'}
            _value={cardNumber}
            _errorText={cardNumberError}
            autoCapitalize={'none'}
            maxLength={16}
            toGetTextFieldValue={onChangeCardNumber}
          />
          <CInput
            label={strings.cardHolderName}
            placeHolder={strings.enterHolderName}
            keyBoardType={'default'}
            _value={ownerName}
            _errorText={ownerNameError}
            autoCapitalize={'none'}
            maxLength={20}
            toGetTextFieldValue={onChangeOwnerName}
          />
          <View style={localStyles.dateAndCvvContainer}>
            <View style={styles.mv10}>
              <CText
                type={'M14'}
                color={colors.labelColor}
                style={localStyles.labelText}>
                {strings.expired}
              </CText>
              <TouchableOpacity
                onPress={onPressCalender}
                style={[
                  localStyles.expiredContainer,
                  {
                    backgroundColor: colors.inputBg,
                  },
                ]}>
                <CText
                  type={'M14'}
                  color={expiryDate ? colors.textColor : colors.labelColor}
                  style={styles.ml5}>
                  {expiryDate ? expiryDate : 'MM/YY'}
                </CText>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={datePickerVisible}
                mode="date"
                onConfirm={handleDateConfirm}
                onCancel={hideDatePicker}
                date={new Date()}
                minimumDate={new Date()}
              />
            </View>
            <CInput
              label={strings.cvvCode}
              placeHolder={strings.cvv}
              keyBoardType={'number-pad'}
              _value={cvv}
              _errorText={cvvError}
              autoCapitalize={'none'}
              maxLength={3}
              secureTextEntry={true}
              inputContainerStyle={localStyles.dateContainer}
              toGetTextFieldValue={onChangeCvv}
            />
          </View>
        </View>
        <CButton title={strings.addNewCard} onPress={onPressAddNewCard} />
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.p20,
    ...styles.flexGrow1,
    ...styles.justifyBetween,
  },
  dateAndCvvContainer: {
    ...styles.flexRow,
    ...styles.g10,
    ...styles.itemsCenter,
  },
  dateContainer: {
    width: moderateScale(155),
    ...styles.flex0,
  },
  labelText: {
    textAlign: 'left',
    opacity: 0.9,
    ...styles.ml5,
    ...styles.mb5,
  },
  expiredContainer: {
    width: moderateScale(155),
    height: getHeight(52),
    ...styles.ph10,
    borderRadius: moderateScale(24),
    ...styles.justifyCenter,
    ...styles.mt5,
  },
});
