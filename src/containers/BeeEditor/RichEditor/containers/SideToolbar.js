/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import ToolbarItem from '../components/toolbar/ToolbarItem';
import { getSelectionCoords } from '../utils/selection';

const BLOCK_TYPES = [
  { icon: 'header', style: 'header-one' },
  { icon: 'quot', style: 'blockquote' },
  { icon: 'left', style: 'left' },
  { icon: 'center', style: 'center' },
  { icon: 'right', style: 'right' },
];

export default class Toolbar extends Component {
  static propTypes = {
    editorState: PropTypes.object,
    editorConfigure: PropTypes.object,
    onToggle: PropTypes.func,
    toolbar: PropTypes.object,
  }

  constructor(props) {
    super(props);
    this.state = {
      show: false,
      position: {
        position: 'relative',
        bottom: false,
        left: null
      }
    };
  }

  componentDidMount() {
    if (!this.props.editorState.getSelection().isCollapsed()) {
      this.clockControl = setInterval(() => this.setBarPosition(), 300);
    }
  }

  componentWillReceiveProps() {
    if (!this.props.editorState.getSelection().isCollapsed()) {
      this.setBarPosition();
    } else {
      this.setState({
        show: false
      });
    }
  }

  componentWillUnmount() {
    clearInterval(this.clockControl);
  }


  setBarPosition() {
    const selectionCoords = getSelectionCoords();
    if (!selectionCoords) {
      return null;
    }

    if (this.state.position ||
        this.state.position.bottom !== selectionCoords.offsetBottom ||
        this.state.position.left !== selectionCoords.offsetLeft) {
      this.setState({
        show: true,
        position: {
          position: 'relative',
          bottom: selectionCoords.offsetBottom,
          left: selectionCoords.offsetLeft
        }
      });
    }
    return null;
  }
  renderToolList() {
    require('../../toolbar.css');
    const selection = this.props.editorState.getSelection();
    const blockType = this.props.editorState.getCurrentContent()
                                 .getBlockForKey(selection.getStartKey())
                                 .getType();
    /**
     *  根据url中的配置来设置SideToolbar的样式
     */
    let blockTypes = BLOCK_TYPES;
    if (!this.props.editorConfigure.text_style || !this.props.editorConfigure.text_alignment) {
      blockTypes = BLOCK_TYPES.filter(item => {
        let allowStyles = [];
        if (this.props.editorConfigure.text_style) allowStyles = ['left', 'center', 'right'];
        if (this.props.editorConfigure.text_alignment) allowStyles = ['header-one', 'blockquote'];
        return allowStyles.includes(item.style);
      });
    }
    return (
      <ul className="toolbar__list" onMouseDown={(x) => { x.preventDefault(); }}>
        {blockTypes.map(type =>
          <ToolbarItem
            key={type.label || type.icon}
            active={type.style === blockType}
            label={type.label}
            icon={type.icon}
            onToggle={this.props.onToggle}
            style={type.style}
          />)}
      </ul>
    );
  }
  render() {
    const toolbarClass = classNames('toolbar', {
      'toolbar--open': this.state.show
    });
    require('../../toolbar.css');
    return (
      <div
        className={toolbarClass}
        style={this.state.position}
      >
        <div style={{ position: 'absolute' }}>
          <div className="toolbar__wrapper">
            {
              this.renderToolList()
            }
            <p className="toolbar__error-msg">{this.state.error}</p>
            <span className="toolbar__arrow" />
          </div>
        </div>
      </div>
    );
  }
}
