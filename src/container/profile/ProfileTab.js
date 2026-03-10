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
import {getSession, getProfile} from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AUTH_ALIAS, AUTH_HASH, AUTH_ID, AUTH_NAME, AUTH_TOKEN, AUTH_UUID, ACCESS_TOKEN, DEVICE_UUID} from '../../common/constants';
import { clearSession } from '../../session/storage';

export default function ProfileTab({navigation}) {
  const color = useSelector(state => state.theme.theme);
  const [isEnabled, setIsEnabled] = useState(!!color.dark);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [alias, setAlias] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [language, setLanguage] = useState('');
  const [isMinor, setIsMinor] = useState(false);
  const [tutorName, setTutorName] = useState('');
  const [tutorLastName, setTutorLastName] = useState('');
  const [tutorDob, setTutorDob] = useState('');
  const [tutorPhone, setTutorPhone] = useState('');
  const [tutorEmail, setTutorEmail] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      const s = await getSession();
      setName(s?.nombre || '');
      setAlias(s?.alias || '');

      try {
        const resp = await getProfile();
        if (resp && resp.success && resp.perfil) {
          const { 
            nombre, 
            apellido, 
            alias, 
            fecha_nacimiento, 
            genero, 
            correo,
            telefono,
            idioma,
            menor_edad,
            tutor_nombre,
            tutor_apellido,
            tutor_fecha_nacimiento,
            tutor_telefono,
            tutor_correo
          } = resp.perfil;
          
          setName(`${nombre || ''} ${apellido || ''}`.trim());
          setFirstName(nombre || '');
          setLastName(apellido || '');
          setAlias(alias || '');
          const formatDob = (dateString) => {
            if (!dateString) return '';
            const parts = dateString.split('-');
            if (parts.length === 3) {
              return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return dateString;
          };

          setDob(formatDob(fecha_nacimiento));
          setGender(genero || '');
          setEmail(correo || '');
          setPhone(telefono || '');
          setLanguage(idioma || '');
          
          setIsMinor(parseInt(menor_edad || 0) === 1);
          setTutorName(tutor_nombre || '');
          setTutorLastName(tutor_apellido || '');
          setTutorDob(formatDob(tutor_fecha_nacimiento));
          setTutorPhone(tutor_telefono || '');
          setTutorEmail(tutor_correo || '');
        }
      } catch (err) {
        console.log('Failed to fetch profile', err);
      }
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
  const ProfileInfoCard = ({ title, iconName, data }) => {
    return (
      <View style={[
        localStyles.infoCard,
        {
          backgroundColor: color.dark ? color.indicatorColor : color.white,
          borderColor: color.dark ? color.dividerColor : color.grayScale2,
          borderWidth: color.dark ? 1 : 1,
          shadowColor: color.dark ? 'transparent' : color.shadowColor,
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: color.dark ? 0 : 0.1,
          shadowRadius: color.dark ? 0 : 8,
          elevation: color.dark ? 0 : 2,
        }
      ]}>
        {title && (
          <View style={[localStyles.infoCardHeader, { borderBottomColor: color.dark ? color.dividerColor : color.grayScale2 }]}>
            {iconName && <Feather name={iconName} size={moderateScale(18)} color={color.primary} />}
            <CText type={'B16'} style={{marginLeft: iconName ? moderateScale(8) : 0}}>{title}</CText>
          </View>
        )}
        <View style={localStyles.infoCardGrid}>
          {data.map((item, idx) => (
            <View key={`info-${idx}`} style={[localStyles.infoCardItem, item.isFullWidth && {width: '100%'}]}>
              <CText type={'M12'} color={color.labelColor}>{item.title}</CText>
              <CText type={'S14'} color={color.textColor} style={{marginTop: moderateScale(4)}}>{item.value}</CText>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const headerComponent = () => {
    return (
      <View>
        <View style={localStyles.profileContainer}>
          
          <View style={localStyles.textContainer}>
            <View>
              <CText type={'S18'}>{name || 'Usuario'}</CText>
              <CText type={'S14'} color={color.grayScale3}>
                {alias ? `@${alias}` : ''}
              </CText>
            </View>
            <TouchableOpacity
              
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
        <ProfileInfoCard 
          data={[
            {title: 'Nombre', value: firstName || '-'},
            {title: 'Apellido', value: lastName || '-'},
            {title: 'Alias', value: alias || '-'},
            {title: 'Fecha de nacimiento', value: dob || '-'},
            {title: 'Teléfono', value: phone || '-'},
            {title: 'Género', value: gender || '-'},
            {title: 'Idioma', value: language || '-'},
            {title: 'Correo', value: email || '-', isFullWidth: true},
          ]} 
        />
        
        {isMinor && (
          <ProfileInfoCard 
            title="Datos del Tutor"
            iconName="shield"
            data={[
              {title: 'Nombre', value: tutorName || '-'},
              {title: 'Apellido', value: tutorLastName || '-'},
              {title: 'Teléfono', value: tutorPhone || '-'},
              {title: 'Fecha de nacimiento', value: tutorDob || '-'},
              {title: 'Correo', value: tutorEmail || '-', isFullWidth: true},
            ]}
          />
        )}
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
  infoCard: {
    ...styles.mt20,
    ...styles.p15,
    borderRadius: moderateScale(16),
  },
  infoCardHeader: {
    ...styles.flexRow,
    alignItems: 'center',
    marginBottom: moderateScale(15),
    borderBottomWidth: moderateScale(1),
    paddingBottom: moderateScale(10),
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoCardGrid: {
    ...styles.flexRow,
    ...styles.wrap,
    justifyContent: 'space-between',
  },
  infoCardItem: {
    width: '48%',
    marginBottom: moderateScale(15),
  },
  profileDetailRoot: {
    ...styles.flexRow,
    ...styles.g20,
  },
  mainContainer: {
    ...styles.p20,
  },
});
