/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component } from 'react';

import { Icon } from '../../../../../../components/BasicComponents';
// import insertDataBlock from '../insertDataBlock';


export default class SeparatorButton extends Component {
  // constructor(props) {
  //   super(props);
  //   this.onClick = ::this.onClick;
  // }
  onMouseOver = () => {
    this.setState(
      {
        style: 'enter'
      }
    );
  }
  onMouseLeave = () => {
    this.setState(
      {
        style: 'leave'
      }
    );
  }

  render() {
    return (
      <div onMouseOver={this.onMouseOver}>
        <button className={this.props.className} type="button">
          <Icon className="sidemenu__button__icon" width={24} height={24} type="separatorMenu" />
        </button>
        <div>嵌入分隔符</div>
      </div>
    );
  }
}
