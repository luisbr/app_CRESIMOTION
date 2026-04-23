import React, {useCallback, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CSafeAreaView from '../../components/common/CSafeAreaView';
import CMainAppBar from '../../components/common/CMainAppBar';
import CText from '../../components/common/CText';
import {getWorkedMotivos} from '../../api/sesionTerapeutica';
import {moderateScale} from '../../common/constants';

type Mode = 'recommendations' | 'exercises';

type WorkedItem = {
  historial_id: number;
  diagnostico_id: number;
  motivo?: {
    id: number;
    label: string;
    key: string;
  };
  completed_at?: string;
  recomendaciones?: Array<{
    recomendacion_id: number;
    title: string;
    info?: string;
    info_icon?: boolean;
    ejercicios?: Array<{
      ejercicio_id: number;
      title: string;
      info?: string;
    }>;
  }>;
};

type WorkedSelectionsScreenProps = {
  mode: Mode;
};

const SCREEN_COPY = {
  recommendations: {
    title: 'Recomendaciones',
    heroTitle: 'Tus recomendaciones guardadas',
    heroText:
      'Explora las recomendaciones que has elegido durante tus sesiones. Cada una está organizada por motivo trabajado para que vuelvas a ella con facilidad.',
    emptyTitle: 'Aún no hay recomendaciones para mostrar',
    emptyText:
      'Cuando selecciones recomendaciones dentro de una sesión terapéutica, aparecerán aquí para que puedas consultarlas de nuevo.',
    icon: 'bulb-outline',
    accent: '#4F7A6A',
    soft: '#EEF5F1',
  },
  exercises: {
    title: 'Ejercicios',
    heroTitle: 'Tus ejercicios seleccionados',
    heroText:
      'Aquí encontrarás los ejercicios que has elegido en tu proceso. Ábrelos cuando quieras recordar cómo practicarlos.',
    emptyTitle: 'Aún no hay ejercicios para mostrar',
    emptyText:
      'Cuando selecciones ejercicios dentro de una sesión terapéutica, aparecerán aquí con su información correspondiente.',
    icon: 'barbell-outline',
    accent: '#5B6FA8',
    soft: '#EDF1FB',
  },
} as const;

const formatCompletedAt = (value?: string) => {
  if (!value) return '';
  const normalized = value.replace(' ', 'T');
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const buildGroups = (items: WorkedItem[], mode: Mode) =>
  items
    .map(item => {
      const motivoLabel = item?.motivo?.label || 'Motivo trabajado';
      const recomendaciones = Array.isArray(item?.recomendaciones)
        ? item.recomendaciones
        : [];

      const entries =
        mode === 'recommendations'
          ? recomendaciones.map(reco => ({
              id: `reco-${item.historial_id}-${reco.recomendacion_id}`,
              title: reco.title || 'Recomendación',
              info: reco.info || 'Sin información adicional por ahora.',
              badge:
                reco.ejercicios?.length > 0
                  ? `${reco.ejercicios.length} ejercicio${reco.ejercicios.length > 1 ? 's' : ''}`
                  : 'Sin ejercicios vinculados',
            }))
          : recomendaciones.flatMap(reco =>
              (reco.ejercicios || []).map(exercise => ({
                id: `exercise-${item.historial_id}-${reco.recomendacion_id}-${exercise.ejercicio_id}`,
                title: exercise.title || 'Ejercicio',
                info: exercise.info || 'Sin información adicional por ahora.',
                badge: reco.title || 'Recomendación relacionada',
              })),
            );

      return {
        id: `group-${mode}-${item.historial_id}`,
        title: motivoLabel,
        subtitle: formatCompletedAt(item.completed_at),
        entries,
      };
    })
    .filter(group => group.entries.length > 0);

export default function WorkedSelectionsScreen({
  mode,
}: WorkedSelectionsScreenProps) {
  const colors = useSelector((state: any) => state.theme.theme);
  const insets = useSafeAreaInsets();
  const copy = SCREEN_COPY[mode];

  const [items, setItems] = useState<WorkedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [openEntries, setOpenEntries] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getWorkedMotivos();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e?.message || 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const groups = useMemo(() => buildGroups(items, mode), [items, mode]);

  const toggleGroup = (id: string) => {
    setOpenGroups(prev => ({...prev, [id]: !prev[id]}));
  };

  const toggleEntry = (id: string) => {
    setOpenEntries(prev => ({...prev, [id]: !prev[id]}));
  };

  return (
    <CSafeAreaView color="#F7FBF8" style={localStyles.safeArea}>
      <CMainAppBar mode="sub" title={copy.title} />
      <ScrollView
        contentContainerStyle={[
          localStyles.content,
          {paddingBottom: insets.bottom + moderateScale(28)},
        ]}
        showsVerticalScrollIndicator={true}>
        <View style={localStyles.heroCard}>
          <View style={[localStyles.heroBadge, {backgroundColor: copy.soft}]}>
            <Ionicons name={copy.icon} size={22} color={copy.accent} />
          </View>
          <CText type="B22" color={colors.primary2} style={localStyles.heroTitle}>
            {copy.heroTitle}
          </CText>
          <CText type="R14" color={colors.textColor} style={localStyles.heroText}>
            {copy.heroText}
          </CText>
        </View>

        {loading ? (
          <View style={localStyles.centerBox}>
            <ActivityIndicator size="large" color={copy.accent} />
          </View>
        ) : error ? (
          <View style={localStyles.errorBox}>
            <CText type="S14" color="#B42318">
              {error}
            </CText>
          </View>
        ) : groups.length === 0 ? (
          <View style={localStyles.emptyCard}>
            <Ionicons name={copy.icon} size={32} color={copy.accent} />
            <CText type="B18" color={colors.textColor} style={localStyles.emptyTitle}>
              {copy.emptyTitle}
            </CText>
            <CText type="R14" color={colors.grayScale5} align="center" style={localStyles.emptyText}>
              {copy.emptyText}
            </CText>
          </View>
        ) : (
          groups.map(group => {
            const isGroupOpen = !!openGroups[group.id];
            return (
              <View key={group.id} style={localStyles.groupCard}>
                <TouchableOpacity
                  activeOpacity={0.88}
                  style={localStyles.groupHeader}
                  onPress={() => toggleGroup(group.id)}>
                  <View style={localStyles.groupHeaderText}>
                    <CText type="B18" color={colors.textColor} style={localStyles.groupTitle}>
                      {group.title}
                    </CText>
                    {!!group.subtitle && (
                      <CText type="R12" color={colors.grayScale5}>
                        {group.subtitle}
                      </CText>
                    )}
                  </View>
                  <View style={[localStyles.arrowWrap, {backgroundColor: copy.soft}]}>
                    <Ionicons
                      name={isGroupOpen ? 'chevron-up' : 'chevron-down'}
                      size={18}
                      color={copy.accent}
                    />
                  </View>
                </TouchableOpacity>

                {isGroupOpen && (
                  <View style={localStyles.entriesWrap}>
                    {group.entries.map(entry => {
                      const isOpen = !!openEntries[entry.id];
                      return (
                        <View key={entry.id} style={localStyles.entryCard}>
                          <TouchableOpacity
                            activeOpacity={0.88}
                            style={localStyles.entryHeader}
                            onPress={() => toggleEntry(entry.id)}>
                            <View style={localStyles.entryTextWrap}>
                              <CText type="S16" color={colors.textColor} style={localStyles.entryTitle}>
                                {entry.title}
                              </CText>
                              <View
                                style={[
                                  localStyles.entryBadge,
                                  {backgroundColor: copy.soft},
                                ]}>
                                <CText type="M12" color={copy.accent}>
                                  {entry.badge}
                                </CText>
                              </View>
                            </View>
                            <Ionicons
                              name={isOpen ? 'remove-circle-outline' : 'add-circle-outline'}
                              size={22}
                              color={copy.accent}
                            />
                          </TouchableOpacity>

                          {isOpen && (
                            <View style={localStyles.entryBody}>
                              <CText
                                type="R14"
                                color={colors.grayScale5}
                                style={localStyles.entryInfo}>
                                {entry.info}
                              </CText>
                            </View>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FBF8',
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
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: moderateScale(14),
  },
  heroTitle: {
    marginBottom: moderateScale(8),
  },
  heroText: {
    lineHeight: moderateScale(21),
  },
  centerBox: {
    paddingVertical: moderateScale(50),
    alignItems: 'center',
  },
  errorBox: {
    backgroundColor: '#FEF3F2',
    borderColor: '#F4C7C3',
    borderWidth: 1,
    borderRadius: moderateScale(18),
    padding: moderateScale(16),
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: moderateScale(22),
    padding: moderateScale(24),
    alignItems: 'center',
    shadowColor: '#16392B',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
  },
  emptyTitle: {
    marginTop: moderateScale(14),
    marginBottom: moderateScale(8),
  },
  emptyText: {
    lineHeight: moderateScale(20),
  },
  groupCard: {
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
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  groupHeaderText: {
    flex: 1,
    paddingRight: moderateScale(12),
  },
  groupTitle: {
    marginBottom: moderateScale(4),
  },
  arrowWrap: {
    width: moderateScale(34),
    height: moderateScale(34),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  entriesWrap: {
    marginTop: moderateScale(16),
  },
  entryCard: {
    borderWidth: 1,
    borderColor: '#E5ECE8',
    borderRadius: moderateScale(18),
    padding: moderateScale(14),
    marginBottom: moderateScale(12),
    backgroundColor: '#FCFDFC',
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTextWrap: {
    flex: 1,
    paddingRight: moderateScale(12),
  },
  entryTitle: {
    marginBottom: moderateScale(8),
  },
  entryBadge: {
    alignSelf: 'flex-start',
    borderRadius: moderateScale(999),
    paddingVertical: moderateScale(6),
    paddingHorizontal: moderateScale(10),
  },
  entryBody: {
    marginTop: moderateScale(12),
    paddingTop: moderateScale(12),
    borderTopWidth: 1,
    borderTopColor: '#E5ECE8',
  },
  entryInfo: {
    lineHeight: moderateScale(20),
  },
});
