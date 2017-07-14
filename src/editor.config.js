require('babel-polyfill');

const EDITORBASEURL = {
  dev: 'http://dev.beegree.cc/api/v1/',
  test: 'http://dev.beegree.cc/api/v1/',
  prod: 'http://dev.beegree.cc/api/v1/'
};

const QINIUBASEURL = {
  dev: 'https://dev-utility.fblife.com',
  test: 'https://dev-utility.fblife.com',
  prod: 'https://dev-utility.fblife.com'
};

const SERVERPORT = {
  dev: 4000,
  test: 4001,
  prod: 4000
};

/**
 * node server env
 * 'dev' stands for development environment
 * 'test' stands for test environment
 * 'prod' stands for production environment
 */
const NODE_SERVER_ENVIRONMENT = {
  NODE_SERVER_ENVIRONMENT_DEV: 'dev',
  NODE_SERVER_ENVIRONMENT_TEST: 'test',
  NODE_SERVER_ENVIRONMENT_PROD: 'prod'
};

/**
 * set current server env
 */
const env = NODE_SERVER_ENVIRONMENT.NODE_SERVER_ENVIRONMENT_DEV;
module.exports = {
  editorBaseUrl: EDITORBASEURL[env],
  qiniuBaseUrl: QINIUBASEURL[env],
  port: SERVERPORT[env]
};
