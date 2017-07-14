import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as reduxAsyncConnect } from 'redux-async-connect';

import auth from './auth';
import editor from './editor';
import qiniu from './qiniu';

export default combineReducers({
  routing: routerReducer,
  reduxAsyncConnect,
  editor,
  qiniu,
  auth
});
