/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component, PropTypes } from 'react';
// import ReactDOM from 'react-dom';
import classNames from 'classnames';
// import 'setimmediate';
import { Icon } from '../../../../components/BasicComponents';

class BlockStyles extends Component {
  static propTypes = {
    plugins: PropTypes.array.isRequired,
    editorState: PropTypes.object,
    onChange: PropTypes.func,
    open: PropTypes.bool,
    onUploadImage: PropTypes.func,
    onUploadSeparator: PropTypes.func,
    onUploadMap: PropTypes.func,
    onUploadVideo: PropTypes.func
  }

  render() {
    require('../../toolbar.css');
    const className = classNames('sidemenu__items', {
      'sidemenu__items--open': this.props.open
    });
    const mappedElements = this.props.plugins.map((item) => {
      let clickFn;
      if (item.type === 'image') {
        clickFn = this.props.onUploadImage;
      } else if (item.type === 'separator') {
        clickFn = this.props.onUploadSeparator;
      } else if (item.type === 'map') {
        clickFn = this.props.onUploadMap;
      } else if (item.type === 'video') {
        clickFn = this.props.onUploadVideo;
      }
      const Button = item.buttonComponent;
      return (
        <li
          key={item.type}
          className="sidemenu__item"
          style={{ background: 'none' }}
          onMouseDown={(e) => {
            e.preventDefault();
            clickFn();
          }}
        >
          <Button
            className="sidemenu__button"
          />
        </li>
      );
    });
    return (
      <ul className={className}>
        {mappedElements}
      </ul>
    );
  }
}

export class ToggleButton extends Component {
  static propTypes = {
    // plugins: PropTypes.array.isRequired,
    editorState: PropTypes.object,
    onChange: PropTypes.func,
    open: PropTypes.bool,
    toggle: PropTypes.func
  }

  render() {
    require('../../toolbar.css');
    const className = classNames('sidemenu__button', {
      'sidemenu__button--open': this.props.open
    });
    return (
      <button type="button" className={className} onMouseDown={(x) => { x.preventDefault(); }} onClick={this.props.toggle}>
        <div className="sidemenu__button__icon">
          <Icon width={24} height={24} type="crossMenu" />
        </div>
      </button>
    );
  }
}

export class SideMenu extends Component {
  static propTypes = {
    plugins: PropTypes.array.isRequired,
    editorState: PropTypes.object,
    onChange: PropTypes.func,
    onUploadImage: PropTypes.func,
    onUploadSeparator: PropTypes.func,
    onUploadMap: PropTypes.func,
    onUploadVideo: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = {
      open: false
    };
    // this.toggle = ::this.toggle;
    this.onChange = ::this.onChange;
    this.toggle = () => this._toggle();
  }

  onChange(editorState) {
    this.onChange(editorState);
  }

  _toggle() {
    this.setState({
      open: !this.state.open
    });
  }

  render() {
    require('../../toolbar.css');
    return (
      <li className="sidemenu" style={{ background: 'none' }}>
        <ToggleButton
          toggle={this.toggle}
          open={this.state.open}
        />

        <BlockStyles
          editorState={this.props.editorState}
          plugins={this.props.plugins}
          open={this.state.open}
          onChange={this.onChange}
          onUploadImage={this.props.onUploadImage}
          onUploadSeparator={this.props.onUploadSeparator}
          onUploadMap={this.props.onUploadMap}
          onUploadVideo={this.props.onUploadVideo}
        />
      </li>
    );
  }
}


export default class SideBar extends Component {
  static propTypes = {
    plugins: PropTypes.func.isRequired,
    editorState: PropTypes.object,
    onChange: PropTypes.func,
    top: PropTypes.number,
    onUploadImage: PropTypes.func,
    onUploadSeparator: PropTypes.func,
    onUploadMap: PropTypes.func,
    onUploadVideo: PropTypes.func,
  }

  constructor(props) {
    super(props);
    this.state = { top: 0 };
    this.onChange = ::this.onChange;
    this.getValidSidebarPlugins = () => this._getValidSidebarPlugins();
  }

  componentDidUpdate() {
    if (this.updatingPosition) {
      clearImmediate(this.updatingPosition);
    }
    this.updatingPosition = null;
    this.updatingPosition = () => this.setBarPosition();
  }

  onChange(editorState) {
    this.onChange(editorState);
  }

  _getValidSidebarPlugins() {
    const plugins = [];
    for (const plugin of this.props.plugins()) {
      if (plugin.buttonComponent && typeof plugin.buttonComponent === 'function') {
        plugins.push(plugin);
      }
    }
    return plugins;
  }

  render() {
    require('../../toolbar.css');
    return (
      <div id="sidebarContainer" className="sidebar" style={{ position: 'relative', top: this.props.top }}>
        <div className="sidebar__menu">
          <ul className="sidebar__sidemenu_wrapper">
            <SideMenu
              editorState={this.props.editorState}
              onChange={this.onChange}
              plugins={this.getValidSidebarPlugins()}
              onUploadImage={this.props.onUploadImage}
              onUploadSeparator={this.props.onUploadSeparator}
              onUploadMap={this.props.onUploadMap}
              onUploadVideo={this.props.onUploadVideo}
            />
          </ul>
        </div>
      </div>
    );
  }
}
