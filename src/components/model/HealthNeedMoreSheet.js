import {FlatList, StyleSheet} from 'react-native';
import React from 'react';
import ActionSheet from 'react-native-actions-sheet';

// custom imports
import {useSelector} from 'react-redux';
import HealthNeedsComponent from '../home/HealthNeedsComponent';
import CText from '../common/CText';
import {HealthNeedMoreData} from '../../api/constant';
import {styles} from '../../theme';
import strings from '../../i18n/strings';

export default function HealthNeedMoreSheet(props) {
  const colors = useSelector(state => state.theme.theme);
  let {SheetRef} = props;

  const renderHealthNeed = ({item}) => {
    return <HealthNeedsComponent item={item} />;
  };
  return (
    <ActionSheet
      ref={SheetRef}
      gestureEnabled={false}
      containerStyle={[
        localStyles.mainContainer,
        {backgroundColor: colors.backgroundColor},
      ]}>
      <CText type={'B18'} style={styles.mv15}>
        {strings.healthNeeds}
      </CText>
      <FlatList
        data={HealthNeedMoreData.slice(0, 4)}
        renderItem={renderHealthNeed}
        keyExtractor={(item, index) => item.id.toString()}
        bounces={false}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.g18}
      />
      <CText type={'B18'} style={styles.mv15}>
        {strings.specializedCare}
      </CText>
      <FlatList
        data={HealthNeedMoreData.slice(4, 8)}
        renderItem={renderHealthNeed}
        keyExtractor={(item, index) => item.id.toString()}
        bounces={false}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.g23}
      />
    </ActionSheet>
  );
}

const localStyles = StyleSheet.create({
  mainContainer: {
    ...styles.ph25,
    ...styles.pv15,
    ...styles.pb30,
  },
});
