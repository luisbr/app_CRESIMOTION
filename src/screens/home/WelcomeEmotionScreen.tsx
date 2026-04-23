import React, {useState, useCallback, useEffect} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector, useDispatch} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {styles} from '../../theme';
import {getHeight, getWidth, moderateScale} from '../../common/constants';
import {getSession} from '../../api/auth';
import {StackNav, TabNav} from '../../navigation/NavigationKey';
import {useDrawer} from '../../navigation/DrawerContext';
import {getStoredNotifications} from '../../utils/notificationStorage';
import CMainAppBar from '../../components/common/CMainAppBar';
import {checkFirstDiagnosticComplete} from '../../modules/diagnostico/api/sessionsApi';
import {
  MOTIVATIONAL_PHRASES,
  PAINFUL_PHRASES,
} from '../../constants/emotionPhrases';

const EMOTIONS = [
  {
    id: 1,
    label: 'Muy bien',
    icon: require('../../assets/iconos_emociones/excelente.png'),
  },
  {
    id: 2,
    label: 'Bien',
    icon: require('../../assets/iconos_emociones/bien.png'),
  },
  {
    id: 3,
    label: 'Regular',
    icon: require('../../assets/iconos_emociones/regular.png'),
  },
  {
    id: 4,
    label: 'Mal',
    icon: require('../../assets/iconos_emociones/mal.png'),
  },
  {
    id: 5,
    label: 'Muy mal',
    icon: require('../../assets/iconos_emociones/muy_mal.png'),
  },
];

const POSITIVE_EMOTIONS = new Set([1, 2]);

const getRandomPhrase = (emotionId: number) => {
  const pool = POSITIVE_EMOTIONS.has(emotionId)
    ? MOTIVATIONAL_PHRASES
    : PAINFUL_PHRASES;

  return pool[Math.floor(Math.random() * pool.length)];
};

