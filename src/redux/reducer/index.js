import {combineReducers} from 'redux';
import theme from './theme';
import ui from './ui';
import profile from './profile';

const rootReducer = combineReducers({
  theme,
  ui,
  profile,
});

export default rootReducer;
