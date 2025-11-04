import { Image, StyleSheet, View } from "react-native";
import React, { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";

// custom import
import CSafeAreaView from "../components/common/CSafeAreaView";
import { styles } from "../theme";
import { useDispatch, useSelector } from "react-redux";
import images from "../assets/images";
import { getHeight, getWidth } from "../common/constants";
import CText from "../components/common/CText";
import strings from "../i18n/strings";
import { initialStorageValueGet } from "../utils/AsyncStorage";
import { colors } from "../theme/colors";
import { changeThemeAction } from "../redux/action/themeAction";
import { StackNav } from "../navigation/NavigationKey";

export default function Splash({ navigation }) {
  const color = useSelector((state) => state.theme.theme);
  const dispatch = useDispatch();

  const asyncProcess = async () => {
    try {
      let asyncData = await initialStorageValueGet();
      let { themeColor, onBoardingValue, accessTokenValue } = asyncData;
      console.log("accessTokenValue===>",accessTokenValue)
      if (!!asyncData) {
        if (!!themeColor) {
          if (themeColor === "light") {
            dispatch(changeThemeAction(colors.light));
          } else {
            dispatch(changeThemeAction(colors.dark));
          }
        }
        // Small delay to keep the logo visible a moment
        const navigateNext = () => {
          try {
            if (!!accessTokenValue) {
              console.log('Splash navigating to TabNavigation');
              navigation.reset({ index: 0, routes: [{ name: StackNav.TabNavigation }] });
            } else if (!!onBoardingValue) {
              console.log('Splash navigating to AuthNavigation');
              navigation.reset({ index: 0, routes: [{ name: StackNav.AuthNavigation }] });
            } else {
              console.log('Splash navigating to OnBoarding');
              navigation.reset({ index: 0, routes: [{ name: StackNav.OnBoarding }] });
            }
          } catch (e) {
            console.log('Splash navigation error', e);
          }
        };
        setTimeout(navigateNext, 1500);
      }
    } catch (e) {
      console.log("error ", e);
    }
  };

  useEffect(() => {
    SplashScreen?.hideAsync();
    asyncProcess();
  }, []);

  return (
    <CSafeAreaView>
      <View
        style={[
          localStyles.mainContainer,
          {
            backgroundColor: color.white,
          },
        ]}
      >
        <Image
          // Use custom logo placed at project root assets folder
          source={require("../../assets/logo.png")}
          style={localStyles.imageLogoStyle}
        />
      </View>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.flex,
    ...styles.justifyCenter,
  },
  imageLogoStyle: {
    height: getHeight(140),
    width: getWidth(140),
    ...styles.selfCenter,
    resizeMode: "contain",
    ...styles.mv10,
  },
});
