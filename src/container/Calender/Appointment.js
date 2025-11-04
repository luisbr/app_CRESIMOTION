import { StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useState } from "react";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import Ionicons from "react-native-vector-icons/Ionicons";

// custom imports
import CSafeAreaView from "../../components/common/CSafeAreaView";
import CHeader from "../../components/common/CHeader";
import { useSelector } from "react-redux";
import strings from "../../i18n/strings";
import {
  validateEmail,
  validateMobileNumber,
  validName,
} from "../../utils/Validation";
import CInput from "../../components/common/CInput";
import KeyBoardAvoidWrapper from "../../components/common/KeyBoardAvoidWrapper";
import CText from "../../components/common/CText";
import { styles } from "../../theme";
import { getHeight, moderateScale } from "../../common/constants";
import CButton from "../../components/common/CButton";
import { StackNav } from "../../navigation/NavigationKey";
import { CalendarIcon } from "../../assets/svg";

export default function Appointment({ route, navigation }) {
  const item = route?.params?.item;
  const title = route?.params?.title;
  const colors = useSelector((state) => state.theme.theme);
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [birthDate, setBirthDate] = useState("");
  const [selectGender, setSelectGender] = useState(strings.male);
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneNo, setPhoneNo] = useState("");
  const [phoneNoError, setPhoneNoError] = useState("");
  const [buttonTitle, setButtonTitle] = useState(
    title ? strings.edit : strings.continue
  );

  const onChangeFullName = (val) => {
    const { msg } = validName(val.trim());
    setFullName(val.trim());
    setFullNameError(msg);
  };

  const onPressCalender = () => setDatePickerVisible(true);

  const handleDateConfirm = (date) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("en-US", options).format(
      date
    );
    setBirthDate(formattedDate);
    setDatePickerVisible(false);
  };

  const hideDatePicker = () => setDatePickerVisible(false);
  const onChangeEmail = (val) => {
    const { msg } = validateEmail(val.trim());
    setEmail(val.trim());
    setEmailError(msg);
  };
  const onChangeDesc = (val) => {
    setDescription(val);
  };

  const onPressSelectGender = (title) => {
    setSelectGender(title);
  };

  const onChangedPhoneNo = (val) => {
    const { msg } = validateMobileNumber(val.trim());
    setPhoneNo(val.trim());
    setPhoneNoError(msg);
  };

  const onPressContinue = () => {
    if (buttonTitle === strings.continue) {
      navigation.navigate(StackNav.BookAppointment, { item: item });
    } else if (buttonTitle === strings.edit) {
      setButtonTitle(strings.saveChanges);
    } else {
      navigation.goBack();
    }
  };

  const SelectGender = ({ title }) => {
    return (
      <TouchableOpacity
        style={localStyles.genderContainer}
        onPress={() => onPressSelectGender(title)}
      >
        <Ionicons
          name={
            selectGender === title ? "checkmark-circle" : "radio-button-off"
          }
          color={
            selectGender === title
              ? colors.checkMark
              : colors.dark
              ? colors.dividerColor
              : colors.indicatorColor
          }
          size={moderateScale(24)}
        />
        <CText type={"M16"}>{title}</CText>
      </TouchableOpacity>
    );
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.appointment} />
      <KeyBoardAvoidWrapper contentContainerStyle={localStyles.mainContainer}>
        <View>
          <CInput
            label={strings.fullName}
            placeHolder={strings.enterYourName}
            keyBoardType={"default"}
            _value={fullName}
            _errorText={fullNameError}
            autoCapitalize={"none"}
            toGetTextFieldValue={onChangeFullName}
          />
          <CText type={"M14"} color={colors.labelColor} style={styles.mt20}>
            {strings.dateOfBirth}
          </CText>
          <TouchableOpacity
            onPress={onPressCalender}
            style={[
              localStyles.birthDateContainer,
              {
                backgroundColor: colors.inputBg,
              },
            ]}
          >
            <CText
              type={"M16"}
              color={birthDate ? colors.textColor : colors.grayScale1}
              style={styles.ml10}
            >
              {birthDate ? birthDate : "June 14, 1996"}
            </CText>
            <CalendarIcon />
          </TouchableOpacity>

          <DateTimePickerModal
            isVisible={datePickerVisible}
            mode="date"
            onConfirm={handleDateConfirm}
            onCancel={hideDatePicker}
            date={new Date()}
            maximumDate={new Date()}
          />
          <CText type={"M14"} color={colors.labelColor} style={styles.mt20}>
            {strings.gender}
          </CText>
          <View style={localStyles.genderRoot}>
            <SelectGender title={strings.male} />
            <SelectGender title={strings.female} />
          </View>
          {!title && (
            <CInput
              label={strings.problemDescription}
              placeHolder={strings.problemDesc}
              keyBoardType={"default"}
              _value={description}
              autoCapitalize={"none"}
              toGetTextFieldValue={onChangeDesc}
              multiline={true}
            />
          )}
          {title && (
            <CInput
              label={strings.phoneNumber}
              placeHolder={"+1 3712 3789"}
              keyBoardType={"number-pad"}
              _value={phoneNo}
              _errorText={phoneNoError}
              autoCapitalize={"none"}
              toGetTextFieldValue={onChangedPhoneNo}
              maxLength={10}
            />
          )}
          {title && (
            <CInput
              label={strings.email}
              placeHolder={"Brooklynsimmons@gmail.com"}
              keyBoardType={"default"}
              _value={email}
              _errorText={emailError}
              autoCapitalize={"none"}
              toGetTextFieldValue={onChangeEmail}
            />
          )}
        </View>
        <CButton title={buttonTitle} onPress={onPressContinue} />
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  birthDateContainer: {
    width: "100%",
    height: getHeight(52),
    ...styles.ph20,
    borderRadius: moderateScale(24),
    ...styles.justifyCenter,
    ...styles.mv10,
    ...styles.rowSpaceBetween,
  },
  mainContainer: {
    ...styles.p20,
    ...styles.justifyBetween,
    ...styles.flexGrow1,
  },
  genderContainer: {
    ...styles.flexRow,
    ...styles.itemsCenter,
    ...styles.g5,
    ...styles.mr50,
  },
  genderRoot: {
    ...styles.rowSpaceBetween,
    ...styles.mv15,
  },
});
