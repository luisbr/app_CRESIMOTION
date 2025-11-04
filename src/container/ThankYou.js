import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import CSafeAreaView from '../components/common/CSafeAreaView';
import {styles} from '../theme';
import CText from '../components/common/CText';
import CButton from '../components/common/CButton';
import images from '../assets/images';
import {getHeight, getWidth, moderateScale} from '../common/constants';
import {useSelector} from 'react-redux';
import {StackNav} from '../navigation/NavigationKey';

export default function ThankYou({navigation}) {
  const colors = useSelector(state => state.theme.theme);
  const onNext = () => {
    navigation.reset({index: 0, routes: [{name: StackNav.TabNavigation}]});
  };
  return (
    <CSafeAreaView>
      <View style={[styles.flex, styles.ph20, styles.justifyBetween]}>
        <View>
          <Image source={images.onBoardingImage1} style={localStyles.image} />
          <CText type={'B24'} align={'center'} style={styles.mt20}>
            {'Gracias por registrarte en CresiMotion'}
          </CText>
          <CText type={'R16'} align={'center'} color={colors.labelColor} style={styles.mt15}>
            {'Te damos la más cordial bienvenida. Para ayudarte a entender mejor cómo te sientes hoy y brindarte un servicio de calidad, por favor cuéntanos cuáles son los motivos de tu estado emocional.'}
          </CText>
        </View>
        <CButton title={'Siguiente'} onPress={onNext} />
      </View>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  image: {
    width: getWidth(320),
    height: getHeight(220),
    resizeMode: 'contain',
    ...styles.selfCenter,
    marginTop: moderateScale(30),
  },
});

