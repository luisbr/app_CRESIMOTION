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
import {useDrawer} from '../../navigation/DrawerContext';
import CMainAppBar from '../../components/common/CMainAppBar';

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
  const drawer = useDrawer();
  
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
      navigation.navigate('DiagnosticoHome');
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.AuthNavigation}],
      });
    }
  };


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
              <CText type="M14" color={colors.textColor} align="center" style={{fontSize: moderateScale(32)}}>{emo.emoji}</CText>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedEmotion !== null && (
        <CButton
          title="Hacer test"
          type="S16"
          color={colors.white}
          bgColor={null}
          borderColor={null}
          style={null}
          disabled={selectedEmotion === null}
          onPress={handleResponder}
          containerStyle={[localStyles.responderBtn, {backgroundColor: '#7CD992', borderColor: '#7CD992'}]}
          textStyle={{color: colors.textColor}}
        />
      )}

      {selectedEmotion !== null && (
        <View style={[localStyles.phraseBox, {backgroundColor: '#F3D2ED'}]}>
          <CText type="M14" color={colors.textColor} align="center" style={localStyles.phraseText}>
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
        <TouchableOpacity style={localStyles.bottomIcon} onPress={() => isLoggedIn && handleResponder()}>
          <Ionicons name="home-outline" size={32} color={colors.textColor} />
          <CText type="S12" align="center" color={colors.textColor} style={styles.mt5}>Home</CText>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.bottomIcon} onPress={() => handleBottomLink('Tasks')}>
          <Ionicons name="calendar-outline" size={32} color={colors.textColor} />
          <CText type="S12" align="center" color={colors.textColor} style={styles.mt5}>Tareas</CText>
        </TouchableOpacity>
        <TouchableOpacity style={localStyles.bottomIcon} onPress={() => handleBottomLink('DiagnosticoHistory')}>
          <Ionicons name="document-text-outline" size={32} color={colors.textColor} />
          <CText type="S12" align="center" color={colors.textColor} style={styles.mt5}>Mis evaluaciones</CText>
        </TouchableOpacity>
        <TouchableOpacity
          style={localStyles.bottomIcon}
          onPress={() => isLoggedIn && navigation.navigate(StackNav.TestsGabo)}
        >
          <Ionicons name="clipboard-outline" size={32} color={colors.textColor} />
          <CText type="S12" align="center" color={colors.textColor} style={[styles.mt5, null]}>Test</CText>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <CSafeAreaView style={{backgroundColor: '#F3FAFA'}} color={null}>
      <CMainAppBar mode="main" />
      <ScrollView
        contentContainerStyle={[localStyles.scrollContent, {paddingBottom: insets.bottom + 20}]}
        showsVerticalScrollIndicator={false}
      >
        {renderWelcomeSection()}
        {renderEmotionSelector()}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(10),
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E7EB',
    justifyContent: 'space-between',
  },
  leftHeader: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerHeader: {
    // Allows logo to size naturally without shrinking too much
    alignItems: 'center',
    justifyContent: 'center',
  },
  rightHeaderIcons: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: moderateScale(5), // Keep icons naturally separated
  },
  iconButton: {
    padding: moderateScale(5),
    marginLeft: moderateScale(-5),
  },
  iconButtonRight: {
    padding: moderateScale(5),
  },
  notifBadge: {
    position: 'absolute',
    right: 2,
    top: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FF3B30',
  },
  logo: {
    width: getWidth(100),
    height: getHeight(40),
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
    alignItems: 'center',
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
// https://com.luis.buendiagmail.com.crestimotion//stripe/success?membresia_id=2&session_id=cs_test_a1iwmZBBqtVLR3ZwgOfvFBNOJ5bLRWsGVAZPbAXmG7leBsll7VGMHvzmpJ
