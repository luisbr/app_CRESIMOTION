import {FlatList, StyleSheet, TouchableOpacity, View} from 'react-native';
import React, {useState} from 'react';

// custom import
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import CText from '../../components/common/CText';
import {styles} from '../../theme';
import {moderateScale} from '../../common/constants';
import {useSelector} from 'react-redux';
import DrProfileComponent from '../../components/home/DrProfileComponent';
import {NearbyDoctorsData} from '../../api/constant';
import {StackNav} from '../../navigation/NavigationKey';

export default function CalenderTab({navigation}) {
  const [isSelect, setIsSelect] = useState(0);
  const colors = useSelector(state => state.theme.theme);

  const onPressDoctorDetail = item => {
    navigation.navigate(StackNav.DoctorDetail, {item: item});
  };

  const categoryData = [
    {
      id: 0,
      title: strings.upcoming,
      onPress: () => setIsSelect(0),
    },
    {
      id: 1,
      title: strings.complete,
      onPress: () => setIsSelect(1),
    },
    {
      id: 2,
      title: strings.result,
      onPress: () => setIsSelect(2),
    },
  ];

  const HeaderCategory = () => {
    return categoryData.map((item, index) => {
      return (
        <TouchableOpacity
          onPress={item.onPress}
          style={[
            localStyles.root,
            {
              backgroundColor:
                isSelect === item.id ? colors.primary : colors.backgroundColor,
            },
          ]}>
          <CText
            type={'S14'}
            align={'center'}
            style={styles.pb5}
            color={isSelect === item.id ? colors.white : colors.labelColor}>
            {item.title}
          </CText>
        </TouchableOpacity>
      );
    });
  };

  const HeaderComponent = () => {
    return (
      <View
        style={[
          localStyles.headerContainer,
          {
            borderColor: colors.dark ? colors.dividerColor : colors.grayScale2,
          },
        ]}>
        <HeaderCategory />
      </View>
    );
  };

  const CompleteRenderItem = ({item, isCompleted, isResult}) => {
    return (
      <View
        style={[
          localStyles.headerRoot,
          {
            backgroundColor: colors.inputBg,
          },
        ]}>
        <DrProfileComponent
          drProfileImage={item.image}
          drName={item.drName}
          specialist={item.specialist}
          scheduleBgColor={colors.scheduleBg}
          scheduleTextColor={colors.labelColor}
          reschedule={isResult ? false : true}
          btnTitle1={isCompleted ? strings.rating : strings.cancel}
          btnTitle2={isCompleted ? strings.appointment : strings.reschedule}
          onPressBtn2={() => onPressDoctorDetail(item)}
          isCompleted={isCompleted}
        />
      </View>
    );
  };

  const RenderItem = ({isCompleted, isResult}) => {
    return (
      <FlatList
        data={NearbyDoctorsData}
        renderItem={({item, index}) => (
          <CompleteRenderItem
            item={item}
            isCompleted={isCompleted}
            isResult={isResult}
          />
        )}
        showsVerticalScrollIndicator={false}
        keyExtractor={(item, index) => item.id.toString()}
        bounces={false}
        contentContainerStyle={localStyles.mainContainer}
      />
    );
  };

  const ScheduleCategory = () => {
    switch (isSelect) {
      case 0:
        return <RenderItem />;
      case 1:
        return <RenderItem isCompleted={true} />;
      case 2:
        return <RenderItem isResult={true} />;
      default:
        return <RenderItem />;
    }
  };

  return (
    <CSafeAreaView>
      <CHeader title={strings.schedule} />
      <HeaderComponent />
      <ScheduleCategory />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  root: {
    ...styles.selfCenter,
    ...styles.ph10,
    borderRadius: moderateScale(12),
    ...styles.ph20,
    ...styles.pv10,
  },
  headerContainer: {
    borderRadius: moderateScale(12),
    borderWidth: moderateScale(1),
    ...styles.rowSpaceBetween,
    ...styles.mh20,
    ...styles.mt20,
  },
  headerRoot: {
    borderRadius: moderateScale(16),
    ...styles.p25,
  },
  mainContainer: {
    ...styles.p20,
    ...styles.g12,
  },
});
