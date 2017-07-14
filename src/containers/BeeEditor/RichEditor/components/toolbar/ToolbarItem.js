/*
 * Copyright (c) 2016, Globo.com (https://github.com/globocom)
 *
 * License: MIT
 */

import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import Icon from '../../../../../components/BasicComponents/Icon/Icon';

export default class ToolbarItem extends Component {
  static propTypes = {
    label: PropTypes.string,
    icon: PropTypes.string,
    active: PropTypes.bool,
    onToggle: PropTypes.func,
    style: PropTypes.string,
  }
  toggleAction(action) {
    if (action.toggle) {
      action.toggle(!action.active);
    }
  }

  render() {
    const { label, icon, onToggle, style, active } = this.props;
    const className = classNames('toolbar__item', {
      'toolbar__item--active': { active }
    });

    return (
      <li
        className={className}
        onMouseDown={(e) => {
          e.preventDefault();
          onToggle(style);
        }}
      >
        <button
          type="button"
          className="toolbar__button"
        >
          {label || <Icon type={icon} width={20} height={20} />}
        </button>
      </li>
    );
  }
}
