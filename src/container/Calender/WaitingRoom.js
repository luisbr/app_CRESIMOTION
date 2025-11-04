import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import React from "react";
import Ionicons from "react-native-vector-icons/Ionicons";

// custom imports
import { useSelector } from "react-redux";
import CSafeAreaView from "../../components/common/CSafeAreaView";
import CHeader from "../../components/common/CHeader";
import DrProfileComponent from "../../components/home/DrProfileComponent";
import { styles } from "../../theme";
import { moderateScale } from "../../common/constants";
import strings from "../../i18n/strings";
import CText from "../../components/common/CText";
import { WaitingRoomData } from "../../api/constant";
import CButton from "../../components/common/CButton";
import { StackNav } from "../../navigation/NavigationKey";

export default function WaitingRoom({ route, navigation }) {
  const item = route?.params?.item;
  const colors = useSelector((state) => state.theme.theme);

  const onPressCancel = () => {
    navigation.navigate(StackNav.TabNavigation);
  };

  const headerComponent = () => {
    return (
      <View>
        <View
          style={[
            localStyles.headerRoot,
            {
              backgroundColor: colors.primary,
            },
          ]}
        >
          <DrProfileComponent
            drProfileImage={item.image}
            drName={item.drName}
            specialist={item.specialist}
            color={colors.white}
          />
        </View>
        <CText type={"B16"} style={styles.mt30}>
          {strings.preparationBeforeTheAppointment}
        </CText>
      </View>
    );
  };
  const renderPreparation = ({ item, index }) => {
    return (
      <TouchableOpacity
        style={[
          localStyles.preparationContainer,
          {
            borderColor: colors.dark ? colors.dividerColor : colors.grayScale2,
          },
        ]}
      >
        <View
          style={[
            localStyles.iconBg,
            {
              backgroundColor: colors.dark
                ? colors.indicatorColor
                : colors.secondary,
            },
          ]}
        >
          {item.icon}
        </View>
        <View style={localStyles.textContainer}>
          <View style={styles.g5}>
            <CText type={"B16"}>{item.title}</CText>
            <CText type={"S12"} color={colors.labelColor}>
              {"Lorem ipsum dolor sit amet"}
            </CText>
          </View>
          <Ionicons
            name={"chevron-forward-outline"}
            color={colors.dark ? colors.dividerColor : colors.dividerColor}
            size={moderateScale(24)}
          />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.waitingRoom} />
      <View style={localStyles.mainRoot}>
        <FlatList
          data={WaitingRoomData}
          renderItem={renderPreparation}
          bounces={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={localStyles.mainContainer}
          keyExtractor={(item, index) => item.id.toString()}
          ListHeaderComponent={headerComponent}
        />
        <View>
          <CButton title={strings.joinTheMeetingRoom} />
          <TouchableOpacity style={styles.mv15} onPress={onPressCancel}>
            <CText align={"center"} color={colors.redAlert} type={"M16"}>
              {strings.cancel}
            </CText>
          </TouchableOpacity>
        </View>
      </View>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerRoot: {
    borderRadius: moderateScale(16),
    ...styles.p25,
    ...styles.mt25,
    ...styles.shadowStyle,
  },
  preparationContainer: {
    borderRadius: moderateScale(16),
    borderWidth: moderateScale(1),
    ...styles.pv10,
    ...styles.ph15,
    ...styles.flexRow,
    ...styles.g15,
  },
  iconBg: {
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(12),
    ...styles.center,
  },
  textContainer: {
    ...styles.rowSpaceBetween,
    ...styles.flex,
  },
  mainContainer: {
    ...styles.g20,
  },
  mainRoot: {
    ...styles.justifyBetween,
    ...styles.flex,
    ...styles.ph20,
  },
});
