import React, {useState, useCallback} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {styles} from '../../theme';
import {getHeight, getWidth, moderateScale} from '../../common/constants';
import {getSession} from '../../api/auth';
import {StackNav, TabNav} from '../../navigation/NavigationKey';
import {getStoredNotifications} from '../../utils/notificationStorage';

const EMOTIONS = [
  {id: 1, emoji: '😄', label: 'Muy feliz'},
  {id: 2, emoji: '🙂', label: 'Feliz'},
  {id: 3, emoji: '😐', label: 'Regular'},
  {id: 4, emoji: '🙁', label: 'Mal'},
  {id: 5, emoji: '😢', label: 'Muy triste'},
];

const PHRASES: Record<number, string> = {
  1: '¡Qué maravilloso! Sigue irradiando esa hermosa energía.',
  2: 'Hoy es un buen día para cuidar de ti.',
  3: 'Recuerda que incluso los días nublados ayudan a que crezcan flores.',
  4: 'Está bien no sentirse bien. Permítete sentir para luego soltar.',
  5: 'Te abrazo en tu tristeza. Cada pequeña acción cuenta, sé amable contigo hoy.',
};

export default function WelcomeEmotionScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [hasNewNotifs, setHasNewNotifs] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const checkSession = async () => {
        try {
          const session = await getSession();
          if (isActive) {
            if (session?.token) {
              setIsLoggedIn(true);
              setUserName(session.nombre || session.alias || 'Usuario');
              
              const notifs = await getStoredNotifications();
              const hasNew = notifs.some(n => n.isNew && !n.isDeleted && !n.isArchived);
              setHasNewNotifs(hasNew);
            } else {
              setIsLoggedIn(false);
              setUserName(null);
            }
          }
        } catch (e) {
          if (isActive) {
            setIsLoggedIn(false);
            setUserName(null);
          }
        }
      };
      checkSession();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLoginLogout = () => {
    if (isLoggedIn) {
      // Navigate to profile or something, or handle logout
      // For now, let's go to AuthNavigation (Login)
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.AuthNavigation}],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.AuthNavigation}],
      });
    }
  };

  const handleResponder = () => {
    if (isLoggedIn) {
      // Go to Diagnostico Home Screen
      navigation.reset({
        index: 0,
        routes: [
          {
            name: StackNav.TabNavigation,
            state: {
              routes: [
                {
                  name: TabNav.HomeTab,
                  state: {
                    routes: [{name: 'DiagnosticoHome'}],
                  },
                },
              ],
            },
          },
        ],
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.AuthNavigation}],
      });
    }
  };

  const renderHeader = () => (
    <View style={localStyles.headerContainer}>
      <TouchableOpacity
        style={localStyles.iconButton}
        onPress={() => isLoggedIn && handleResponder()} // Just an example if home pressed
      >
        <Ionicons name="home" size={24} color={colors.textColor} />
      </TouchableOpacity>

      <TouchableOpacity onPress={() => isLoggedIn && navigation.navigate(StackNav.Subscription)}>
        <Image
          source={require('../../../assets/logo.png')}
          style={localStyles.logo}
          resizeMode="contain"
        />
      </TouchableOpacity>

      <View style={localStyles.rightHeaderIcons}>
        <TouchableOpacity 
          style={localStyles.iconButton}
          onPress={() => isLoggedIn && navigation.navigate(StackNav.Configuration)}
        >
          <Ionicons name="settings-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={localStyles.iconButton}
          onPress={() => isLoggedIn && navigation.navigate(StackNav.Notification)}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          {hasNewNotifs && (
            <View style={{position: 'absolute', right: 4, top: 4, width: 10, height: 10, borderRadius: 5, backgroundColor: 'red'}} />
          )}
        </TouchableOpacity>
        <TouchableOpacity 
          style={localStyles.iconButton}
          onPress={() => isLoggedIn && navigation.navigate(StackNav.TabNavigation, { screen: TabNav.ProfileTab })}
        >
          <Ionicons name="person-circle-outline" size={28} color={colors.primary} />
        </TouchableOpacity>
        {!isLoggedIn && (
          <TouchableOpacity onPress={handleLoginLogout} style={localStyles.loginBtn}>
            <CText type="S12" color={colors.primary}>
              Iniciar{'\n'}sesión
            </CText>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderWelcomeSection = () => (
    <View style={localStyles.welcomeSection}>
      {isLoggedIn && userName && (
        <CText type="B24" color={colors.primary} align="center" style={styles.mb10}>
          ¡Hola, {userName}!
        </CText>
      )}
      <CText type="B20" color={colors.primary2} align="center" style={styles.mb20}>
        ¿Cómo te sientes hoy?
      </CText>

      <View style={localStyles.avatarContainer}>
        {/* Placeholder for the avatar/illustration */}
        <Image
          source={require('../../assets/images/home.png')} 
          style={localStyles.avatarImage}
          resizeMode="contain"
        />
      </View>
    </View>
  );

  const renderEmotionSelector = () => (
    <View style={localStyles.emotionSection}>
      <CText type="B18" color={colors.textColor} align="center" style={styles.mb15}>
        ¿Cómo te sientes hoy?
      </CText>
      <View style={localStyles.emojisRow}>
        {EMOTIONS.map((emo) => {
          const isSelected = selectedEmotion === emo.id;
          return (
            <TouchableOpacity
              key={emo.id}
              style={[
                localStyles.emojiItem,
                isSelected && {backgroundColor: colors.grayScale2, borderColor: colors.primary, borderWidth: 1},
              ]}
              onPress={() => setSelectedEmotion(emo.id)}
            >
              <CText style={{fontSize: moderateScale(32)}}>{emo.emoji}</CText>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedEmotion !== null && (
        <CButton
          title="Hacer test"
          disabled={selectedEmotion === null}
          onPress={handleResponder}
          containerStyle={[localStyles.responderBtn, {backgroundColor: '#7CD992', borderColor: '#7CD992'}]}
          textStyle={{color: colors.textColor}}
        />
      )}

      {selectedEmotion !== null && (
        <View style={[localStyles.phraseBox, {backgroundColor: '#F3D2ED'}]}>
          <CText type="M14" color={colors.textColor} style={localStyles.phraseText}>
            {PHRASES[selectedEmotion]}
          </CText>
        </View>
      )}
    </View>
  );

  const renderBottomLinks = () => {
    const handleBottomLink = (routeScreen: string) => {
      if (isLoggedIn) {
         navigation.reset({
          index: 0,
          routes: [
            {
              name: StackNav.TabNavigation,
              state: {
                routes: [
                  {
                    name: TabNav.HomeTab,
                    state: {
                      routes: [{name: routeScreen}],
                    },
                  },
                ],
              },
            },
          ],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: StackNav.AuthNavigation}],
        });
      }
    };

    return (
      <View style={localStyles.bottomLinksRow}>
        <TouchableOpacity style={localStyles.bottomIcon} onPress={() => handleBottomLink('TherapyPendingSessions')}>
          <Ionicons name="chatbubbles-outline" size={32} color={colors.textColor} />
          <CText type="S12" align="center" style={styles.mt5}>Sesiones</CText>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.bottomIcon} onPress={() => handleBottomLink('Tasks')}>
          <Ionicons name="calendar-outline" size={32} color={colors.textColor} />
          <CText type="S12" align="center" style={styles.mt5}>Tareas</CText>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.bottomIcon} onPress={() => handleBottomLink('DiagnosticoHome')}>
          <Ionicons name="document-text-outline" size={32} color={colors.textColor} />
          <CText type="S12" align="center" style={styles.mt5}>Test</CText>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.bottomIcon}>
          <Ionicons name="earth-outline" size={32} color={colors.textColor} />
          <CText type="S12" align="center" style={styles.mt5}>Comunidad</CText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <CSafeAreaView style={{backgroundColor: '#F3FAFA'}}>
      {renderHeader()}
      <ScrollView
        contentContainerStyle={[localStyles.scrollContent, {paddingBottom: insets.bottom + 20}]}
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeSection()}
        {renderEmotionSelector()}
        {renderBottomLinks()}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerContainer: {
    ...styles.flexRow,
    ...styles.justifyBetween,
    ...styles.alignCenter,
    ...styles.ph20,
    ...styles.pv10,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E7EB',
  },
  iconButton: {
    padding: moderateScale(5),
  },
  logo: {
    width: getWidth(100),
    height: getHeight(40),
  },
  rightHeaderIcons: {
    ...styles.flexRow,
    ...styles.alignCenter,
  },
  loginBtn: {
    marginLeft: moderateScale(10),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
  },
  welcomeSection: {
    alignItems: 'center',
  },
  avatarContainer: {
    width: getWidth(280),
    height: getHeight(200),
    backgroundColor: '#E8F5F2',
    borderRadius: moderateScale(20),
    ...styles.center,
    ...styles.mb20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  emotionSection: {
    backgroundColor: '#F0F5EE', // light greenish tint
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    ...styles.mb30,
    borderWidth: 1,
    borderColor: '#E2E7EB',
  },
  emojisRow: {
    ...styles.flexRow,
    ...styles.justifyEvenly,
    ...styles.mb20,
  },
  emojiItem: {
    padding: moderateScale(10),
    borderRadius: moderateScale(50),
  },
  responderBtn: {
    width: '60%',
    alignSelf: 'center',
    height: getHeight(40),
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(15),
    marginTop: 0, // overriding default margin
  },
  phraseBox: {
    ...styles.flexRow,
    ...styles.alignCenter,
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    marginTop: moderateScale(10),
  },
  phraseText: {
    flex: 1,
    textAlign: 'center',
  },
  bottomLinksRow: {
    ...styles.flexRow,
    ...styles.justifyEvenly,
    ...styles.mt20,
  },
  bottomIcon: {
    alignItems: 'center',
    width: getWidth(70),
  },
});
