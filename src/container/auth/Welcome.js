import React from 'react';
import {Image, View, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {styles} from '../../theme';
import {getHeight, getWidth} from '../../common/constants';
import {AuthNav} from '../../navigation/NavigationKey';

export default function Welcome() {
  const navigation = useNavigation();

  return (
    <CSafeAreaView>
      <View style={[styles.flex, styles.justifyCenter, styles.ph20]}>
        <Image
          source={require('../../../assets/logo.png')}
          style={[localStyles.logo, styles.selfCenter]}
        />
        <CText type={'B24'} align={'center'} style={styles.mt20}>
          {'Bienvenido!!!'}
        </CText>

        <View style={styles.mt30} />
        <CButton
          title={'Iniciar sesión'}
          bgColor={'#0aa693'}
          containerStyle={localStyles.fullWidthBtn}
          onPress={() => navigation.navigate(AuthNav.Login)}
        />
        <CButton
          title={'Regístrate'}
          bgColor={'#2d486d'}
          containerStyle={localStyles.fullWidthBtn}
          onPress={() => navigation.navigate(AuthNav.Register)}
        />
      </View>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  logo: {
    height: getHeight(80),
    width: getWidth(80),
    resizeMode: 'contain',
  },
  fullWidthBtn: {
    width: '100%',
  },
});
