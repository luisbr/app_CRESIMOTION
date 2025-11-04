import { StyleSheet } from "react-native";
import React, { useState } from "react";

// custom import
import CSafeAreaView from "../../components/common/CSafeAreaView";
import CHeader from "../../components/common/CHeader";
import { validName } from "../../utils/Validation";
import KeyBoardAvoidWrapper from "../../components/common/KeyBoardAvoidWrapper";
import { styles } from "../../theme";
import strings from "../../i18n/strings";
import CInput from "../../components/common/CInput";
import CDropdown from "../../components/common/CDropdown";
import { CityData, CountryData, StateData } from "../../api/constant";
import CButton from "../../components/common/CButton";

export default function AddNewAddress({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [fullNameError, setFullNameError] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [address, setAddress] = useState("");

  const onChangedName = (val) => {
    const { msg } = validName(val.trim());
    setFullName(val.trim());
    setFullNameError(msg);
  };

  const onChangeCountry = (value) => {
    setCountry(value);
  };

  const onChangeCity = (value) => {
    setCity(value);
  };
  const onChangeState = (value) => {
    setState(value);
  };

  const onChangeZip = (value) => {
    setZip(value);
  };
  const onChangeAddress = (value) => {
    setAddress(value);
  };

  const onPressSaveAddress = () => {
    navigation.goBack();
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.addNewAddress} />
      <KeyBoardAvoidWrapper contentContainerStyle={localStyles.mainContainer}>
        <CInput
          label={strings.fullName}
          placeHolder={strings.enterYourName}
          keyBoardType={"default"}
          _value={fullName}
          _errorText={fullNameError}
          autoCapitalize={"none"}
          toGetTextFieldValue={onChangedName}
        />
        <CDropdown
          data={CountryData}
          placeholder={strings.selectCountry}
          label={strings.country}
          onChange={onChangeCountry}
          value={country}
        />
        <CDropdown
          data={CityData}
          placeholder={strings.selectCity}
          label={strings.city}
          onChange={onChangeCity}
          value={city}
        />
        <CDropdown
          data={StateData}
          placeholder={strings.selectState}
          label={strings.state}
          onChange={onChangeState}
          value={state}
        />
        <CInput
          label={strings.zipCode}
          placeHolder={strings.enterZipCode}
          keyBoardType={"number-pad"}
          _value={zip}
          autoCapitalize={"none"}
          toGetTextFieldValue={onChangeZip}
        />
        <CInput
          label={strings.detailAddress}
          placeHolder={strings.enterYourAddress}
          keyBoardType={"default"}
          _value={address}
          autoCapitalize={"none"}
          toGetTextFieldValue={onChangeAddress}
          multiline={true}
        />
        <CButton title={strings.saveAddress} onPress={onPressSaveAddress} />
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.p20,
  },
});
