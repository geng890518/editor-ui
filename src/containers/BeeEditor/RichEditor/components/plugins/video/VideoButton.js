/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component } from 'react';

import { Icon } from '../../../../../../components/BasicComponents';

export default class VideoButton extends Component {
  render() {
    return (
      <button className={this.props.className} type="button">
        <Icon className="sidemenu__button__icon" width={24} height={24} type="videoMenu" />
      </button>
    );
  }
}
