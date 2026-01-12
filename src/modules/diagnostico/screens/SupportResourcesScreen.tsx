import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import CSafeAreaView from '../../../components/common/CSafeAreaView';
import CHeader from '../../../components/common/CHeader';
import CText from '../../../components/common/CText';
import {styles} from '../../../theme';

export default function SupportResourcesScreen() {
  const colors = useSelector(state => state.theme.theme);
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
    </CSafeAreaView>
  );
}
