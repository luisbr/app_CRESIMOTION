import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Linking,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dropdown } from 'react-native-element-dropdown';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import { styles } from '../../theme';
import { getHeight, getWidth, moderateScale } from '../../common/constants';
import {getEmergencyContacts} from '../../api/emergency';
import CMainAppBar from '../../components/common/CMainAppBar';

export default function WellnessNetworkScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();

  const [loading, setLoading] = useState(true);
  const [countriesData, setCountriesData] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchContacts();
    }, [])
  );

  const fetchContacts = async () => {
    setLoading(true);
    const res = await getEmergencyContacts();
    if (res && res.data) {
      setCountriesData(res.data);
      // Seleccionar el primer país por defecto si hay datos
      if (res.data.length > 0) {
        setSelectedCountry(res.data[0].country_code);
      }
    }
    setLoading(false);
  };

  const handleCall = (phone: string) => {
    const url = `tel:${phone.replace(/\s/g, '')}`;
    Linking.canOpenURL(url)
      .then((supported) => {
        if (!supported) {
          console.log('Cant handle url: ' + url);
        } else {
          return Linking.openURL(url);
        }
      })
      .catch((err) => console.error('An error occurred', err));
  };


  const renderWarningSection = () => (
    <View style={localStyles.warningSection}>
      <CText type="B18" color={colors.primary2} align="left" style={styles.mb10}>
        Tus redes de emergencia locales
      </CText>
      <CText type="M14" color={colors.textColor} align="left" style={styles.mb10}>
        Esta sección está destinada a situaciones de emergencia. Si estás en peligro inmediato, no dudes en contactar a las líneas de emergencia proporcionadas.
      </CText>
      <CText type="M14" color={colors.textColor} align="left" style={{}}>
        Elige el país donde te encuentras para comunicarte con las líneas de ayuda ahí disponibles:
      </CText>
    </View>
  );

  const countryDropdownData = countriesData.map((c) => ({
    label: c.country_name,
    value: c.country_code,
  }));

  const currentCountryObj = countriesData.find((c) => c.country_code === selectedCountry);

  const renderSelectorAndContacts = () => {
    if (loading) {
      return (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    return (
      <View style={localStyles.selectorContainer}>
        <Dropdown
          style={[localStyles.dropdown, { borderColor: colors.grayScale3, backgroundColor: colors.white }]}
          placeholderStyle={{ color: colors.grayScale5, fontSize: moderateScale(14) }}
          selectedTextStyle={{ color: colors.textColor, fontSize: moderateScale(14) }}
          data={countryDropdownData}
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder="Selecciona un país"
          value={selectedCountry}
          onChange={(item) => setSelectedCountry(item.value)}
        />

        {currentCountryObj && currentCountryObj.contacts && currentCountryObj.contacts.length > 0 ? (
          <View style={styles.mt20}>
            {currentCountryObj.contacts.map((contact: any, index: number) => (
              <View key={index} style={[localStyles.contactCard, { backgroundColor: colors.white }]}>
                <View style={localStyles.contactInfo}>
                  <CText type="B16" color={colors.primary} align="left" style={styles.mb5}>
                    {contact.service_type || 'Línea de Emergencia'}
                  </CText>
                  {contact.notes ? (
                    <CText type="M12" color={colors.grayScale5} align="left" style={styles.mb5}>
                      {contact.notes}
                    </CText>
                  ) : null}
                  <CText type="B18" color={colors.textColor} align="left" style={{}}>
                    {contact.phone}
                  </CText>
                </View>

                <TouchableOpacity
                  style={[localStyles.callBtn, { backgroundColor: colors.primary }]}
                  onPress={() => handleCall(contact.phone)}
                >
                  <Ionicons name="call" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        ) : (
          <CText type="M14" color={colors.grayScale5} align="center" style={styles.mt20}>
            No hay líneas registradas para este país.
          </CText>
        )}
      </View>
    );
  };

  const renderLocalSupport = () => (
    <View style={localStyles.supportSection}>
      <CText type="B18" color={colors.primary2} align="left" style={styles.mb10}>
        Redes de apoyo locales
      </CText>
      <CText type="B16" color={colors.textColor} align="left" style={styles.mb10}>
        ¡Conecta con tu comunidad!
      </CText>
      <View style={[localStyles.forumCard, { backgroundColor: colors.white }]}>
        <Ionicons name="chatbubbles-outline" size={32} color={colors.primary} style={styles.mr15} />
        <View style={styles.flex}>
          <CText type="B14" color={colors.textColor} align="left" style={{}}>Foros de apoyo</CText>
          <CText type="M12" color={colors.grayScale5} align="left" style={{}}>Un espacio seguro para compartir y escuchar.</CText>
        </View>
      </View>
      <View style={[localStyles.forumCard, { backgroundColor: colors.white }]}>
        <Ionicons name="people-outline" size={32} color={colors.primary} style={styles.mr15} />
        <View style={styles.flex}>
          <CText type="B14" color={colors.textColor} align="left" style={{}}>Amistades dentro de la comunidad</CText>
          <CText type="M12" color={colors.grayScale5} align="left" style={{}}>Conecta con personas que te entienden.</CText>
        </View>
      </View>
    </View>
  );

  return (
    <CSafeAreaView color="#F0F5EE" style={{ backgroundColor: '#F0F5EE' }}>
      <CMainAppBar mode="sub" title="Tu red de bienestar" />
      <ScrollView
        contentContainerStyle={[localStyles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {renderWarningSection()}
        {renderSelectorAndContacts()}
        {renderLocalSupport()}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F0F5EE', // subtle green to match
    borderBottomWidth: 1,
    borderBottomColor: '#E2E7EB',
  },
  leftHeader: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerHeader: {
    flex: 3,
    alignItems: 'center',
  },
  rightHeader: {
    flex: 1,
    alignItems: 'flex-end',
  },
  iconButton: {
    padding: moderateScale(5),
    marginLeft: moderateScale(-5),
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(20),
  },
  warningSection: {
    ...styles.mb20,
  },
  selectorContainer: {
    ...styles.mb30,
    backgroundColor: '#FFF',
    borderRadius: moderateScale(15),
    padding: moderateScale(15),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  dropdown: {
    height: getHeight(50),
    borderWidth: 1,
    borderRadius: moderateScale(10),
    paddingHorizontal: moderateScale(15),
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: moderateScale(15),
    borderWidth: 1,
    borderColor: '#E2E7EB',
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(10),
  },
  contactInfo: {
    flex: 1,
    marginRight: moderateScale(10),
  },
  callBtn: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    ...styles.center,
  },
  supportSection: {
    ...styles.mb20,
  },
  forumCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(15),
    borderRadius: moderateScale(10),
    marginBottom: moderateScale(10),
    borderWidth: 1,
    borderColor: '#E2E7EB',
  },
});
