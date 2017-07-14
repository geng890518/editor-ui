/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component } from 'react';

import { Icon } from '../../../../../../components/BasicComponents';
// import insertDataBlock from '../insertDataBlock';


export default class MapButton extends Component {
  // constructor(props) {
  //   super(props);
  //   this.onClick = ::this.onClick;
  // }

  render() {
    return (
      <button className={this.props.className} type="button">
        <Icon className="sidemenu__button__icon" width={24} height={24} type="mapMenu" />
      </button>
    );
  }
}
