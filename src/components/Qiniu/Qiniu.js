'use strict';
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { setCoverImageSuccess, delCoverImage } from 'redux/modules/editor';
import { Progress } from 'antd';
import { connect } from 'react-redux';
// import { fullImageURLForImageKey } from '../../helpers/URLHelpers';
import { Icon } from '../BasicComponents';
import { loadBasicParamsJson } from '../../redux/modules/qiniu';


var request = require('superagent-bluebird-promise');

require('./progress.css');

const isFunction = (fn) => {
  var getType = {};
  return fn && getType.toString.call(fn) === '[object Function]';
};

const md5 = require('blueimp-md5');

@connect(
  state => ({
    user: state.auth.user,
  }),
  dispatch => bindActionCreators({ setCoverImageSuccess, delCoverImage, loadBasicParamsJson }, dispatch)
)

export default class Qiniu extends Component {
  // based on https://github.com/paramaggarwal/react-dropzone
  static propTypes = {
    onRef: PropTypes.func,
    src: PropTypes.string,

    loadBasicParamsJson: PropTypes.func,
    onDrop: PropTypes.func.isRequired,
    token: PropTypes.string,
    // called before upload to set callback to files
    size: PropTypes.number,
    style: PropTypes.object,
    supportClick: PropTypes.bool,
    accept: PropTypes.string,
    multiple: PropTypes.bool,
    // Qiniu
    uploadUrl: PropTypes.string,
    uploadKey: PropTypes.string,
    prefix: PropTypes.string,

    user: PropTypes.object,
    file: PropTypes.object,
    createMoreImages: PropTypes.func,
    updateEntityData: PropTypes.func,
    setCoverImageSuccess: PropTypes.func,
    setCommentImageSuccess: PropTypes.func,
    delCoverImage: PropTypes.func,
    setAvatarImageSuccess: PropTypes.func,
    finished: PropTypes.bool,
    imageURL: PropTypes.string,
    type: PropTypes.oneOf([
      'coverImage',
      'editorImage',
      'avatarImage',
      'commentImage',
    ]),
    inputType: PropTypes.string,
  }

  static defaultProps = {
    supportClick: true,
    multiple: true,
    // uploadUrl: 'http://upload.qiniu.com',
    uploadUrl: 'http://up-z1.qiniu.com',
    prefix: 'client_uploads/images/',
    inputType: 'file',
  }

  constructor(props) {
    super(props);
    if (props.src) {
      this.state = {
        isDragActive: false,
        progress: 0,
        uploading: false,
        finished: true,
        imageURL: props.src,
      };
    } else {
      this.state = {
        isDragActive: false,
        progress: 0,
        uploading: false,
        finished: props.finished,
        imageURL: props.imageURL,
      };
    }
    this.deleteCover = this.deleteCover.bind(this);
    this.deleteCommentImage = () => {
      this.setState({
        finished: false,
        uploading: false,
      });
    };
  }

  componentDidMount() {
    if (this.props.type === 'commentImage') {
      this.props.onRef(this);
    }
    if (this.props.file) {
      this.onDrop(null, this.props.file);
    }
  }

