import {StyleSheet} from 'react-native';
import {colors} from './colors';

export default StyleSheet.create({
  shadowStyle: {
    shadowOffset: {
      width: 1,
      height: 2,
    },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 7,
    shadowColor: colors.shadowColor,
  },
});
