/**
 * Created by Tian on 16/8/4.
 */
// import editorConfig from '../../editor.config';
import superagent from 'superagent';
const initialState = {
  basicParamsLoaded: false,
  loadingbasicParams: true,
  basicParams: null,
  error: null,

  files: [],
  token: null,
  uploadKey: null, // Optional
  prefix: null // Optional
};

export default function qiniu(state = initialState, action = {}) {
  switch (action.type) {
    case 'QINIU_ON_DROP':
      return {
        ...state,
        files: action.files
      };
    case 'LOAD_BASIC_PARAMS_JSON':
      return {
        ...state,
        loadingbasicParams: true,
      };
    case 'LOAD_BASIC_PARAMS_JSON_SUCCESS':
      return {
        ...state,
        loadingbasicParams: false,
        basicParamsLoaded: true,
        token: action.result.data.token
      };
    case 'LOAD_BASIC_PARAMS_JSON_FAIL':
      return {
        ...state,
        loadingbasicParams: false,
        basicParamsLoaded: false,
        error: action.error,
      };
    default:
      return state;
  }
}

export function onDrop(files) {
  return {
    type: 'QINIU_ON_DROP',
    files,
  };
}

// 首次加载数据

export function isBasicParamsJsonLoaded(globalState) {
  return globalState.qiniu && globalState.qiniu.basicParamsLoaded;
}

export function loadBasicParamsJson() {
  const url = 'https://utility.fblife.com/image/common/get-token?bucket=content';
  return {
    types: ['LOAD_BASIC_PARAMS_JSON', 'LOAD_BASIC_PARAMS_JSON_SUCCESS', 'LOAD_BASIC_PARAMS_JSON_FAIL'],
    promise: () => new Promise((resolve, reject) => {
      const request = superagent.get(url);
      request.end((error, response) => {
        if (!error) {
          resolve(response.body);
        } else {
          reject(error);
        }
      });
    })
  };
}
