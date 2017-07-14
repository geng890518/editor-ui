'use strict';
import React, { Component, PropTypes } from 'react';
import { message } from 'antd';
import superagent from 'superagent';
require('../Qiniu/progress.css');

export default class outLinkVideo extends Component {
  static propTypes = {
    finished: PropTypes.bool,
    urlRequired: PropTypes.string,
    updatelinkEntityData: PropTypes.func,
    iframe_code: PropTypes.string,
  }

  static defaultProps = {
    finished: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
      uploading: false,
      finished: props.finished,
      urlRequired: props.urlRequired,
      iframe: props.iframe_code,
    };
    this.upload = this._upload.bind(this);
    this.resize = this._resize.bind(this);
  }

  componentWillMount() {
    if (this.props.urlRequired) this.upload(this.props.urlRequired);
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.urlRequired && nextProps.urlRequired) this.upload(nextProps.urlRequired);
    if (this.iframe) {
      const ratio = this.iframe.clientWidth / this.iframe.getElementsByTagName('iframe')[0].getAttribute('width');
      const iframeheight = this.iframe.getElementsByTagName('iframe')[0].getAttribute('height') * ratio;
      this.iframe.getElementsByTagName('iframe')[0].style.height = iframeheight + 'px';
    }
  }

  uploadSuccess(urlRequired) {
    this.setState({
      finished: true,
    });
    this.props.updatelinkEntityData(urlRequired, this.state.iframe);
  }

  uploadFailed() {
    message.error('请输入有效路径');
    console.log('视频上传失败');
    this.setState({
      finished: false,
    });
  }

  _upload(urlRequired) {
    const url = 'http://dev.beegree.cc/api/v1/stories/video';
    const urlJSON = {
      url: urlRequired,
    };
    return new Promise((resolve, reject) => {
      const request = superagent.post(url);
      request.send(urlJSON);
      request.end((error, response) => {
        if (error) {
          this.uploadFailed();
        } else if (!error) {
          if (response.text) {
            const iframeContent = JSON.parse(response.text);
            this.setState({
              iframe: iframeContent.iframe_code,
            });
            this.uploadSuccess(urlRequired);
          } else {
            message.error('输入路径无效');
          }
          resolve(response);
        } else {
          reject(error);
        }
      });
    });
  }

  _resize() {
    if (this.iframe) {
      const ratio = this.iframe.clientWidth / this.iframe.getElementsByTagName('iframe')[0].getAttribute('width');
      const iframeheight = this.iframe.getElementsByTagName('iframe')[0].getAttribute('height') * ratio;
      this.iframe.getElementsByTagName('iframe')[0].style.height = iframeheight + 'px';
    }
  }

  renderCover() {
    return (
      <div>
        { this.props.children }
      </div>
    );
  }

  renderUploadedVideo(styles) {
    const iframeContent = this.state.iframe;
    return (
      // <div className={styles.videoBase}>
      //   { iframeContent }
      // </div>
      <div className={styles.iframewidth} ref={(ref) => { this.iframe = ref; }} dangerouslySetInnerHTML={{ __html: iframeContent }} />
    );
  }

  // renderUploading(styles) {
  //   const strokeWidth = 5;
  //   return (
  //     <div className={styles.uploading}>
  //       <Progress percent={this.state.progress} strokeWidth={strokeWidth} showInfo={false} />
  //       <p>上传中...</p>
  //     </div>
  //   );
  // }

  render() {
    const styles = require('./outLinkVideo.scss');
    let res = this.renderCover();
    if (this.state.finished) {
      res = this.renderUploadedVideo(styles);
    }

    return (
      <div className={styles.iframeWrapper}>
        { res }
      </div>
    );
  }
}