export default function WelcomeEmotionScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const pendingNavigation = useSelector((state: any) => state.ui.pendingNavigation);
  const navigation = useNavigation<any>();
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const drawer = useDrawer();
  
  const [userName, setUserName] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedEmotion, setSelectedEmotion] = useState<number | null>(null);
  const [selectedPhrase, setSelectedPhrase] = useState<string | null>(null);
  const [hasNewNotifs, setHasNewNotifs] = useState(false);
  const [checkingDiagnostic, setCheckingDiagnostic] = useState(true);

  useEffect(() => {
    if (pendingNavigation) {
      navigation.navigate(pendingNavigation.screen, pendingNavigation.params);
      dispatch({type: 'CLEAR_PENDING_NAVIGATION'});
    }
  }, [pendingNavigation, navigation, dispatch]);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const checkSession = async () => {
        try {
          const session = await getSession();
          
          if (isActive) {
            if (!session?.token) {
              setIsLoggedIn(false);
              setCheckingDiagnostic(false);
              // Send directly to login/register if no session
              navigation.reset({
                index: 0,
                routes: [{name: StackNav.AuthNavigation}],
              });
              return;
            }

            setIsLoggedIn(true);
            setUserName(session.nombre || session.alias || 'Usuario');

            const firstDiagnosticComplete = await checkFirstDiagnosticComplete();
            if (!firstDiagnosticComplete) {
              navigation.navigate(StackNav.TabNavigation, {
                screen: TabNav.HomeTab,
                params: {
                  screen: 'DiagnosticoHome',
                },
              });
              return;
            }
            setCheckingDiagnostic(false);
            
            const notifs = await getStoredNotifications();
            const hasNew = notifs.some(n => n.isNew && !n.isDeleted && !n.isArchived);
            setHasNewNotifs(hasNew);
          }
        } catch (e) {
          if (isActive) {
            setIsLoggedIn(false);
            setUserName(null);
            setCheckingDiagnostic(false);
            navigation.reset({
              index: 0,
              routes: [{name: StackNav.AuthNavigation}],
            });
          }
        }
      };
      checkSession();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleSelectEmotion = (emotionId: number) => {
    setSelectedEmotion(emotionId);
    setSelectedPhrase(getRandomPhrase(emotionId));
  };

  const handleResponder = () => {
    if (isLoggedIn) {
      navigation.navigate(StackNav.TestsGabo);
    } else {
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.AuthNavigation}],
      });
    }
  };


  const renderWelcomeSection = () => (
    <View style={localStyles.welcomeCard}>
      {isLoggedIn && userName && (
        <CText type="B24" color={colors.primary} align="center" style={localStyles.welcomeTitle}>
          ¡Hola {userName}!
        </CText>
      )}
      <CText type="B18" color={colors.primary2} align="center" style={localStyles.welcomeSubtitle}>
        ¿Cómo te sientes hoy?
      </CText>
    </View>
  );

  if (checkingDiagnostic) {
    return (
      <CSafeAreaView style={[localStyles.container, {justifyContent: 'center', alignItems: 'center'}]} color={null}>
        <CText type="B18" color={colors.primary} align="center" style={null}>
          Cargando...
        </CText>
      </CSafeAreaView>
    );
  }

  const renderEmotionSelector = () => (
    <View style={localStyles.emotionSection}>
      <CText type="B18" color={colors.textColor} align="center" style={localStyles.emotionTitle}>
        ¿Te gustaría contarnos algunos motivos que podrían estar influyendo en cómo te sientes hoy?
      </CText>
      <CText type="R14" color={colors.textColor} align="center" style={localStyles.supportingCopy}>
        Con esta información podremos ofrecerte un enfoque positivo y una sesión de sanación emocional para ayudarte a sentirte mejor.
      </CText>
      <View style={localStyles.emojisContainer}>
        {/* First row - 3 emotions */}
        <View style={localStyles.emojisRow}>
          {EMOTIONS.slice(0, 3).map((emo) => {
            const isSelected = selectedEmotion === emo.id;
            return (
              <TouchableOpacity
                key={emo.id}
                style={[
                  localStyles.emojiItem,
                  isSelected && localStyles.emojiItemSelected,
                ]}
                onPress={() => handleSelectEmotion(emo.id)}
              >
                <Image
                  source={emo.icon}
                  style={localStyles.emotionIcon}
                  resizeMode="contain"
                />
                <CText type="M12" color={colors.textColor} align="center" style={localStyles.emotionLabel}>
                  {emo.label}
                </CText>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Second row - 2 emotions */}
        <View style={localStyles.emojisRowSecond}>
          {EMOTIONS.slice(3, 5).map((emo) => {
            const isSelected = selectedEmotion === emo.id;
            return (
              <TouchableOpacity
                key={emo.id}
                style={[
                  localStyles.emojiItem,
                  isSelected && localStyles.emojiItemSelected,
                ]}
                onPress={() => handleSelectEmotion(emo.id)}
              >
                <Image
                  source={emo.icon}
                  style={localStyles.emotionIcon}
                  resizeMode="contain"
                />
                <CText type="M12" color={colors.textColor} align="center" style={localStyles.emotionLabel}>
                  {emo.label}
                </CText>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

     

      {selectedPhrase && (
        <View style={[localStyles.phraseBox, {backgroundColor: '#F3D2ED'}]}>
          <CText type="M14" color={colors.textColor} align="center" style={localStyles.phraseText}>
            {selectedPhrase}
          </CText>
        </View>
      )}


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
    </View>
  );

  return (
    <CSafeAreaView style={localStyles.container} color={null}>
      {/* Background Image with Overlay */}
      <Image
        source={require('../../assets/images/CM_Home (1).png')}
        style={localStyles.backgroundImage}
        resizeMode="cover"
      />
      <View style={localStyles.overlay} />
      
      <CMainAppBar mode="main" />
      <ScrollView
        contentContainerStyle={[localStyles.scrollContent, {paddingBottom: insets.bottom + 20}]}
        showsVerticalScrollIndicator={true}
      >
        {renderWelcomeSection()}
        {renderEmotionSelector()}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3FAFA',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: getWidth(375),
    height: getHeight(450),
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: getWidth(375),
    height: getHeight(450),
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
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
    paddingTop: moderateScale(10),
  },
  welcomeCard: {
    alignItems: 'center',
    marginBottom: moderateScale(15),
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: moderateScale(20),
    paddingVertical: moderateScale(15),
    paddingHorizontal: moderateScale(25),
    marginHorizontal: moderateScale(20),
  },
  welcomeTitle: {
    marginBottom: moderateScale(5),
    color: '#3EB8A5',
  },
  welcomeSubtitle: {
    color: '#5A7A8A',
  },
  emotionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(20),
    padding: moderateScale(20),
    ...styles.mb30,
    borderWidth: 1,
    borderColor: '#E2E7EB',
  },
  emotionTitle: {
    marginBottom: moderateScale(12),
    lineHeight: moderateScale(24),
  },
  emojisContainer: {
    marginTop: moderateScale(10),
    ...styles.mb20,
  },
  emojisRow: {
    ...styles.flexRow,
    ...styles.justifyEvenly,
    marginBottom: moderateScale(12),
  },
  emojisRowSecond: {
    ...styles.flexRow,
    justifyContent: 'center',
    gap: moderateScale(20),
  },
  emojiItem: {
    width: '30%',
    minWidth: moderateScale(88),
    paddingVertical: moderateScale(12),
    paddingHorizontal: moderateScale(8),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D9E6DF',
    backgroundColor: '#FFFFFF',
    marginBottom: moderateScale(12),
  },
  emojiItemSelected: {
    backgroundColor: '#E7F6EE',
    borderColor: '#7CD992',
  },
  emotionIcon: {
    width: moderateScale(48),
    height: moderateScale(48),
    marginBottom: moderateScale(8),
  },
  emotionLabel: {
    lineHeight: moderateScale(16),
  },
  supportingCopy: {
    marginBottom: moderateScale(20),
    lineHeight: moderateScale(20),
  },
  responderBtn: {
    width: '60%',
    alignSelf: 'center',
    height: getHeight(40),
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(15),
    marginTop: moderateScale(15),
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
});
