import superagent from 'superagent';
import cookie from 'react-cookie';
// import { browserHistory } from 'react-router';
// import config from '../config';
import editorConfig from '../editor.config';

const methods = ['get', 'post', 'put', 'patch', 'del'];
function formatUrl(path) {
  if (/https?:\/\//.test(path)) return path;
  const adjustedPath = path[0] !== '/' ? '/' + path : path;
  return editorConfig.editorBaseUrl + adjustedPath;
}
export default class ApiClient {
  constructor(req) {
    methods.forEach((method) => (
      this[method] = (path, { params, data, authHeaders } = {}) => new Promise((resolve, reject) => {
        const request = superagent[method](formatUrl(path));
        if (params) {
          request.query(params);
        }

        if (__SERVER__ && req.get('cookie')) {
          request.set('cookie', req.get('cookie'));
        }

        if (cookie && cookie.load('loginResult')) {
          request.set('authorization', 'Bearer ' + cookie.load('loginResult').auth_token);
        }

        if (authHeaders) {
          for (let i = 0; i < authHeaders.length; i++) {
            const header = authHeaders[i];
            request.set(header.key, header.value);
          }
        }

        if (data) {
          request.set('Content-Type', 'application/json');
          request.send(data);
        }
        // request.end((err, { body } = {}) => ((err || body.code > 10000) ? reject(body || err) : resolve(body)));
        request.end((err, { body } = {}) => (err ? reject(body || err) : resolve(body)));
      })));
  }
  /*
   * There's a V8 bug where, when using Babel, exporting classes with only
   * constructors sometimes fails. Until it's patched, this is a solution to
   * "ApiClient is not defined" from issue #14.
   * https://github.com/erikras/react-redux-universal-hot-example/issues/14
   *
   * Relevant Babel bug (but they claim it's V8): https://phabricator.babeljs.io/T2455
   *
   * Remove it at your own risk.
   */
  empty() {}
}
