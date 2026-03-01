import {combineReducers} from 'redux';
import theme from './theme';
import ui from './ui';

const rootReducer = combineReducers({
  theme,
  ui,
});

export default rootReducer;