  componentWillUnmount() {
    if (this.props.type === 'commentImage') {
      this.props.onRef(undefined);
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
    if (e) e.preventDefault();

    this.setState({
      isDragActive: false,
      uploading: true,
    });

    let files;
    if (e) {
      if (e.dataTransfer) {
        files = e.dataTransfer.files;
      } else if (e.target) {
        files = e.target.files;
      }
    } else if (fileObject) {
      files = [fileObject];
    }

    for (let i = 0; i < files.length; i++) {
      console.log('files[' + i + ']:' + files[i].name);
      // console.log('files[' + i + ']:' + md5(files[i]).toUpperCase());
    }

    const maxFiles = (this.props.multiple) ? files.length : 1;

    if (files.length > 1 && files.length <= maxFiles) {
      const otherFiles = [];
      for (let i = 1; i < files.length; i++) {
        otherFiles.push(files[i]);
      }
      files = [files[0]];
      this.props.createMoreImages(otherFiles); // 刨去第一个文件，用剩余的文件传回editor用于创建新的EditorImage
    }

    files = Array.prototype.slice.call(files, 0, maxFiles);
    this.onUpload(files, e);

    for (let i = 0; i < maxFiles; i++) {
      const tempFile = files[i];
      if (tempFile !== undefined) {
        tempFile.preview = URL.createObjectURL(files[i]);
        tempFile.request = this.upload(files[i]);
        tempFile.uploadPromise = files[i].request.promise();
        tempFile.uploadPromise.then((res) => {
          this.uploadSuccess(res, tempFile);
        }, (error) => {
          this.uploadFailed(error, tempFile);
        });
        tempFile.uploadPromise.catch((error) => {
          this.uploadFailed(error, tempFile);
        });
      }
    }
    if (this.props.onDrop) {
      files = Array.prototype.slice.call(files, 0, maxFiles);
      this.props.onDrop(files);
    }
  }

  onClick() {
    if (this.props.supportClick && this.props.token) {
      this.open();
    } else {
      console.log(this.props);
      this.props.loadBasicParamsJson();
      console.error('qiniu token doesn\'t exist. 😂 😂 😂 ');
    }
  }

  onUpload(files) {
    // set onprogress function before uploading
    files.map((f) => {
      f.onprogress = (e) => {
        this.setState({
          progress: e.percent
        });
      };
      return null;
    });
  }

  open() {
    var fileInput = this.fileInput;
    fileInput.value = null;
    fileInput.click();
  }

  upload(file) {
    if (!file || file.size === 0) return null;
    let key = md5(file.lastModified + file.name + file.size).toUpperCase();
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
      imageURL: responseBodyObject.url,
      uploading: false,
    });
    const fr = new FileReader();
    fr.onload = () => {
      var img = new Image();
      img.onload = () => {
        const sizeString = '{' + img.width + ',' + img.height + '}';
        if (this.props.type === 'editorImage') {
          this.props.updateEntityData(sizeString, file.key, responseBodyObject.url);
        } else if (this.props.type === 'coverImage') {
          const coverImage = {
            // name: file.key,
            name: responseBodyObject.url,
            original_size: sizeString,
          };
          this.props.setCoverImageSuccess(coverImage);
        } else if (this.props.type === 'commentImage') {
          const commentImage = {
            zoom: 0,
            original_size: sizeString,
            focalpoint: '{0, 0}',
            name: file.key
          };
          this.props.setCommentImageSuccess(commentImage);
        } else if (this.props.type === 'avatarImage') {
          const avatarImage = {
            name: file.key,
            original_size: sizeString,
          };
          this.props.setAvatarImageSuccess(avatarImage);
          this.setState({ finished: false });
        }
      };
      img.src = fr.result;
    };
    fr.readAsDataURL(file);
  }

  uploadFailed(error, file) {
    console.log(JSON.stringify(error));
    console.log('图片上传失败' + error + 'file:' + file);
    this.setState({
      finished: false,
      uploading: false,
    });
  }

  deleteCover() {
    this.setState({
      finished: false,
      uploading: false,
    });
    this.props.delCoverImage();
  }

  render() {
    const styles = require('./Qiniu.scss');
    const borderColor = {
      borderColor: 'white',
      padding: '2px 8px',
    };
    let className = styles.dropzone;
    if (this.state.isDragActive) {
      className = styles.dropzoneActive;
    }

    let imageHeightStyle = { height: 200 };
    switch (this.props.type) {
      case 'coverImage':
      case 'editorImage':
        imageHeightStyle = {
          height: 200
        };
      // }
        break;
      case 'commentImage':
        imageHeightStyle = {
          height: this.props.size,
          border: 'none'
        };
      // }
        break;
      case 'avatarImage':
        imageHeightStyle = {
          height: this.props.size,
          border: 'none',
          borderRadius: (this.props.size / 2)
        };
      // }
        break;
      default:
    }

    const style = {
      display: 'none'
    };

    let res = (
      <div
        className={className}
        style={imageHeightStyle}
        onClick={() => this.onClick()}
        onDragLeave={() => this.onDragLeave()}
        onDragOver={(e) => this.onDragOver(e)}
        onDrop={(e) => this.onDrop(e)}
      >
        <input
          style={style}
          type={this.props.inputType}
          multiple={this.props.multiple}
          ref={(c) => { this.fileInput = c; }}
          onChange={(e) => this.onDrop(e)}
          accept={this.props.accept}
        />
        { this.props.children }
      </div>
    );

    if (this.state.finished) {
      const backgroundCover = {
        backgroundImage: 'url(' + this.state.imageURL + ')',
      };
      if (this.props.type === 'coverImage') {
        res = (
          <div className={styles.imageViewBase}>
            {/* <img src={this.state.imageURL} role="presentation" />*/}
            <div className={styles.backgroundCover} style={backgroundCover}>
              <button
                className={styles.deleteButton}
                style={borderColor}
                onClick={this.deleteCover}
              >
                删除封面
              </button>
            </div>
          </div>
        );
      } else if (this.props.type === 'editorImage') {
        res = (
          <div className={styles.imageViewBase}>
            <img src={this.state.imageURL} role="presentation" />
            {/* {this.props.children}*/}
            {/* <div style={backgroundCover} />*/}
          </div>
        );
      } else if (this.props.type === 'commentImage') {
        const crossstyle = {
          position: 'relative',
          display: 'inline',
          verticalAlign: 'baseline',
          top: -2
        };
        res = (
          <div className={styles.imageViewBase}>
            <div className={styles.deleteForCommentImage} onClick={this.deleteCommentImage}>
              <Icon width={12} height={12} type="cross" style={crossstyle} />
            </div>
            <div
              className={styles.backgroundCoverForComment}
              style={backgroundCover}
            />
          </div>
        );
      } else if (this.props.type === 'avatarImage') {
        res = (
          <div className={styles.imageViewBase}>
            <div className={styles.backgroundCoverForAvatar} style={backgroundCover} />
          </div>
        );
      }
    } else if (this.state.uploading) {
      let cameraIconStyle;
      let uploadingStyle;
      let strokeWidth = 5;
      let cameraIconSize = 30;
      let actualHeight = 200;
      switch (this.props.type) {
        case 'coverImage':
        case 'editorImage':
          cameraIconStyle = {
            top: 80,
            fontSize: 14
          };
          uploadingStyle = {
            top: 80,
            fontSize: 14
          };
        // }
          break;
        case 'commentImage':
          strokeWidth = 2;
          cameraIconSize = 20;
          actualHeight = this.props.size;
          cameraIconStyle = {
            top: 5,
            fontSize: 12
          };
          uploadingStyle = {
            top: 5,
            fontSize: 12,
            width: 50,
            transform: 'scale(0.6)',
            marginLeft: 0,
          };
        // }
          break;
        case 'avatarImage':
          strokeWidth = 2;
          cameraIconSize = 20;
          actualHeight = this.props.size;
          cameraIconStyle = {
            top: 30,
          };
          uploadingStyle = {
            top: 40,
            fontSize: 12,
            width: 100,
          };
        // }
          break;
        default:
      }
      // const isForCommentImage = this.props.type === 'commentImage';
      // const strokeWidth = isForCommentImage ? 2 : 5;
      // const cameraIconSize = isForCommentImage ? 20 : 30;
      // const uploadingOriginalHeight = 200;
      // const actualHeight = isForCommentImage ? this.props.size : uploadingOriginalHeight;
      // const actualTop = isForCommentImage ? 5 : 80;
      // const fontSize = isForCommentImage ? 12 : 14;
      // const cameraIconStyle = {
      //   top: actualTop,
      //   fontSize
      // };
      // let uploadingStyle = {
      //   top: actualTop,
      //   fontSize
      // };
      // if (isForCommentImage) {
      //   uploadingStyle = {
      //     top: actualTop,
      //     fontSize,
      //     width: 50,
      //     transform: 'scale(0.6)',
      //     marginLeft: 0,
      //   };
      // }
      const forAvatarImage = this.props.type === 'avatarImage';
      res = (
        <div className={styles.uploading} style={{ height: actualHeight }}>
          { !forAvatarImage && <Progress percent={this.state.progress} strokeWidth={strokeWidth} showInfo={false} /> }
          <div className={styles.cameraIcon} style={cameraIconStyle}>
            <Icon width={cameraIconSize} height={cameraIconSize} type="camera" />
          </div>
          <p style={uploadingStyle}>上传中...</p>
        </div>
      );
    }

    return (
      <div>
        { res }
      </div>
    );
  }
}
