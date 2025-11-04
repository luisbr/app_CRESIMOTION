import {
  FlatList,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Swipeable from "react-native-gesture-handler/Swipeable";

// custom imports
import CSafeAreaView from "../../components/common/CSafeAreaView";
import CHeader from "../../components/common/CHeader";
import { useSelector } from "react-redux";
import { styles } from "../../theme";
import { getWidth, moderateScale } from "../../common/constants";
import CText from "../../components/common/CText";
import { MessageData } from "../../api/constant";
import CDivider from "../../components/common/CDivider";
import strings from "../../i18n/strings";
import SearchComponent from "../../components/home/searchComponent";
import KeyBoardAvoidWrapper from "../../components/common/KeyBoardAvoidWrapper";
import { DeleteIcon, FilterDarkIcon, FilterLightIcon } from "../../assets/svg";
import CButton from "../../components/common/CButton";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StackNav } from "../../navigation/NavigationKey";

export default function ChatTab({ navigation }) {
  const colors = useSelector((state) => state.theme.theme);
  const [search, setSearch] = useState("");
  const [searchData, setSearchData] = useState(MessageData);

  useEffect(() => {
    filterData();
  }, [search]);

  const filterData = () => {
    if (!!search) {
      const filteredData = MessageData.filter((item) =>
        item.userName.toLowerCase().includes(search.toLowerCase())
      );
      setSearchData(filteredData);
    } else {
      setSearchData(MessageData);
    }
  };

  const onPressChat = (item) => {
    navigation.navigate(StackNav.Chat, { item: item });
  };

  const RightAccessory = () => {
    return (
      <TouchableOpacity style={localStyles.filterContainer}>
        <View
          style={[
            localStyles.lineView,
            {
              backgroundColor: colors.dark
                ? colors.dividerColor
                : colors.verticalLine,
            },
          ]}
        />
        {colors.dark ? <FilterDarkIcon /> : <FilterLightIcon />}
      </TouchableOpacity>
    );
  };

  const onPressDelete = (item) => {
    setSearchData((prevData) => prevData.filter((val) => val.id !== item.id));
  };

  const AddIcon = () => {
    return (
      <MaterialIcons
        name={"add"}
        color={colors.white}
        size={moderateScale(18)}
        style={styles.mr5}
      />
    );
  };
  const renderRightActions = (item) => {
    return (
      <View>
        <TouchableOpacity
          onPress={() => onPressDelete(item)}
          style={[
            localStyles.deleteBg,
            {
              backgroundColor: colors.dark
                ? colors.indicatorColor
                : colors.lightRedColor,
            },
          ]}
        >
          <DeleteIcon />
        </TouchableOpacity>
      </View>
    );
  };
  const renderMsgItem = ({ item, index }) => {
    return (
      <GestureHandlerRootView>
        <Swipeable renderRightActions={() => renderRightActions(item)}>
          <TouchableOpacity
            style={localStyles.messageContainer}
            onPress={() => onPressChat(item)}
          >
            <ImageBackground source={item.image} style={localStyles.imageStyle}>
              {item.isOnline === true && (
                <View
                  style={[
                    localStyles.dotView,
                    {
                      borderColor: colors.white,
                      backgroundColor: colors.greenDot,
                    },
                  ]}
                />
              )}
            </ImageBackground>
            <View style={styles.flex}>
              <View>
                <View style={localStyles.innerChatContainer}>
                  <CText type={"B18"}>{item.userName}</CText>
                  <CText type={"S12"}>{item.time}</CText>
                </View>
                <View style={localStyles.innerChatContainer}>
                  <CText
                    type={"M14"}
                    color={colors.labelColor}
                    style={styles.mv5}
                  >
                    {item.message}
                  </CText>
                  {item.pendingMsg && (
                    <View
                      style={[
                        localStyles.pendingMsgContainer,
                        {
                          backgroundColor: colors.primary,
                        },
                      ]}
                    >
                      <CText type={"S10"} color={colors.white}>
                        {item.pendingMsg}
                      </CText>
                    </View>
                  )}
                </View>
              </View>
              <CDivider style={styles.mv15} />
            </View>
          </TouchableOpacity>
        </Swipeable>
      </GestureHandlerRootView>
    );
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.message} />
      <KeyBoardAvoidWrapper contentContainerStyle={localStyles.mainRoot}>
        <SearchComponent
          containerStyle={localStyles.containerStyle}
          value={search}
          searchText={strings.searchMessage}
          setData={setSearch}
          rightAccessory={() => <RightAccessory />}
        />
        <FlatList
          data={searchData}
          renderItem={renderMsgItem}
          bounces={false}
          keyExtractor={(item, index) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={localStyles.mainContainer}
        />
        <CButton
          title={strings.newChat}
          containerStyle={localStyles.newChatBtn}
          frontIcon={<AddIcon />}
        />
      </KeyBoardAvoidWrapper>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  messageContainer: {
    ...styles.flexRow,
    ...styles.g12,
    ...styles.mt2,
  },
  mainRoot: {
    ...styles.flexGrow1,
    ...styles.ph20,
  },
  innerChatContainer: {
    ...styles.rowSpaceBetween,
  },
  imageStyle: {
    height: moderateScale(56),
    width: moderateScale(56),
  },
  mainContainer: {
    ...styles.g15,
  },
  pendingMsgContainer: {
    height: moderateScale(24),
    width: moderateScale(24),
    borderRadius: moderateScale(12),
    ...styles.center,
  },
  containerStyle: {
    ...styles.mb20,
  },
  filterContainer: {
    ...styles.flexRow,
    ...styles.center,
    ...styles.g10,
  },
  lineView: {
    height: moderateScale(18),
    width: moderateScale(1),
  },
  newChatBtn: {
    width: getWidth(137),
    ...styles.selfEnd,
    position: "absolute",
    bottom: moderateScale(10),
    right: moderateScale(10),
    ...styles.shadowStyle,
  },
  deleteBg: {
    height: moderateScale(67),
    width: moderateScale(64),
    ...styles.center,
  },
  dotView: {
    height: moderateScale(16),
    width: moderateScale(16),
    borderRadius: moderateScale(16),
    position: "absolute",
    right: moderateScale(0),
    borderWidth: moderateScale(2),
    bottom: moderateScale(0),
  },
});
