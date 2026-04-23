import React from 'react';
import {ScrollView, StyleSheet, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CMainAppBar from '../../components/common/CMainAppBar';
import CText from '../../components/common/CText';
import {moderateScale} from '../../common/constants';
import {StackNav} from '../../navigation/NavigationKey';
import {ABOUT_SECTIONS} from './aboutContent';

export default function AboutScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  return (
    <CSafeAreaView color="#F6FBFA" style={localStyles.safeArea}>
      <CMainAppBar mode="sub" title="Acerca de" />
      <ScrollView
        contentContainerStyle={[
          localStyles.content,
          {paddingBottom: insets.bottom + moderateScale(28)},
        ]}
        showsVerticalScrollIndicator={true}>
        <View style={localStyles.heroCard}>
          <View style={localStyles.heroBadge}>
            <Ionicons name="information-circle-outline" size={22} color="#0AA693" />
          </View>
          <CText type="B22" color={colors.primary2} style={localStyles.heroTitle}>
            Acerca de CresiMotion
          </CText>
        </View>

        {ABOUT_SECTIONS.map(section => (
          <TouchableOpacity
            key={section.id}
            activeOpacity={0.9}
            style={localStyles.card}
            onPress={() =>
              navigation.navigate(StackNav.AboutDetail, {sectionId: section.id})
            }>
            <View style={[localStyles.iconWrap, {backgroundColor: section.background}]}>
              <Ionicons name={section.icon} size={28} color={section.accent} />
            </View>
            <CText type="B18" color={colors.textColor} style={localStyles.cardTitle}>
              {section.title}
            </CText>
            <CText type="R14" color={colors.grayScale5} style={localStyles.cardBody}>
              {section.preview}
            </CText>
            <View style={[localStyles.ctaChip, {backgroundColor: section.background}]}>
              <CText type="S12" color={section.accent} style={localStyles.ctaText}>
                Conocer más
              </CText>
              <Ionicons name="arrow-forward" size={14} color={section.accent} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F6FBFA',
  },
  content: {
    paddingHorizontal: moderateScale(20),
    paddingTop: moderateScale(18),
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(22),
    marginBottom: moderateScale(18),
    shadowColor: '#0E4033',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  heroBadge: {
    width: moderateScale(44),
    height: moderateScale(44),
    borderRadius: moderateScale(14),
    backgroundColor: '#E8F7F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(14),
  },
  heroTitle: {
    marginBottom: moderateScale(2),
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(22),
    padding: moderateScale(18),
    marginBottom: moderateScale(14),
    shadowColor: '#16392B',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  iconWrap: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  cardTitle: {
    marginBottom: moderateScale(8),
  },
  cardBody: {
    lineHeight: moderateScale(21),
    marginBottom: moderateScale(16),
  },
  ctaChip: {
    alignSelf: 'flex-start',
    borderRadius: moderateScale(999),
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    marginRight: moderateScale(6),
  },
});
