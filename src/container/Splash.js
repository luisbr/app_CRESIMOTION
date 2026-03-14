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
import { changeThemeAction, changeFontScaleAction } from "../redux/action/themeAction";
import { StackNav } from "../navigation/NavigationKey";
import { getProfile } from "../api/auth";

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
        const navigateNext = async () => {
          try {
            if (!!accessTokenValue) {
              // Fetch user profile settings silently to set global scaling before reaching home
              try {
                const p = await getProfile();
                if (p && p.success && p.perfil && p.perfil.accesibilidad_fuente) {
                  let startScale = 1.0;
                  if (p.perfil.accesibilidad_fuente === 'pequeno') startScale = 0.85;
                  if (p.perfil.accesibilidad_fuente === 'grande') startScale = 1.15;
                  dispatch(changeFontScaleAction(startScale));
                }
              } catch (e) {
                console.log("Error loading initial font scaling", e);
              }

              console.log('Splash navigating to WelcomeEmotion');
              navigation.reset({ index: 0, routes: [{ name: StackNav.WelcomeEmotion }] });
            } else if (!!onBoardingValue) {
              console.log('Splash navigating to WelcomeEmotion');
              navigation.reset({ index: 0, routes: [{ name: StackNav.WelcomeEmotion }] });
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
