import {FlatList, Image, StyleSheet, View} from 'react-native';
import React, {useCallback, useRef, useState} from 'react';

// custom imports
import CSafeAreaView from '../components/common/CSafeAreaView';
import {useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {setOnBoarding} from '../utils/AsyncStorage';
import {StackNav} from '../navigation/NavigationKey';
import {OnBoardingData} from '../api/constant';
import {deviceHeight, deviceWidth, moderateScale} from '../common/constants';
import CText from '../components/common/CText';
import strings from '../i18n/strings';
import {styles} from '../theme';
import CButton from '../components/common/CButton';

export default function OnBoarding() {
  const colors = useSelector(state => state.theme.theme);
  const [currentIndex, setCurrentIndex] = useState(0);
  const slideRef = useRef(null);

  const navigation = useNavigation();
  const _onViewableItemsChanged = useCallback(({viewableItems}) => {
    setCurrentIndex(viewableItems[0]?.index);
  }, []);

  const _onViewabilityConfig = {itemVisiblePercentThreshold: 50};

  const onPressNext = async () => {
    if (currentIndex === 4) {
      await setOnBoarding(true);
      navigation.reset({
        index: 0,
        routes: [{name: StackNav.AuthNavigation}],
      });
    } else {
      slideRef.current._listRef._scrollRef.scrollTo({
        x: deviceWidth * (currentIndex + 1),
      });
    }
  };

  const RenderItemData = useCallback(
    ({item}) => {
      return <Image source={item.image} style={localStyles.imageStyle} />;
    },
    [OnBoardingData],
  );

  const TitleText = () => {
    switch (currentIndex) {
      case 0:
        return strings.onBoardingTitle1;
      case 1:
        return strings.onBoardingTitle2;
      case 2:
        return strings.onBoardingTitle3;
      case 3:
        return strings.onBoardingTitle4;
      case 4:
        return strings.onBoardingTitle5;
      default:
        return strings.onBoardingTitle1;
    }
  };
  const DescText = () => {
    switch (currentIndex) {
      case 0:
        return strings.onBoardingDesc1;
      case 1:
        return strings.onBoardingDesc2;
      case 2:
        return strings.onBoardingDesc3;
      case 3:
        return strings.onBoardingDesc4;
      case 4:
        return strings.onBoardingDesc5;
      default:
        return strings.onBoardingDesc1;
    }
  };
  return (
    <CSafeAreaView>
      <FlatList
        data={OnBoardingData}
        renderItem={({item, index}) => (
          <RenderItemData item={item} index={index} />
        )}
        ref={slideRef}
        showsHorizontalScrollIndicator={false}
        horizontal
        keyExtractor={(item, index) => index.toString()}
        bounces={false}
        onViewableItemsChanged={_onViewableItemsChanged}
        _onViewabilityConfig={_onViewabilityConfig}
        pagingEnabled
      />
      <View>
        <CText type={'B24'} align={'center'} style={styles.mb10}>
          {TitleText()}
        </CText>
        <CText type={'R16'} align={'center'} color={colors.grayScale1}>
          {DescText()}
        </CText>

        <View style={localStyles.bottomIndicatorContainer}>
          {OnBoardingData.map((item, index) => (
            <View
              key={item?.id ?? index}
              style={[
                localStyles.bottomIndicatorStyle,
                {
                  width:
                    index !== currentIndex
                      ? moderateScale(8)
                      : moderateScale(24),
                  backgroundColor:
                    index !== currentIndex
                      ? colors.indicatorColor
                      : colors.primary,
                },
              ]}
            />
          ))}
        </View>
        <CButton
          title={currentIndex === 4 ? strings.getStarted : strings.next}
          containerStyle={localStyles.nextBtnStyle}
          onPress={onPressNext}
        />
      </View>
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  imageStyle: {
    resizeMode: 'stretch',
    width: deviceWidth,
    height: deviceHeight / 1.79,
  },
  bottomIndicatorContainer: {
    ...styles.flexRow,
    ...styles.center,
    ...styles.mv40,
  },
  bottomIndicatorStyle: {
    height: moderateScale(8),
    borderRadius: moderateScale(8),
    ...styles.mh5,
    ...styles.alignStart,
  },
  nextBtnStyle: {
    ...styles.selfCenter,
    ...styles.ph20,
  },
});
