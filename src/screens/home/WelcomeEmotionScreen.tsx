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
import {StackNav} from '../../navigation/NavigationKey';
import {useDrawer} from '../../navigation/DrawerContext';
import {getStoredNotifications} from '../../utils/notificationStorage';
import CMainAppBar from '../../components/common/CMainAppBar';
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
        ¿Te gustaría contarnos algunos motivos que podrían estar influyendo en cómo te sientes hoy?
      </CText>
      <CText type="R14" color={colors.textColor} align="center" style={localStyles.supportingCopy}>
        Con esta información podremos ofrecerte un enfoque positivo y una sesión de sanación emocional para ayudarte a sentirte mejor.
      </CText>
      <View style={localStyles.emojisRow}>
        {EMOTIONS.map((emo) => {
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

      {selectedPhrase && (
        <View style={[localStyles.phraseBox, {backgroundColor: '#F3D2ED'}]}>
          <CText type="M14" color={colors.textColor} align="center" style={localStyles.phraseText}>
            {selectedPhrase}
          </CText>
        </View>
      )}
    </View>
  );

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
    width: '80%',
    height: '80%',
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
    flexWrap: 'wrap',
    ...styles.mb20,
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
    marginBottom: moderateScale(18),
    lineHeight: moderateScale(20),
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
});
