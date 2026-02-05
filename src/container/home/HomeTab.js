import { FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from "react-native-vector-icons/Ionicons";

// custom imports
import CSafeAreaView from "../../components/common/CSafeAreaView";
import { styles } from "../../theme";
import CText from "../../components/common/CText";
import CButton from "../../components/common/CButton";
import strings from "../../i18n/strings";
import { useSelector } from "react-redux";
import { moderateScale } from "../../common/constants";
import images from "../../assets/images";
import HealthNeedsComponent from "../../components/home/HealthNeedsComponent";
import { HealthNeedsData } from "../../api/constant";
import HealthNeedMoreSheet from "../../components/model/HealthNeedMoreSheet";
import DrProfileComponent from "../../components/home/DrProfileComponent";
import { StackNav } from "../../navigation/NavigationKey";
import { getSession } from "../../api/auth";
import { migrate } from "../../db";
import { getInProgressForUser, listSelectedReasons, listUnansweredMotivoIds, listAllProgress, listReasonsForProgress, listIntensitiesForProgress, debugLogFlow } from "../../repositories/formsRepo";
import { getEncuestaById } from "../../api/encuestas";
import { getTherapyNext } from "../../api/sesionTerapeutica";
import { isTherapyRoute, normalizeTherapyNext } from "../../screens/therapy/therapyUtils";

export default function HomeTab({ navigation }) {
  const colors = useSelector((state) => state.theme.theme);
  const SheetRef = useRef();
  const [displayName, setDisplayName] = useState('');
  const [selectedReasons, setSelectedReasons] = useState([]);
  const [pending, setPending] = useState(null);
  const [pendingTitle, setPendingTitle] = useState('');
  const [description, setDescription] = useState('');
  const [therapyNext, setTherapyNext] = useState(null);
  const reasons = [
    {id: 1, title: ''},

  ];
  const onReset = async () => {
    try {
      const { getSession } = require('../../api/auth');
      const { clearAllProgressForUser } = require('../../repositories/formsRepo');
      const s = await getSession();
      clearAllProgressForUser(String(s?.id || 'anon'));
      navigation.popToTop();
    } catch (e) {}
  };
  const loadHomeState = useCallback(async () => {
    try {
    const s = await getSession();
    const name = s?.nombre || s?.alias || '';
    const userId = String(s?.id || 'anon');
    setDisplayName(name);
    console.log('[HOME] session:', name);
    migrate();
    debugLogFlow(userId, 'HomeTab:load');

const p = getInProgressForUser(userId);
if (p) {
  setPending(p);
  try {
    const data = await getEncuestaById(p.encuesta_id);
    setPendingTitle(data?.encuesta || '');
    setDescription(data?.description || '');
   // console.log('[HOME] pending:', { encuesta_id: p.encuesta_id, progress_id: p.id });
   // console.log('[HOME] pending title:', data?.encuesta || '');
  } catch (e) {}
} else {
  setPending(null);
  setPendingTitle('');
  //console.log('[HOME] pending: null');

  // Sugerir primera encuesta válida (cíclico)
  try {
    const { getEncuestas } = require('../../api/encuestas');
    const all = await getEncuestas();
    const isValidEncuesta = (enc) => {
      const motivos = enc?.motivos || [];
      if (!motivos.length) return false;
      return motivos.every(m => Array.isArray(m.intensidades) && m.intensidades.length > 0);
    };
    const valid = all.filter(isValidEncuesta).sort((a, b) => Number(a.id) - Number(b.id));
   // console.log('[HOME] encuestas válidas:', valid.length);
    if (valid.length > 0) {
      setPendingTitle(valid[0].encuesta || '');
     // console.log('[HOME] siguiente sugerida (sin pending):', String(valid[0].id), valid[0].encuesta);
    }
  } catch (e) {
    console.log('[HOME][ERROR] load encuestas', e);
  }
}
    try {
      const next = await getTherapyNext(userId);
      const normalized = normalizeTherapyNext(next);
      if (isTherapyRoute(normalized.route)) {
        setTherapyNext(next);
      } else {
        setTherapyNext(null);
      }
    } catch (e) {
      setTherapyNext(null);
    }
} catch (e) {}
}, []);


  useFocusEffect(
useCallback(() => {
loadHomeState();
}, [loadHomeState])
);

// Opcional: también al primer render
useEffect(() => {
loadHomeState();
}, [loadHomeState]);

  const onPressMore = async () => {
    if (therapyNext) {
      navigation.navigate('TherapyFlowRouter', { initialNext: therapyNext, entrypoint: 'home' });
      return;
    }
    navigation.navigate('DiagnosticoHome');
    /*
    pending 
    console.log('[NAV] onPressMore', { hasPending: !!pending });
    if (pending) {
      // continuar
      try {
        const data = await getEncuestaById(pending.encuesta_id);
        const motivos = data?.motivos || [];
        const selected = listSelectedReasons(pending.id);
        const unanswered = listUnansweredMotivoIds(pending.id, selected);
        console.log('[NAV] decision', { selected: selected.length, unanswered: unanswered.length });
        if (selected.length > 0 && unanswered.length > 0) {
          console.log('[NAV] to IntensityWizard', { encuestaId: String(pending.encuesta_id), progressId: pending.id, unansweredCount: unanswered.length });
          navigation.navigate('IntensityWizard', {
            encuestaId: String(pending.encuesta_id),
            encuestaTitle: pendingTitle,
            progressId: pending.id,
            motivos: motivos.filter(m => unanswered.includes(m.id)),
          });
          return;
        }
        const nextMap = { '1': '2', '2': '3' };
        const nextId = nextMap[String(pending.encuesta_id)];
        if (nextId) {
          console.log('[NAV] to ReasonsList (next survey)', { encuestaId: nextId });
          navigation.navigate('ReasonsList', { encuestaId: nextId });
          return;
        }
      } catch (e) {}
      console.log('[NAV] all surveys completed or fallback to current', { encuestaId: String(pending.encuesta_id) });
      navigation.popToTop();
    } else {
      // iniciar
      console.log('[NAV] to ReasonsList', { encuestaId: '1' });
      navigation.navigate('ReasonsList', { encuestaId: '1' });
    }*/
  };

  const onPressNotification = () => {};

  const onPressDrProfile = (item) => {
    navigation.navigate(StackNav.DoctorDetail, { item: item });
  };

  const HeaderCardComponent = () => {
    return (
      <View
        style={[
          localStyles.headerRoot,
          {
            backgroundColor: colors.primary,
          },
        ]}
         
      >
        <TouchableOpacity onPress={onPressMore}>
          <DrProfileComponent
                    drProfileImage={images.DrProfileImage}
                    drName={pendingTitle || "-"}
                    specialist={""}
                    color={colors.white}
                    scheduleLabel={therapyNext ? 'Continuar sesión terapéutica' : 'Iniciar diagnostico'}
                    scheduleBgColor={colors.checkMark}
                    
                  />
        </TouchableOpacity>

        <View style={[styles.mt10]}>
          <CButton
            title={'Log resultados (debug)'}
            onPress={async () => {
              try {
                const s = await getSession();
                const userId = String(s?.id || 'anon');
                const progresses = listAllProgress(userId);
                console.log('[DEBUG] Progresos:', progresses);
                for (const p of progresses) {
                  const reasons = listReasonsForProgress(p.id);
                  const intensities = listIntensitiesForProgress(p.id);
                  console.log('[DEBUG] Progreso **', pending, p.id, 'encuesta', p.encuesta_id, 'status', p.status);
                  console.log(' [DEBUG] Motivos seleccionados:', reasons.map(r => String(r.motivo_id)));
                  console.log(' [DEBUG] Intensidades:', intensities);
                }
              } catch (e) {
                console.log('[DEBUG][ERROR]', e?.message || e);
              }
            }}
            bgColor={colors.inputBg}
            color={colors.primary}
          />
        </View>

        {!!therapyNext && (
          <View style={[styles.mt10]}>
            <CButton
              title={'Continuar sesión terapéutica'}
              onPress={() => navigation.navigate('TherapyFlowRouter', { initialNext: therapyNext, entrypoint: 'home' })}
            />
          </View>
        )}

        <View style={[styles.mt10]}>
          <CButton
            title={'Reiniciar'}
            onPress={onReset}
            bgColor={colors.inputBg}
            color={colors.primary}
          />
        </View>
        
      </View>
    );
  };



  const HeaderComponent = () => {
    return (
      <View>
        <View style={localStyles.headerContainer}>
          <View>
            <CText type={"B18"}>{displayName ? `Hola, ${displayName}` : 'Hola'}</CText>
            <CText type={"S12"} color={colors.labelColor}>
              {strings.howFeelToday}
            </CText>
          </View>
          <View style={localStyles.notificationContainer}>
            {/* top user icon removed; use bottom Profile tab instead */}
            <TouchableOpacity
              style={[
                localStyles.iconContainer,
                {
                  borderColor: colors.dark
                    ? colors.iconBorderColor
                    : colors.grayScale2,
                },
              ]}
            >
              <Ionicons
                name={"search-outline"}
                color={colors.textColor}
                size={moderateScale(24)}
              />
            </TouchableOpacity>
          </View>
        </View>
        <HeaderCardComponent />
        { /*
        <CText type={"B18"} style={localStyles.headerText}>
          {strings.healthNeeds}
        </CText>
       
        <FlatList
          data={HealthNeedsData}
          renderItem={renderHealthNeed}
          keyExtractor={(item, index) => item.id.toString()}
          bounces={false}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.g20}
        />
        <CText type={"B18"} style={localStyles.headerText}>
          {strings.nearbyDoctor}
        </CText>

              */
       }

      </View>
    );
  };

  const toggleReason = (id) => {
    setSelectedReasons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const renderReason = ({item}) => {
    return (
      <TouchableOpacity style={localStyles.reasonRow} onPress={() => toggleReason(item.id)}>
        <CText type={'S16'} style={styles.flex}>{item.title}</CText>
        
      </TouchableOpacity>
    );
  };
  return (
    <CSafeAreaView>
      
      <FlatList
        data={reasons}
        renderItem={renderReason}
        keyExtractor={(item, index) => item.id.toString()}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.mainContainer}
        ListHeaderComponent={
          <View>
            <HeaderComponent />
            <CText type={"B18"} style={localStyles.headerText}>
              {pendingTitle || "-"}
            </CText>
            <CText type={"R14"} color={colors.labelColor}>
              {description || ""}
            </CText>
          </View>
        }
        ListFooterComponent={
          <View>
            
          </View>
        }
      />
      
      <HealthNeedMoreSheet SheetRef={SheetRef} />

      {/* user modal removed */}
      
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  headerContainer: {
    ...styles.rowSpaceBetween,
  },
  notificationContainer: {
    ...styles.flexRow,
    ...styles.itemsCenter,
    ...styles.g10,
  },
  iconContainer: {
    height: moderateScale(48),
    width: moderateScale(48),
    borderRadius: moderateScale(24),
    ...styles.center,
    borderWidth: moderateScale(1),
  },
  headerRoot: {
    borderRadius: moderateScale(16),
    ...styles.p25,
    ...styles.mt25,
    ...styles.shadowStyle,
  },
  mainContainer: {
    ...styles.p20,
    ...styles.g20,
  },
  headerText: {
    ...styles.mb15,
    ...styles.mt25,
  },
  reasonRow: {
    ...styles.rowSpaceBetween,
    ...styles.itemsCenter,
    ...styles.pv15,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  
});
