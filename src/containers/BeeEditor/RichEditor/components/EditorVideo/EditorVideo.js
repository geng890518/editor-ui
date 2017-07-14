import React, { Component, PropTypes } from 'react';
import {
  // Editor,
  EditorState,
  // RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';
import { QiNiuVideo } from 'components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';
import { onDrop, loadBasicParamsJson, isBasicParamsJsonLoaded } from 'redux/modules/qiniu';
import { message } from 'antd';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import { convertCurrentContentToElementsArray, convertTitleToRawDraftContent } from '../../../../../helpers/EditorHelpers';
const { hasCommandModifier } = KeyBindingUtil;


@asyncConnect([{
  deferred: true,
  promise: ({ store: { dispatch, getState } }) => {
    if (isBasicParamsJsonLoaded(getState())) {
      return dispatch(loadBasicParamsJson());
    }
    return undefined;
  }
}])

@connect(
  state => ({
    token: state.qiniu.token,
    uploadKey: state.qiniu.uploadKey,
    prefix: state.qiniu.prefix,
  }),
  dispatch => bindActionCreators({ onDrop }, dispatch)
)

export default class EditorVideo extends Component {

  static propTypes = {
    block: PropTypes.object.isRequired,
    token: PropTypes.string,
    uploadKey: PropTypes.string,
    prefix: PropTypes.string,
    onDrop: PropTypes.func,
    blockProps: PropTypes.object,
    editingVideo: PropTypes.func,
    editingFooter: PropTypes.func,
  }

  constructor(props) {
    super(props);

    let newEditorState = EditorState.createEmpty();
    if (props.blockProps.captionText) {
      const blocks = convertFromRaw(convertTitleToRawDraftContent(props.blockProps.captionText));
      newEditorState = EditorState.createWithContent(blocks);
    }
    if (props.blockProps.videoURL && props.blockProps.finished) {
      this.state = {
        editorState: newEditorState,
        tipWidth: 12,
        tipDisplay: true,
        infoDisplay: false,
        finished: props.blockProps.finished,
        videoURL: props.blockProps.videoURL,
        urlRequired: props.blockProps.urlRequired,
        tipBorder: true,
      };
    } else if (props.blockProps.urlRequired && props.blockProps.finished) {
      this.state = {
        editorState: newEditorState,
        // tipWidth: '0%',
        tipDisplay: false,
        infoDisplay: true,
        finished: props.blockProps.finished,
        videoURL: props.blockProps.videoURL,
        urlRequired: props.blockProps.url,
        tipBorder: false,
        infoWidth: 12,
        iframe_code: props.blockProps.iframe_code,
      };
    } else {
      this.state = {
        editorState: newEditorState,
        urlRequired: '',
        infowidth: 8,
        tipWidth: 4,
        tipDisplay: true,
        infoDisplay: true,
        finished: false,
        tipBorder: true,
      };
    }

    this.onChange = async (editorState) => {
      this.setState({ editorState });
      const content = editorState.getCurrentContent();
      const elements = await (convertCurrentContentToElementsArray(convertToRaw(content)));
      if (elements.length > 0) {
        // this.props.setTitle(elements[0].content.media.plain_text);
        // console.log('设置Caption');
      } else {
        // this.props.setTitle(null);
        // console.log('设置Caption为空');
      }
    };
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
    this.inputPress = this._inputPress.bind(this);
    this.outLink = this._outLink.bind(this);
    this.finishInput = this._finishInput.bind(this);
    // this.infoHover = this._infoHover.bind(this);
    // this.tipHover = this._tipHover.bind(this);
    this.click = this._click.bind(this);
    this.hiddenFooter = this._hiddenFooter.bind(this);
    this.showFooter = this._showFooter.bind(this);
    // this.onMouseDown = () => {
    //   this.setState({
    //     editMode: true,
    //   }, () => {
    //     this._startEdit();
    //     setTimeout(() => this.captionEditor.focus(), 0);
    //   });
    // };
    //
    // this.onBlur = () => {
    //   if (this.state.editMode) {
    //     this.setState({
    //       editMode: false
    //     }, this._finishEdit);
    //   }
    // };

    this._startEdit = () => {
      // console.log('focus');
      this.props.blockProps.onStartCaptionEdit(this.props.block.getKey());
    };

    this._finishEdit = () => {
      // console.log('blur');
      const currentContent = convertToRaw(this.state.editorState.getCurrentContent());
      const blocks = currentContent.blocks;
      let captionText = null;
      if (blocks.length > 0) {
        const firstBlock = blocks[0];
        if (firstBlock.type === 'unstyled' && firstBlock.text.length > 0) {
          captionText = firstBlock.text;
          const entityKey = this.props.block.getEntityAt(0);
          const contentState = this.state.editorState.getCurrentContent();
          contentState.mergeEntityData(entityKey, { captionText });
        }
      }
      this.props.blockProps.onFinishCaptionEdit(captionText);
    };
  }
  onDrop(files) {
    this.setState({
      tipWidth: 12,
      infoDisplay: false,
      finished: true,
    }, () => {
      this.props.blockProps.editingVideo(true);
      this.props.onDrop(files);
      this.props.blockProps.editingVideo(false);
    });
    // this.props.blockProps.editingVideo(true);
    // this.props.onDrop(files);
  }

  myKeyBindingFn(e) {
    if (e.keyCode === 13 /* `回车` key */ && !hasCommandModifier(e)) {
      return 'myeditor-save';
    }
    return getDefaultKeyBinding(e);
  }

  _handleKeyCommand() {
    return true;
    // const { editorState } = this.state;
    // if (command === 'myeditor-save') {
    //   return 'handled';
    // }
    // const newState = RichUtils.handleKeyCommand(editorState, command);
    // if (newState) {
    //   this.onChange(newState);
    //   return true;
    // }
    // return false;
  }

  updateEntityData(name, videoURL, length) {
    const entityKey = this.props.block.getEntityAt(0);
    const contentState = this.state.editorState.getCurrentContent();
    contentState.mergeEntityData(entityKey, { name, videoURL, length, finished: true });
    this.setState(
      {
        finished: true,
        videoURL
      }
    );
  }

  updatelinkEntityData(url, iframe_code) {
    const entityKey = this.props.block.getEntityAt(0);
    const contentState = this.state.editorState.getCurrentContent();
    contentState.mergeEntityData(entityKey, { url, iframe_code, finished: true });
    this.setState(
      {
        finished: true,
        urlRequired: url,
        tipDisplay: false,
        infowidth: 12,
      }
    );
  }

  _outLink() {
    this.props.blockProps.editingVideo(true);
    if (this.input) this.input.focus();
  }

  _inputPress(e) {
    if (e.keyCode === 13 || e.which === 13) {
      const reg = new RegExp('^(http|https)://', 'i');
      const link = this.input.value;
      if (reg.test(link)) {
        this.props.blockProps.editingVideo(false);
        this.setState({
          urlRequired: this.input.value,
        });
      } else {
        message.error('请输入正确的路径', 2);
      }
    }
  }

  _click() {
    const reg = new RegExp('^(http|https)://', 'i');
    const link = this.input.value;
    if (reg.test(link)) {
      this.props.blockProps.editingVideo(false);
      this.setState({
        urlRequired: this.input.value,
      });
    } else {
      message.error('请输入正确的路径', 2);
    }
  }

  _finishInput() {
    this.props.blockProps.editingVideo(false);
    // this.setState({
    //   infoWidth: '100%',
    //   infoBorderRadius: '5px 5px 5px 5px',
    //   tipDisplay: 'none'
    // });
  }
  _hiddenFooter() {
    if (document && navigator.userAgent.indexOf('Mobile') !== -1) {
      this.props.blockProps.editingFooter(true);
    }
  }

  _showFooter() {
    if (document && navigator.userAgent.indexOf('Mobile') !== -1) {
      this.props.blockProps.editingFooter(false);
    }
  }
  render() {
    // const tipWidth = this.state.tipWidth;
    const tipDisplay = this.state.tipDisplay;
    // const infoDisplay = this.state.infoDisplay;
    const styles = require('./EditorVideo.scss');
    // let infoBorder = !this.state.finished ? styles.info : styles.infoless;
    // if (this.state.finished) {
    //   infoBorder = styles.noBorder;
    // }
    let tipBorder = this.state.tipBorder ? styles.tip : styles.tipless;
    if (this.state.finished) {
      tipBorder = styles.noBorder;
      // infoBorder = styles.noBorder;
    }
    require('./placeholder.css');
    // const addCaptionView = this.state.finished ? (
    //   <div onFocus={this._startEdit} onBlur={this._finishEdit} className="RichEditor_editor">
    //     <div className={styles.blank} />
    //     <div className={styles.captionBase}>
    //       <Editor
    //         editorState={this.state.editorState}
    //         onChange={this.onChange}
    //         placeholder="点击添加说明"
    //         handleKeyCommand={this.handleKeyCommand}
    //         keyBindingFn={this.myKeyBindingFn}
    //         ref={(ref) => { this.captionEditor = ref; }}
    //         className="RichEditor-editor"
    //       />
    //     </div>
    //     <div className={styles.blank} />
    //   </div>
    // ) : null;
    const border = this.state.finished ? styles.noBorder : styles.base;
    return (
      <div className={styles.elementBase}>
        <div className={border}>
          <Row style={{ width: '100%', marginLeft: '2px' }}>
            <Col md={12} sm={12} xs={12}>
              <div className={tipBorder} onMouseOver={this.tipHover} style={{ display: tipDisplay, borderRadius: this.state.tipBorderRadius }}>
                <QiNiuVideo
                  onDrop={() => this.onDrop()}
                  videoURL={this.state.videoURL}
                  token={this.props.token}
                  updateEntityData={(name, videoURL, length) => this.updateEntityData(name, videoURL, length)}
                  finished={this.state.finished}
                >
                  <button className={styles.rightbutton} type="button">上传本地视频</button>
                  <div className={styles.localupload}>可将本地视频拖拽至此区域上传<br />目前支持.mp4文件格式<br />单个视频不大于1GB<br />网页端最多可上传10个视频</div>
                </QiNiuVideo>
              </div>
            </Col>
          </Row>
        </div>
        {/* {addCaptionView} */}
      </div>
    );
  }
}
