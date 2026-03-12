import {colors} from '../../theme/colors';
import {CHANGE_THEME, CHANGE_FONT_SCALE} from '../types';

const INITIAL_STATE = {
  theme: colors.light,
  fontScale: 1.0, // Default multiplier
};

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case CHANGE_THEME:
      return {
        ...state,
        theme: action.payload,
      };
    case CHANGE_FONT_SCALE:
      return {
        ...state,
        fontScale: action.payload,
      };
    default:
      return state;
  }
}
