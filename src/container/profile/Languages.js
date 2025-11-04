import {SectionList, StyleSheet, TouchableOpacity, View} from 'react-native';
import React from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';

// custom import
import {useSelector} from 'react-redux';
import CText from '../../components/common/CText';
import {styles} from '../../theme';
import CSafeAreaView from '../../components/common/CSafeAreaView';
import CHeader from '../../components/common/CHeader';
import strings from '../../i18n/strings';
import {moderateScale} from '../../common/constants';
import {LanguagesData} from '../../api/constant';
import CDivider from '../../components/common/CDivider';

export default function Languages() {
  const colors = useSelector(state => state.theme.theme);
  const [isSelected, setIsSelected] = React.useState(1);
  const RenderHeader = ({title}) => {
    return (
      <CText type="S16" style={styles.mv10}>
        {title}
      </CText>
    );
  };

  const onPressItem = item => {
    setIsSelected(item);
  };

  const RenderData = ({item}) => {
    return (
      <View style={styles.g20}>
        <TouchableOpacity
          onPress={() => onPressItem(item.lnName)}
          style={localStyles.settingsContainer}>
          <CText type="s18">{item.lnName}</CText>
          <View style={localStyles.rightContainer}>
            <Ionicons
              name={isSelected === item.lnName && 'checkmark-circle'}
              size={moderateScale(24)}
              color={colors.checkMark}
            />
          </View>
        </TouchableOpacity>
        <CDivider style={styles.mv10} />
      </View>
    );
  };
  return (
    <CSafeAreaView>
      <CHeader title={strings.language} />
      <SectionList
        sections={LanguagesData}
        keyExtractor={(item, index) => item + index}
        renderItem={({item}) => <RenderData item={item} />}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({section: {title}}) => (
          <RenderHeader title={title} />
        )}
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={localStyles.mainContainer}
      />
    </CSafeAreaView>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.ph20,
  },
  settingsContainer: {
    ...styles.rowSpaceBetween,
    ...styles.mt10,
  },
});
