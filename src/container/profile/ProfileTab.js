import {
  Image,
  SectionList,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, {useEffect, useState} from 'react';
import Feather from 'react-native-vector-icons/Feather';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import {useDispatch, useSelector} from 'react-redux';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import {styles} from '../../theme';
import images from '../../assets/images';
import {getWidth, moderateScale, THEME} from '../../common/constants';
import CText from '../../components/common/CText';
import {ProfileData} from '../../api/constant';
import CDivider from '../../components/common/CDivider';
import {Switch} from 'react-native-gesture-handler';
import {setAsyncStorageData} from '../../utils/AsyncStorage';
import {changeThemeAction} from '../../redux/action/themeAction';
import {colors} from '../../theme/colors';
import {StackNav} from '../../navigation/NavigationKey';
import LogOutModel from '../../components/model/LogOutModel';
import {getSession} from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AUTH_ALIAS, AUTH_HASH, AUTH_ID, AUTH_NAME, AUTH_TOKEN, AUTH_UUID, ACCESS_TOKEN, DEVICE_UUID} from '../../common/constants';
import { clearSession } from '../../session/storage';

export default function ProfileTab({navigation}) {
  const color = useSelector(state => state.theme.theme);
  const [isEnabled, setIsEnabled] = useState(!!color.dark);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [userId, setUserId] = useState('');
  const [uuid, setUuid] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setName(s?.nombre || '');
      setAlias(s?.alias || '');
      setUserId(s?.id ? String(s.id) : '');
      setUuid(s?.uuid || '');
    })();
  }, []);

  const onPressLightTheme = () => {
    setAsyncStorageData(THEME, 'light');
    dispatch(changeThemeAction(colors.light));
  };

  const onPressDarkTheme = () => {
    setAsyncStorageData(THEME, 'dark');
    dispatch(changeThemeAction(colors.dark));
  };

  const toggleSwitch = val => {
    if (val) {
      onPressDarkTheme();
    } else {
      onPressLightTheme();
    }
    setIsEnabled(previousState => !previousState);
  };

  const onPressItem = item => {
    if (!!item.route) {
      navigation.navigate(item.route);
    }
  };

  const onPressLogOut = () => {
    setIsModalVisible(true);
  };

  const onPressCancel = () => {
    setIsModalVisible(false);
  };
  const onPressLOut = async () => {
    setIsModalVisible(false);
    try {
      await clearSession();
      // Si quieres borrar el DEVICE_UUID también, mantenemos esta línea:
      await AsyncStorage.removeItem(DEVICE_UUID);
    } catch (e) {}
    navigation.reset({
      index: 0,
      routes: [{name: StackNav.AuthNavigation}],
    });
  };

  const onPressEditIcon = () => {
    navigation.navigate(StackNav.Appointment, {title: strings.edit});
  };
  const PersonalDetails = ({item}) => {
    return (
      <View
        style={[
          localStyles.detailContainer,
          {
            backgroundColor: color.dark
              ? color.indicatorColor
              : color.secondary,
          },
        ]}>
        <CText type={'M12'} color={color.grayScale1}>
          {item.title}
        </CText>
        <CText type={'S14'}>{item.value}</CText>
      </View>
    );
  };

  const headerComponent = () => {
    return (
      <View>
        <View style={localStyles.profileContainer}>
          <Image
            source={images.UserImage2}
            style={[
              localStyles.profileImage,
              {
                borderColor: color.dark ? color.white : color.grayScale2,
              },
            ]}
          />
          <View style={localStyles.textContainer}>
            <View>
              <CText type={'S18'}>{name || 'Usuario'}</CText>
              <CText type={'S14'} color={color.grayScale3}>
                {alias ? `@${alias}` : ''}
              </CText>
            </View>
            <TouchableOpacity
              onPress={onPressEditIcon}
              style={[
                localStyles.editContainer,
                {
                  borderColor: color.dark
                    ? color.dividerColor
                    : color.grayScale2,
                },
              ]}>
              <Feather
                name={'edit'}
                color={color.textColor}
                size={moderateScale(24)}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={localStyles.personalContainer}>
          {[
            {title: 'ID de usuario', value: userId || '-'},
            {title: 'Alias', value: alias || '-'},
            {title: 'UUID', value: uuid || '-'},
          ].map((info, idx) => (
            <PersonalDetails key={`pd-${idx}`} item={info} />
          ))}
        </View>
      </View>
    );
  };

  const footerComponent = () => {
    return (
      <TouchableOpacity onPress={onPressLogOut}>
        <CText type={'M16'} color={color.redAlert} align={'center'}>
          {strings.logout}
        </CText>
      </TouchableOpacity>
    );
  };
  const RenderHeader = ({title}) => {
    return (
      <CText type="S14" style={styles.mv20} color={color.grayScale1}>
        {title}
      </CText>
    );
  };
  const ProfileDetails = ({item, index}) => {
    return (
      <TouchableOpacity
        style={localStyles.profileDetailRoot}
        onPress={() => onPressItem(item)}>
        {color.dark ? item.darkIcon : item.lightIcon}
        <View style={[styles.flex, styles.g5]}>
          <View style={styles.rowSpaceBetween}>
            <CText type={'S16'}>{item.title}</CText>
            {item.switch === true && (
              <Switch
                trackColor={{
                  true: color.primary,
                }}
                thumbColor={color.white}
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            )}
          </View>
          <CDivider style={styles.mv15} />
        </View>
      </TouchableOpacity>
    );
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.profile} />
      <SectionList
        sections={ProfileData}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => <ProfileDetails item={item} />}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({section: {header}}) => (
          <RenderHeader title={header} />
        )}
        contentContainerStyle={localStyles.mainContainer}
        scrollEnabled={true}
        bounces={false}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        showsVerticalScrollIndicator={false}
      />
      <LogOutModel
        visible={isModalVisible}
        onPressCancel={onPressCancel}
        onPressLOut={onPressLOut}
      />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  profileContainer: {
    ...styles.flexRow,
    ...styles.g12,
  },
  profileImage: {
    height: moderateScale(56),
    width: moderateScale(56),
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(28),
  },
  editContainer: {
    height: moderateScale(48),
    width: moderateScale(48),
    borderWidth: moderateScale(1),
    borderRadius: moderateScale(24),
    ...styles.center,
  },
  textContainer: {
    ...styles.rowSpaceBetween,
    ...styles.flex,
  },
  detailContainer: {
    height: moderateScale(62),
    width: getWidth(101),
    ...styles.center,
    ...styles.g5,
    borderRadius: moderateScale(12),
  },
  personalContainer: {
    ...styles.flexRow,
    ...styles.wrap,
    ...styles.g12,
    ...styles.selfCenter,
    ...styles.mt20,
    ...styles.mb10,
  },
  profileDetailRoot: {
    ...styles.flexRow,
    ...styles.g20,
  },
  mainContainer: {
    ...styles.p20,
  },
});
