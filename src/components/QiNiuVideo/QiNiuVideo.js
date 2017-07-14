'use strict';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { setCoverImageSuccess } from 'redux/modules/editor';
import { Progress } from 'antd';
import { connect } from 'react-redux';
// import { Icon } from '../BasicComponents';
import VideoControls from './VideoControls';
// import { fullVideoURLForVideoKey } from '../../helpers/URLHelpers';
import { loadBasicParamsJson } from '../../redux/modules/qiniu';

var request = require('superagent-bluebird-promise');
const md5 = require('blueimp-md5');

require('../Qiniu/progress.css');

const isFunction = (fn) => {
  var getType = {};
  return fn && getType.toString.call(fn) === '[object Function]';
};

@connect(
  state => ({
    user: state.auth.user,
  }),
  dispatch => bindActionCreators({ setCoverImageSuccess, loadBasicParamsJson }, dispatch)
)

export default class Qiniu extends Component {
  static propTypes = {
    onDrop: PropTypes.func,
    token: PropTypes.string,
    supportClick: PropTypes.bool,
    accept: PropTypes.string,
    multiple: PropTypes.bool,
    // Qiniu
    loadBasicParamsJson: PropTypes.func,
    uploadUrl: PropTypes.string,
    uploadKey: PropTypes.string,
    prefix: PropTypes.string,

    user: PropTypes.object,
    file: PropTypes.object,
    finished: PropTypes.bool,
    videoURL: PropTypes.string,
    createMoreVideos: PropTypes.func,
    updateEntityData: PropTypes.func,
  }

  static defaultProps = {
    supportClick: true,
    multiple: false,
    // uploadUrl: 'http://upload.qiniu.com',
    uploadUrl: 'http://up-z1.qiniu.com',
    prefix: 'client_uploads/videos/',
    finished: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      isDragActive: false,
      progress: 0,
      uploading: false,
      finished: props.finished,
      videoURL: props.videoURL
    };
  }

  componentDidMount() {
    if (this.props.file) {
      this.onDrop(null, this.props.file);
    }
  }

  onDragLeave() {
    this.setState({
      isDragActive: false
    });
  }

  onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    this.setState({
      isDragActive: true
    });
  }

  onDrop(e, fileObject) {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      isDragActive: false,
      uploading: true,
    });

    let files = [fileObject];
    if (e) {
      if (e.dataTransfer) {
        files = e.dataTransfer.files;
      } else if (e.target) {
        files = e.target.files;
      }
    }

    if (this.props.multiple && files.length > 1) {
      this.props.createMoreVideos(files.filter((file, index) => index > 0));
    }
    const file = files[0];

    console.log('file' + file.name);
    // console.log('file' + md5(file).toUpperCase());

    this.onUpload(file, e);
    file.preview = URL.createObjectURL(file);
    file.request = this.upload(file);
    file.uploadPromise = file.request.promise();
    file.uploadPromise.then((res) => {
      this.uploadSuccess(res, file);
    }, (error) => {
      this.uploadFailed(error, file);
    });
    file.uploadPromise.catch((error) => {
      this.uploadFailed(error, file);
    });

    if (this.props.onDrop) {
      this.props.onDrop(file);
    }
  }

  onUpload(file) {
    file.onprogress = (e) => {
      this.setState({
        progress: e.percent
      });
    };
  }

  onClick() {
    if (this.props.supportClick && this.props.token) {
      this.open();
    } else {
      this.props.loadBasicParamsJson();
      console.error('qiniu token doesn\'t exist. 😂 😂 😂 ');
    }
  }

  open() {
    var fileInput = this.fileInput;
    fileInput.value = null;
    fileInput.click();
  }

  upload(file) {
    if (!file || file.size === 0) return null;
    let key = md5(file.lastModified + file.name + file.size).toUpperCase();
    // let key = file.name;
    file.key = this.props.user.userid + '/' + key;
    if (this.props.prefix) {
      key = this.props.prefix + this.props.user.userid + '/' + key;
    }

    if (this.props.uploadKey) {
      key = this.props.uploadKey;
    }
    console.log('Upload:' + file.name);
    const r = request
      .post(this.props.uploadUrl)
      .field('key', key)
      .field('token', this.props.token)
      .field('x:filename', file.name)
      .field('x:size', file.size)
      .attach('file', file, file.name)
      .set('Accept', 'application/json');
    if (isFunction(file.onprogress)) {
      r.on('progress', file.onprogress);
    }
    return r;
  }

  uploadSuccess(res, file) {
    const responseBodyObject = JSON.parse(res.text);
    this.setState({
      finished: true,
      uploading: false,
      videoURL: responseBodyObject.url
    });
    if (this.video) {
      if (isNaN(this.video.duration)) {
        this.props.updateEntityData(file.key, responseBodyObject.url, 0);
      } else {
        this.props.updateEntityData(file.key, responseBodyObject.url, this.video.duration);
      }
    }
  }

  uploadFailed(error, file) {
    console.log('视频上传失败' + error + 'file:' + file);
    this.setState({
      finished: false,
      uploading: false,
    });
  }

  _onVideoTimeUpdate() {
    this.controls.handleTimeUpdate();
  }

  _onVideoEnded() {
    this.controls.handleVideoEnded();
  }

  renderCover(styles) {
    let className = styles.dropzone;
    if (this.state.isDragActive) {
      className = styles.dropzoneActive;
    }
    const style = {
      display: 'none'
    };
    return (
      <div
        className={className}
        onClick={() => this.onClick()}
        onDragLeave={() => this.onDragLeave()}
        onDragOver={(e) => this.onDragOver(e)}
        onDrop={(e) => this.onDrop(e)}
      >
        <input
          style={style}
          type="file"
          multiple={this.props.multiple}
          ref={(c) => { this.fileInput = c; }}
          onChange={(e) => this.onDrop(e)}
          accept={this.props.accept}
        />
        { this.props.children }
      </div>
    );
  }

  renderUploadedVideo(styles) {
    return (
      <div className={styles.videoBase}>
        <video
          className={styles.video}
          src={this.state.videoURL}
          ref={(video) => { this.video = video; }}
          onTimeUpdate={() => this._onVideoTimeUpdate()}
          onEnded={() => this._onVideoEnded()}
        />
        <VideoControls
          video={this.video}
          ref={((controls) => { this.controls = controls; })}
        />
      </div>
    );
  }

  renderUploading(styles) {
    const strokeWidth = 5;
    return (
      <div className={styles.uploading}>
        <Progress percent={this.state.progress} strokeWidth={strokeWidth} showInfo={false} />
        <p>上传中...</p>
      </div>
    );
  }

  render() {
    const styles = require('./QiNiuVideo.scss');
    let res = this.renderCover(styles);
    if (this.state.finished) {
      res = this.renderUploadedVideo(styles);
    } else if (this.state.uploading) {
      res = this.renderUploading(styles);
    }
    return (
      <div>
        { res }
      </div>
    );
  }
}
