import React, { Component, PropTypes } from 'react';
import classnames from 'classnames';
import Icon from '../../../../components/BasicComponents/Icon/Icon';


export default class ToolbarIcon extends Component {
  static propTypes = {
    label: PropTypes.string,
    icon: PropTypes.string,
    active: PropTypes.bool,
    onToggle: PropTypes.func,
    style: PropTypes.string,
  }
  render() {
    const { label, icon, onToggle, style, active } = this.props;
    return (
      <li
        className={'toolbar-icon ' + classnames({ active })}
        onMouseDown={(e) => {
          e.preventDefault();
          onToggle(style);
        }}
      >
        {label || <Icon type={icon} width={20} height={20} />}
      </li>
    );
  }
}
