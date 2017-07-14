export function sizeFromJSONString(sizeString) {
  sizeString = sizeString.replace(/{(.*)}/, '$1');
  const sizeArray = sizeString.split(',');
  const imageSize = {
    width: sizeArray[0],
    height: sizeArray[1],
  };
  return imageSize;
}

export function makeid() {
  var text = '';
  var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 5; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function isMobile() {
  var mobile = false; // initiate as false
  // device detection
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    mobile = true;
  }
  return mobile;
}

export function fetchImage(imageURL, userID, callback) {
  var qiniu = require('qiniu');
  var superagent = require('superagent');
  qiniu.conf.ACCESS_KEY = 'U9rXzL5lXEphamQ_EoWrZpN2DCjLcKt6Shs00_fu';
  qiniu.conf.SECRET_KEY = '861w9Ii7wqr5NhKGUF0iiFXxzIFKEL_1cHsin7nN';
  const bucket = 'revofashion';
  const md5 = require('blueimp-md5');
  const key = 'client_uploads/images/' + userID + '/' + md5(imageURL).toUpperCase();
  const entry = bucket + ':' + key;
  const encodedEntryURI = qiniu.util.urlsafeBase64Encode(entry);
  const pic = new Buffer(imageURL).toString('base64');
  const basePic = qiniu.util.base64ToUrlSafe(pic);
  const url = 'http://iovip.qbox.me/fetch/' + basePic + '/to/' + encodedEntryURI;
  const token = qiniu.util.generateAccessToken(url);
  superagent.post(url)
    .set('authorization', token)
    .set('content-type', 'application/x-www-form-urlencoded')
    .end((error, response) => {
      if (error) {
        callback(error, null);
      } else {
        callback(null, response.body);
      }
    });
}
