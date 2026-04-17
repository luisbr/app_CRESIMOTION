import React from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';
import {useRoute} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CMainAppBar from '../../components/common/CMainAppBar';
import CText from '../../components/common/CText';
import {moderateScale} from '../../common/constants';
import {getAboutSectionById} from './aboutContent';

function renderBlock(block: any, colors: any) {
  if (block.type === 'paragraph') {
    return (
      <CText type="R15" color={colors.textColor} style={localStyles.paragraph}>
        {block.text}
      </CText>
    );
  }

  if (block.type === 'highlight') {
    return (
      <View style={[localStyles.highlightBox, {backgroundColor: colors.inputBg}]}>
        <CText type="B16" color={colors.primary2} style={localStyles.highlightText}>
          {block.text}
        </CText>
      </View>
    );
  }

  if (block.type === 'bullets') {
    return (
      <View style={localStyles.bulletsWrap}>
        {block.items.map((item: string | {bold: string; normal: string}, index: number) => (
          <View key={`${typeof item === 'string' ? item : item.bold}-${index}`} style={localStyles.bulletRow}>
            <View style={[localStyles.bulletDot, {backgroundColor: colors.primary}]} />
            {typeof item === 'string' ? (
              <CText type="R15" color={colors.textColor} style={localStyles.bulletText}>
                {item}
              </CText>
            ) : (
              <Text style={localStyles.bulletText}>
                <Text style={{fontWeight: 'bold'}}>{item.bold}</Text>
                <Text>{item.normal}</Text>
              </Text>
            )}
          </View>
        ))}
      </View>
    );
  }

  return null;
}

export default function AboutDetailScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const section = getAboutSectionById(route.params?.sectionId);

  return (
    <CSafeAreaView color="#F6FBFA" style={localStyles.safeArea}>
      <CMainAppBar mode="sub" title={section.title} />
      <ScrollView
        contentContainerStyle={[
          localStyles.content,
          {paddingBottom: insets.bottom + moderateScale(28)},
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={localStyles.heroCard}>
          <View style={[localStyles.iconWrap, {backgroundColor: section.background}]}>
            <Ionicons name={section.icon} size={28} color={section.accent} />
          </View>
          <CText type="B24" color={colors.primary2} style={localStyles.heroTitle}>
            {section.title}
          </CText>
        </View>

        <View style={localStyles.contentCard}>
          {section.blocks.map((block: any, index: number) => (
            <View key={`${section.id}-${block.type}-${index}`}>
              {renderBlock(block, colors)}
            </View>
          ))}
        </View>
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
  iconWrap: {
    width: moderateScale(56),
    height: moderateScale(56),
    borderRadius: moderateScale(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(16),
  },
  heroTitle: {
    marginBottom: moderateScale(2),
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(24),
    padding: moderateScale(22),
    shadowColor: '#16392B',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  paragraph: {
    lineHeight: moderateScale(23),
    marginBottom: moderateScale(16),
  },
  bulletsWrap: {
    marginBottom: moderateScale(12),
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: moderateScale(14),
  },
  bulletDot: {
    width: moderateScale(8),
    height: moderateScale(8),
    borderRadius: moderateScale(4),
    marginTop: moderateScale(8),
    marginRight: moderateScale(12),
  },
  bulletText: {
    flex: 1,
    lineHeight: moderateScale(23),
  },
  highlightBox: {
    borderRadius: moderateScale(18),
    padding: moderateScale(18),
    marginBottom: moderateScale(4),
  },
  highlightText: {
    lineHeight: moderateScale(23),
  },
});
