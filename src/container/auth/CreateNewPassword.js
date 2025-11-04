import {StyleSheet, View} from 'react-native';
import React, {useState} from 'react';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import KeyBoardAvoidWrapper from '../../components/common/KeyBoardAvoidWrapper';
import {useSelector} from 'react-redux';
import {validateConfirmPassword, validPassword} from '../../utils/Validation';
import CInput from '../../components/common/CInput';
import strings from '../../i18n/strings';
import {styles} from '../../theme';
import CHeader from '../../components/common/CHeader';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import PasswordSuccessModel from '../../components/model/PasswordSuccessModel';
import {AuthNav} from '../../navigation/NavigationKey';

export default function CreateNewPassword({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  const onChangedPassword = val => {
    const {msg} = validPassword(val.trim());
    setPassword(val.trim());
    setPasswordError(msg);
  };

  const onChangedConfirmPassword = val => {
    const {msg} = validateConfirmPassword(val.trim(), password);
    setConfirmPassword(val.trim());
    setConfirmPasswordError(msg);
  };

  const onPressNext = () => {
    setModalVisible(true);
  };

  const onPressContinue = () => {
    setModalVisible(false);
    navigation.navigate(AuthNav.Login);
  };

  return (
    <CSafeAreaView>
      <KeyBoardAvoidWrapper>
        <CHeader />
        <CText type={'S28'} align={'center'} style={styles.mv5}>
          {strings.createNewPassword}
        </CText>
        <CText
          type={'S14'}
          align={'center'}
          color={colors.labelColor}
          style={styles.mb10}>
          {strings.enterYourNewPassword}
        </CText>
        <View style={localStyles.mainContainer}>
          <CInput
            label={strings.newPassword}
            placeHolder={strings.enterNewPassword}
            keyBoardType={'default'}
            _value={password}
            _errorText={passwordError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangedPassword}
            isSecure
          />
          <CInput
            label={strings.confirmPassword}
            placeHolder={strings.confirmYourPassword}
            keyBoardType={'default'}
            _value={confirmPassword}
            _errorText={confirmPasswordError}
            autoCapitalize={'none'}
            toGetTextFieldValue={onChangedConfirmPassword}
            isSecure
          />
          <CButton
            title={strings.next}
            containerStyle={styles.mv20}
            onPress={onPressNext}
          />
        </View>
      </KeyBoardAvoidWrapper>
      <PasswordSuccessModel
        visible={modalVisible}
        onPressContinue={onPressContinue}
        desc={strings.successDesc}
      />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.p20,
  },
});
