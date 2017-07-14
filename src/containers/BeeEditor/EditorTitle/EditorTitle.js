/**
 * Created by Jwill on 16/9/23.
 */
import React, { Component, PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { setTitle } from 'redux/modules/editor';

import {
  Editor,
  EditorState,
  RichUtils,
  getDefaultKeyBinding,
  KeyBindingUtil,
  convertToRaw,
  convertFromRaw,
} from 'draft-js';
import { Avatar } from '../../../components/BasicComponents';
import { convertCurrentContentToElementsArray, convertTitleToRawDraftContent } from '../../../helpers/EditorHelpers';
const { hasCommandModifier } = KeyBindingUtil;

@connect(
  state => ({
    user: state.auth.user,
  }),
  dispatch => bindActionCreators({ setTitle }, dispatch)
)

export default class EditorTitle extends Component {

  static propTypes = {
    user: PropTypes.object,
    setTitle: PropTypes.func,
    story: PropTypes.object,
    editorConfigure: PropTypes.object,
  }

  constructor(props) {
    super(props);
    let newEditorState = EditorState.createEmpty();

    if (this.props.story) {
      const blocks = convertFromRaw(convertTitleToRawDraftContent(this.props.story.title));
      newEditorState = EditorState.createWithContent(blocks);
    }
    this.state = {
      editorState: newEditorState,
    };
    this.onChange = (editorState) => {
      this.setState({ editorState });
      const content = editorState.getCurrentContent();
      const elements = convertCurrentContentToElementsArray(convertToRaw(content));
      if (elements.length > 0) {
        this.props.setTitle(elements[0].media.plain_text);
      } else {
        this.props.setTitle(null);
      }
    };
    this.handleKeyCommand = this._handleKeyCommand.bind(this);
  }

  myKeyBindingFn(e) {
    if (e.keyCode === 13 /* `S` key */ && !hasCommandModifier(e)) {
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

  render() {
    const { editorState } = this.state;
    const { user } = this.props;
    const styles = require('./EditorTitle.scss');
    const myDate = new Date();
    const spanStyle = {
      display: 'block',
      color: '#c2c6cc',
      flex: 'none',
      fontSize: '13px',
      paddingTop: '3px',
      paddingLeft: '10px',
      float: 'left',
    };
    if (!user) return null;
    return (
      <div className={styles.title}>
        {this.props.editorConfigure.show_title &&
          <Editor
            editorState={editorState}
            onChange={this.onChange}
            placeholder="标题..."
            handleKeyCommand={this.handleKeyCommand}
            keyBindingFn={this.myKeyBindingFn}
          />
        }
        {this.props.editorConfigure.show_author &&
          <div>
            <Avatar user={user} size={24} type="editor" />
            <span style={spanStyle}>{user.username || '未登录'}</span>
            <span className={styles.bullet} >•</span>
            {/* <span className={styles.bullet}>·</span> */}
            <span className={styles.time}>{myDate.toLocaleDateString()}</span>
          </div>
        }
        {/* <Avatar user={this.props.user} type="circle" size={21} />*/}
        {/* <span >{this.props.user.username}</span>*/}
      </div>
    );
  }
}
