import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';
import {SHOW_SCREEN_TOOLTIP} from '../../../config/debug';
import {useDiagnosticoFlow} from '../../../navigation/DiagnosticoFlowContext';

export default function SupportResourcesScreen() {
  const colors = useSelector(state => state.theme.theme);
  const {setIsDiagnosticoFlow} = useDiagnosticoFlow();

  useEffect(() => {
    setIsDiagnosticoFlow(true);
    return () => setIsDiagnosticoFlow(false);
  }, [setIsDiagnosticoFlow]);
  return (
    <CSafeAreaView>
      <CHeader />
      <View style={styles.p20}>
        <CText type={'S24'} align={'center'} style={styles.mb10}>
          Vias de apoyo
        </CText>
        <CText type={'S14'} align={'center'} color={colors.labelColor}>
          Contenido pendiente. Aqui mostraremos recursos de apoyo.
        </CText>
      </View>
      {SHOW_SCREEN_TOOLTIP && (
        <View style={localStyles.screenTooltip} pointerEvents="none">
          <CText type={'S12'} color={'#fff'}>
            SupportResourcesScreen
          </CText>
        </View>
      )}
    </CSafeAreaView>
  );
}

const localStyles = {
  screenTooltip: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
};
