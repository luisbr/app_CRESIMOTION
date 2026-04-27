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
      <ScrollView contentContainerStyle={styles.flexGrow} showsVerticalScrollIndicator={true}>
        <View style={[styles.ph20]}>
          <Image source={images.onBoardingImage1} style={localStyles.image} />
          <CText type={'B20'} align={'center'} style={styles.mt15}>
            {'Gracias por registrarte en CresiMotion'}
          </CText>
          
        </View>
      </ScrollView>
      <View style={[styles.ph20, styles.pb40]}>
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

