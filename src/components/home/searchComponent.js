import React from 'react';
import {StyleSheet} from 'react-native';
import Icons from 'react-native-vector-icons/Feather';

// custom import
import CInput from '../common/CInput';
import typography from '../../theme/typography';
import {useSelector} from 'react-redux';
import {moderateScale} from '../../common/constants';
import {styles} from '../../theme';

export default function SearchComponent(props) {
  const {
    setData,
    searchText,
    containerStyle,
    inputBoxStyle,
    rightAccessory,
    value,
  } = props;
  const colors = useSelector(state => state.theme.theme);

  const SearchIcon = () => {
    return (
      <Icons
        name={'search'}
        size={moderateScale(20)}
        color={colors.labelColor}
      />
    );
  };
  return (
    <CInput
      value={value}
      placeholder={searchText}
      insideLeftIcon={() => <SearchIcon />}
      autoCapitalize={'none'}
      onChangeText={setData}
      inputContainerStyle={[containerStyle]}
      inputBoxStyle={[inputBoxStyle]}
      rightAccessory={rightAccessory}
    />
  );
}

const localStyles = StyleSheet.create({
  inputBoxStyle: {
    ...typography.fontWeights.Medium,
  },
});
