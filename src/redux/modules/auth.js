import cookie from 'react-cookie';
// import { sha256 } from 'js-sha256';
// import { message } from 'antd';
// import superagent from 'superagent';

// const LOAD_AUTH_COOKIE = 'redux-example/auth/LOAD_AUTH_COOKIE';
// const LOAD_AUTH_COOKIE_SUCCESS = 'redux-example/auth/LOAD_AUTH_COOKIE_SUCCESS';
// const LOAD_AUTH_COOKIE_FAIL = 'redux-example/auth/LOAD_AUTH_COOKIE_FAIL';
// const LOGIN = 'redux-example/auth/LOGIN';
// const LOGIN_SUCCESS = 'redux-example/auth/LOGIN_SUCCESS';
// const LOGIN_FAIL = 'redux-example/auth/LOGIN_FAIL';
// const LOGOUT = 'redux-example/auth/LOGOUT';
// const LOGOUT_SUCCESS = 'redux-example/auth/LOGOUT_SUCCESS';
// const LOGOUT_FAIL = 'redux-example/auth/LOGOUT_FAIL';

const LOADAUTHBYTOKEN = 'redux-example/auth/LOADAUTHBYTOKEN';
const LOADAUTHBYTOKEN_SUCCESS = 'redux-example/auth/LOADAUTHBYTOKEN_SUCCESS';
const LOADAUTHBYTOKEN_FAIL = 'redux-example/auth/LOADAUTHBYTOKEN_FAIL';

export function generateAuthHeaderForUser(user) {
  const auth = [
    {
      key: 'X-Tella-Request-AppVersion',
      value: '1.0.0',
    },
    {
      key: 'X-Tella-Request-Provider',
      value: 'web',
    },
    {
      key: 'X-Tella-Request-Timestamp',
      value: user.token_timestamp,
    },
    {
      key: 'X-Tella-Request-Token',
      value: user.access_token,
    },
    {
      key: 'X-Tella-Request-Userid',
      value: user.userid,
    },
    {
      key: 'X-Tella-Request-FbToken',
      value: user.token,
    },
    {
      key: 'X-Tella-Request-FbID',
      value: user.fbid,
    },
    {
      key: 'X-Tella-Request-Device',
      value: 10,
    }
  ];
  return auth;
}

export function isEmptyObject(object) {
  if (object instanceof Object && Object.keys(object).length > 0) return false;
  return true;
}

const initialState = {
  loaded: false,
  user: null
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOADAUTHBYTOKEN:
      return {
        ...state,
        loading: true,
      };
    case LOADAUTHBYTOKEN_SUCCESS:
      console.log(action.result);
      return {
        ...state,
        loading: false,
        user: action.result
      };
    case LOADAUTHBYTOKEN_FAIL:
      return {
        ...state,
        loading: false,
        user: null
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.auth && globalState.auth.loaded;
}

export function loadAuthByToken() {
  return {
    types: [LOADAUTHBYTOKEN, LOADAUTHBYTOKEN_SUCCESS, LOADAUTHBYTOKEN_FAIL],
    promise: () => new Promise((resolve, reject) => {
      const auth = cookie.load('loginResult');
      if (auth && !isEmptyObject(auth)) {
        resolve(auth);
      } else {
        reject('Auth Cookie is not found!');
      }
    })
  };
}
