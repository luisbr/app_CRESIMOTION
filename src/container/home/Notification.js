import {Image, SectionList, StyleSheet, View} from 'react-native';
import React from 'react';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import {NotificationData} from '../../api/constant';
import CText from '../../components/common/CText';
import {useSelector} from 'react-redux';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import CDivider from '../../components/common/CDivider';
import {CalendarIcon} from '../../assets/svg';

export default function Notification() {
  const colors = useSelector(state => state.theme.theme);
  const RenderHeader = ({title}) => {
    return (
      <CText type="B16" style={styles.mv20}>
        {title}
      </CText>
    );
  };
  const RenderNotification = ({item}) => {
    return (
      <View style={localStyles.notificationsContainer}>
        {item.image ? (
          <Image source={item.image} style={localStyles.imageStyle} />
        ) : (
          <View
            style={[
              localStyles.iconBgContainer,
              {
                backgroundColor: colors.dark
                  ? colors.inputBg
                  : colors.chatBgColor,
              },
            ]}>
            <CalendarIcon />
          </View>
        )}
        <View style={localStyles.textContainer}>
          <CText type={'R14'} numberOfLines={3}>
            {item.desc}
          </CText>
          <CText type={'R12'} color={colors.grayScale1}>
            {item.time}
          </CText>
          <CDivider />
        </View>
      </View>
    );
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.notification} />
      <SectionList
        sections={NotificationData}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => <RenderNotification item={item} />}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({section: {title}}) => (
          <RenderHeader title={title} />
        )}
        contentContainerStyle={localStyles.mainContainer}
        scrollEnabled={true}
        bounces={false}
        showsVerticalScrollIndicator={false}
      />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  notificationsContainer: {
    ...styles.pv10,
    ...styles.flexRow,
    ...styles.g15,
  },
  imageStyle: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(20),
  },
  textContainer: {
    ...styles.flex,
    ...styles.g8,
  },
  mainContainer: {
    ...styles.ph20,
    ...styles.flexGrow1,
  },
  iconBgContainer: {
    height: moderateScale(40),
    width: moderateScale(40),
    borderRadius: moderateScale(20),
    ...styles.center,
  },
});
