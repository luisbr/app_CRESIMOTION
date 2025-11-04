import {
  Image,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Octicons from "react-native-vector-icons/Octicons";

// custom import
import CSafeAreaView from "../../components/common/CSafeAreaView";
import CHeader from "../../components/common/CHeader";
import images from "../../assets/images";
import { styles } from "../../theme";
import { useSelector } from "react-redux";
import { getHeight, getWidth, moderateScale } from "../../common/constants";
import CText from "../../components/common/CText";

export default function VideoCall({ navigation }) {
  const colors = useSelector((state) => state.theme.theme);

  const onPressCutCall = () => {
    navigation.goBack();
  };
  return (
    <CSafeAreaView>
      <ImageBackground
        source={images.VideoCallBgImage}
        style={localStyles.bgImage}
      >
        <LinearGradient
          start={{ x: 1.7, y: 0.1 }}
          end={{ x: 1, y: 3.3 }}
          locations={[0.2, 0.3, 0.4]}
          colors={[colors.gradientColor2, colors.primary]}
          style={localStyles.bgImage}
        >
          <View style={localStyles.headerContainer}>
            <CHeader
              arrowColor={colors.dark ? colors.scheduleBg : colors.textColor}
              arrowBackground={colors.white}
              borderColor={colors.white}
            />
            <Image
              source={images.DrProfileImage2}
              style={[
                localStyles.imageStyle,
                {
                  borderColor: colors.white,
                },
              ]}
            />
          </View>
          <View style={styles.pb30}>
            <View
              style={[
                localStyles.recordingContainer,
                {
                  backgroundColor: colors.lightPrimary,
                },
              ]}
            >
              <View
                style={[
                  localStyles.dotStyle,
                  {
                    backgroundColor: colors.redColor,
                  },
                ]}
              />
              <CText type={"M14"} color={colors.white}>
                {"6.48"}
              </CText>
            </View>
            <TouchableOpacity
              onPress={onPressCutCall}
              style={[
                localStyles.callIconBg,

                {
                  backgroundColor: colors.backgroundColor,
                },
              ]}
            >
              <MaterialIcons
                name={"call-end"}
                size={moderateScale(32)}
                color={colors.redColor}
              />
            </TouchableOpacity>
            <View style={localStyles.videIconContainer}>
              <TouchableOpacity
                style={[
                  localStyles.videoIconBg,
                  {
                    backgroundColor: colors.backgroundColor,
                  },
                ]}
              >
                <Octicons
                  name={"device-camera-video"}
                  size={moderateScale(24)}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  localStyles.videoIconBg,
                  {
                    backgroundColor: colors.backgroundColor,
                  },
                ]}
              >
                <MaterialIcons
                  name={"mic-none"}
                  size={moderateScale(24)}
                  color={colors.primary}
                />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  bgImage: {
    ...styles.flex,
    ...styles.justifyBetween,
  },
  imageStyle: {
    height: getHeight(124),
    width: getWidth(83),
    backgroundColor: "red",
    ...styles.mr20,
    ...styles.mt25,
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(1),
  },
  headerContainer: {
    ...styles.flexRow,
    ...styles.justifyBetween,
  },
  recordingContainer: {
    ...styles.flexRow,
    ...styles.g5,
    borderRadius: moderateScale(10),
    ...styles.selfCenter,
    ...styles.center,
    ...styles.pv5,
    ...styles.ph10,
  },
  dotStyle: {
    height: moderateScale(9),
    width: moderateScale(9),
    borderRadius: moderateScale(9 / 2),
  },
  callIconBg: {
    height: moderateScale(71),
    width: moderateScale(71),
    borderRadius: moderateScale(35),
    ...styles.center,
    ...styles.selfCenter,
    ...styles.mt20,
  },
  videIconContainer: {
    ...styles.rowSpaceBetween,
    width: "70%",
    ...styles.selfCenter,
  },
  videoIconBg: {
    height: moderateScale(54),
    width: moderateScale(54),
    borderRadius: moderateScale(27),
    ...styles.center,
    ...styles.selfCenter,
  },
});
