import React, { Component, PropTypes } from 'react';
import { Icon } from '../../BasicComponents';

export default class Tag extends Component {
  static propTypes = {
    closable: PropTypes.bool,
    onClose: PropTypes.func,
    afterClose: PropTypes.func,
    color: PropTypes.string,
  }

  render() {
    const styles = require('./Tag.scss');
    const closable = this.props.closable ? (
      <div className={styles.cross} onClick={() => this.props.onClose()}>
        <Icon type="cross" width={16} height={16} />
      </div>
    ) : null;
    return (
      <div className={styles.tag}>
        {this.props.children}
        {closable}
      </div>
    );
  }
}
