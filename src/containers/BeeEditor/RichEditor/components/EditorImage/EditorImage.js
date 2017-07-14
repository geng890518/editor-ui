import React, { Component, PropTypes } from 'react';
import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';
import { Qiniu } from 'components';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { asyncConnect } from 'redux-async-connect';

import { onDrop, loadBasicParamsJson, isBasicParamsJsonLoaded } from 'redux/modules/qiniu';
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

export default class EditorImage extends Component {

  static propTypes = {
    block: PropTypes.object.isRequired,

    token: PropTypes.string,
    uploadKey: PropTypes.string,
    prefix: PropTypes.string,
    onDrop: PropTypes.func,
    blockProps: PropTypes.object,
    editingImage: PropTypes.func,
    finished: PropTypes.bool,
    imageElement: PropTypes.object,
  }

  constructor(props) {
    super(props);

    let newEditorState = EditorState.createEmpty();

    if (props.blockProps.captionText) {
      const blocks = convertFromRaw(convertTitleToRawDraftContent(props.blockProps.captionText));
      newEditorState = EditorState.createWithContent(blocks);
    }
    this.state = {
      finished: props.blockProps.finished,
      imageURL: props.blockProps.imageURL,
      editorState: newEditorState,
    };
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
    this.props.blockProps.editingImage(true);
    this.props.onDrop(files);
    // files is a FileList(https://developer.mozilla.org/en/docs/Web/API/FileList) Object
    // and with each file, we attached two functions to handle upload progress and result
    // file.request => return super-agent uploading file request
    // file.uploadPromise => return a Promise to handle uploading status(what you can do when upload failed)
    // `react-qiniu` using bluebird, check bluebird API https://github.com/petkaantonov/bluebird/blob/master/API.md
    // see more example in example/app.js
    this.props.blockProps.editingImage(false);
  }

  myKeyBindingFn(e) {
    if (e.keyCode === 13 /* `回车` key */ && !hasCommandModifier(e)) {
      return 'myeditor-save';
    }
    return getDefaultKeyBinding(e);
  }

  _handleKeyCommand(command) {
    const { editorState } = this.state;
    if (command === 'myeditor-save') {
      return 'handled';
    }
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      this.onChange(newState);
      return true;
    }
    return false;
  }

  createMoreImages(files) {
    this.props.blockProps.createMoreImages(files);
  }

  updateEntityData(size, name, imageURL) {
    const entityKey = this.props.block.getEntityAt(0);
    const contentState = this.state.editorState.getCurrentContent();
    contentState.mergeEntityData(entityKey, { original_size: size, name, imageURL, finished: true });
    this.setState(
      {
        finished: true,
        imageURL
      }
    );
  }

  render() {
    const contentState = this.state.editorState.getCurrentContent();
    const file = contentState.getEntity(this.props.block.getEntityAt(0)).data.file;
    const styles = require('./EditorImage.scss');
    let imageText = '点击或将文件拖拽到此区域上传';
    if (navigator.userAgent.indexOf('Mobile') !== -1) imageText = '点击此区域上传照片';
    require('./placeholder.css');
    const addCaptionView = this.state.finished ? (
      <div onFocus={this._startEdit} onBlur={this._finishEdit} className="RichEditor_editor">
        <div className={styles.blank} />
        <div className={styles.captionBase}>
          <Editor
            editorState={this.state.editorState}
            onChange={this.onChange}
            placeholder="点击添加说明"
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.myKeyBindingFn}
            ref={(ref) => { this.captionEditor = ref; }}
            className="RichEditor-editor"
          />
        </div>
        <div className={styles.blank} />
      </div>
    ) : null;
    return (
      <div className={styles.elementBase}>
        <Qiniu
          onDrop={(files) => this.onDrop(files)}
          size={150} token={this.props.token}
          uploadKey={this.props.uploadKey}
          onUpload={this.onUpload}
          className={styles.base}
          createMoreImages={(files) => this.createMoreImages(files)}
          file={file}
          type="editorImage"
          updateEntityData={(size, name, imageURL) => this.updateEntityData(size, name, imageURL)}
          finished={this.state.finished}
          imageURL={this.state.imageURL}
        >
          <div className={styles.base}>
            <div className={styles.info}>{imageText}</div>
            <div className={styles.tip}>支持单个或批量上传</div>
          </div>
        </Qiniu>
        {addCaptionView}
      </div>
    );
  }
}
