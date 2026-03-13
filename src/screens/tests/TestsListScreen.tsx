import React, {useEffect, useState, useCallback} from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import {StackNav} from '../../navigation/NavigationKey';
import {getCustomTests} from '../../api/customTests';

interface TestItem {
  id: number;
  titulo: string;
  descripcion: string;
  num_preguntas: number;
}

export default function TestsListScreen() {
  const colors = useSelector((state: any) => state.theme.theme);
  const navigation = useNavigation<any>();
  const [tests, setTests] = useState<TestItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTests = useCallback(async () => {
    setLoading(true);
    const data = await getCustomTests();
    setTests(data);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { loadTests(); }, [loadTests]));

  const renderItem = ({item}: {item: TestItem}) => (
    <TouchableOpacity
      style={[localStyles.card, {backgroundColor: colors.inputBg, borderColor: colors.primary + '30'}]}
      onPress={() => navigation.navigate(StackNav.TestDetail, {testId: item.id, testName: item.titulo})}
    >
      <View style={localStyles.cardIcon}>
        <Ionicons name="clipboard-outline" size={moderateScale(28)} color={colors.primary} />
      </View>
      <View style={localStyles.cardContent}>
        <CText type="B16" color={colors.primary} align="left" style={{}}>{item.titulo}</CText>
        {!!item.descripcion && (
          <CText type="R13" color={colors.labelColor} numberOfLines={2} style={styles.mt5} align="left">
            {item.descripcion}
          </CText>
        )}
        <View style={localStyles.badge}>
          <CText type="S11" color={colors.primary} align="left" style={{}}>
            {item.num_preguntas ?? '?'} preguntas
          </CText>
        </View>
      </View>
      <Ionicons name="chevron-forward" size={moderateScale(20)} color={colors.grayScale4} />
    </TouchableOpacity>
  );

  return (
    <CSafeAreaView>
      {/* Header */}
      <View style={[localStyles.header, {backgroundColor: colors.primary}]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={localStyles.backBtn}>
          <Ionicons name="arrow-back" size={moderateScale(24)} color="#fff" />
        </TouchableOpacity>
        <View style={styles.flex}>
          <CText type="B20" color="#fff" align="left" style={{}}>Tests de Bienestar</CText>
          <CText type="R13" color="#ffffff99" align="left" style={{}}>Autoevaluaciones emocionales</CText>
        </View>
      </View>

      {loading ? (
        <View style={styles.flex}>
          <ActivityIndicator size="large" color={colors.primary} style={styles.mt25} />
        </View>
      ) : (
        <FlatList
          data={tests}
          renderItem={renderItem}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={localStyles.list}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={localStyles.empty}>
              <Ionicons name="clipboard-outline" size={moderateScale(60)} color={colors.grayScale4} />
              <CText type="M16" color={colors.grayScale4} align="center" style={styles.mt15}>
                No hay tests disponibles por ahora
              </CText>
            </View>
          }
        />
      )}
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: moderateScale(15),
    paddingVertical: moderateScale(16),
    gap: moderateScale(12),
  },
  backBtn: {
    padding: moderateScale(4),
  },
  list: {
    padding: moderateScale(16),
    gap: moderateScale(12),
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: moderateScale(16),
    borderRadius: moderateScale(16),
    borderWidth: 1,
    gap: moderateScale(12),
  },
  cardIcon: {
    width: moderateScale(50),
    height: moderateScale(50),
    borderRadius: moderateScale(25),
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    flex: 1,
  },
  badge: {
    marginTop: moderateScale(6),
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScale(2),
    borderRadius: moderateScale(10),
  },
  empty: {
    alignItems: 'center',
    paddingTop: moderateScale(60),
  },
});
