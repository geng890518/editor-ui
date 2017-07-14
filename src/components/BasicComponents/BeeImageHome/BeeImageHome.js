import React, { Component, PropTypes } from 'react';

export default class BeeImage extends Component {
  static propTypes = {
    src: PropTypes.string,
    href: PropTypes.string,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
  }

  render() {
    const styles = require('./BeeImageHome.scss');
    const style = {
      backgroundImage: 'url(' + this.props.src + ')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      // height: '400px',
      display: 'block',
    };

    const element = this.props.href === undefined ? (
      <div style={style} className={styles.beeImage} onMouseOver={this.props.onMouseOver} onMouseLeave={this.props.onMouseLeave} onClick={this.props.onClick} >
        {this.props.children}
      </div>
    ) : (
      <a style={style} onMouseOver={this.props.onMouseOver} onMouseLeave={this.props.onMouseLeave} href={this.props.href}>
        {this.props.children}
      </a>
    );

    return element;
  }
}
