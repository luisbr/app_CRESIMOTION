import {CHANGE_THEME, CHANGE_FONT_SCALE} from '../types';

export const changeThemeAction = type => {
  return dispatch => {
    dispatch({
      type: CHANGE_THEME,
      payload: type,
    });
  };
};

export const changeFontScaleAction = scale => {
  return dispatch => {
    dispatch({
      type: CHANGE_FONT_SCALE,
      payload: scale,
    });
  };
};
