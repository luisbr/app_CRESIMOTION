import React from 'react';
import {Image, ScrollView, StyleSheet, View} from 'react-native';
import CSafeAreaView from '../components/common/CSafeAreaView';
import {styles} from '../theme';
import CText from '../components/common/CText';
import CButton from '../components/common/CButton';
import images from '../assets/images';
import {getHeight, getWidth, moderateScale} from '../common/constants';
import {useSelector} from 'react-redux';
import {StackNav, TabNav} from '../navigation/NavigationKey';

export default function ThankYou({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const onNext = () => {
    navigation.reset({index: 0, routes: [{name: StackNav.TabNavigation, state: { routes: [{ name: TabNav.HomeTab }] }}]});
  };
  return (
    <CSafeAreaView>
      <ScrollView contentContainerStyle={styles.flexGrow} showsVerticalScrollIndicator={false}>
        <View style={[styles.ph20]}>
          <Image source={images.onBoardingImage1} style={localStyles.image} />
          <CText type={'B20'} align={'center'} style={styles.mt15}>
            {'Gracias por registrarte en CresiMotion'}
          </CText>
          <CText type={'R16'} style={styles.mt12}>
            {'Te damos la más cálida bienvenida'}
          </CText>
          <CText type={'R14'} color={colors.labelColor} style={styles.mt8}>
            {'CresiMotion es tu espacio para sanar, crecer y sentirte mejor.'}
          </CText>
          <View style={localStyles.section}>
            <CText type={'B16'} color={colors.primary}>
              {'Sesiones y hábitos'}
            </CText>
            <CText type={'R12'} color={colors.labelColor} style={styles.mt3}>
              {'Regula tus emociones con prácticas diarias y sesiones guiadas.'}
            </CText>
          </View>
          <View style={localStyles.section}>
            <CText type={'B16'} color={colors.primary}>
              {'Test'}
            </CText>
            <CText type={'R12'} color={colors.labelColor} style={styles.mt3}>
              {'Evalúate y mejora tus áreas de vida.'}
            </CText>
          </View>
          <View style={localStyles.section}>
            <CText type={'B16'} color={colors.primary}>
              {'Recordatorios y beneficios'}
            </CText>
            <CText type={'R12'} color={colors.labelColor} style={styles.mt3}>
              {'Recibe alertas útiles y accede a herramientas según tu plan.'}
            </CText>
          </View>
          <CText type={'B14'} style={styles.mt15}>
            {'Todo listo para comenzar. Es momento de vivir tu proceso de sanación.'}
          </CText>
        </View>
      </ScrollView>
      <View style={[styles.ph20, styles.pb20]}>
        <CButton title={'Siguiente'} onPress={onNext} />
      </View>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  image: {
    width: getWidth(220),
    height: getHeight(150),
    resizeMode: 'contain',
    ...styles.selfCenter,
    marginTop: moderateScale(15),
  },
  section: {
    marginTop: moderateScale(12),
  },
});

