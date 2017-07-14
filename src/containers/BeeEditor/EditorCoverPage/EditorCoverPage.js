import React, { Component, PropTypes } from 'react';
import { Qiniu } from 'components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { onDrop } from 'redux/modules/qiniu';
// import { fullImageURLForMediaModel } from '../../../helpers/URLHelpers';

@connect(
  state => ({
    files: state.qiniu.files,
    token: state.qiniu.token,
    uploadKey: state.qiniu.uploadKey,
    prefix: state.qiniu.prefix,
  }),
  dispatch => bindActionCreators({ onDrop }, dispatch)
)

export default class EditorCoverPage extends Component {

  static propTypes = {
    file: PropTypes.object,
    token: PropTypes.string,
    uploadKey: PropTypes.string,
    prefix: PropTypes.string,
    onDrop: PropTypes.func,
    blockProps: PropTypes.object,
    coverMedia: PropTypes.object,
  }

  render() {
    const styles = require('./EditorCoverPage.scss');
    let coverPageText = '点击或将文件拖拽到此区域上传';
    if (navigator.userAgent.indexOf('Mobile') !== -1) coverPageText = '点击此区域上传照片';
    let src = null;
    if (this.props.coverMedia) {
      src = this.props.coverMedia.name;
    }
    return (
      <div className={styles.nopadding}>
        <Qiniu
          onDrop={(files) => this.props.onDrop(files)}
          size={150}
          token={this.props.token}
          uploadKey={this.props.uploadKey}
          onUpload={this.onUpload}
          className={styles.base}
          type="coverImage"
          multiple={false}
          src={src}
        >
          <div className={styles.base}>
            <div className={styles.info}>
              <i className="a-photo" />
              添加封面图<br />
              {coverPageText}
            </div>
          </div>
        </Qiniu>
      </div>
    );
  }
}
