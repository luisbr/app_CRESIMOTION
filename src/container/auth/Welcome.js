import React from 'react';
import {Image, View, StyleSheet, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CText from '../../components/common/CText';
import CButton from '../../components/common/CButton';
import {styles} from '../../theme';
import {hp, wp} from '../../common/constants';
import {AuthNav, StackNav} from '../../navigation/NavigationKey';

const logoSource = require('../../../assets/logo.png');
const logoAsset = Image.resolveAssetSource(logoSource);
const logoAspect = logoAsset?.width && logoAsset?.height ? logoAsset.width / logoAsset.height : 1;

export default function Welcome() {
  const navigation = useNavigation();
  const logoWidth = wp(50);
  const logoHeight = logoWidth / (logoAspect || 1);

  return (
    <CSafeAreaView>
      <View style={[styles.flex, styles.justifyCenter, styles.ph20]}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => navigation.navigate(StackNav.WelcomeEmotion)}
        >
          <Image
            source={logoSource}
            style={[localStyles.logo, styles.selfCenter, {width: logoWidth, height: logoHeight}]}
          />
        </TouchableOpacity>
        <CText type={'B24'} align={'center'} style={styles.mt20}>
          {'¡Te damos la bienvenida!'}
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
        <CButton
          title={'Regresar'}
          bgColor={'#EEF3F6'}
          borderColor={'#D6E0E8'}
          color={'#4F6475'}
          containerStyle={localStyles.fullWidthBtn}
          onPress={() => navigation.navigate(StackNav.WelcomeEmotion)}
        />
      </View>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  logo: {
    resizeMode: 'contain',
  },
  fullWidthBtn: {
    width: '100%',
  },
});
