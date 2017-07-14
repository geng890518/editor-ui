import React, { Component, PropTypes } from 'react';

export default class BeeGradient extends Component {
  static propTypes = {
    type: PropTypes.oneOf(['top', 'bottom']),
    height: PropTypes.string,
    theStyle: PropTypes.string,
  }

  render() {
    const style = {
      pointerEvents: 'none',
      backgroundAttachment: 'scroll',
      backgroundClip: 'content-box',
      backgroundColor: 'rgba(0, 0, 0, 0)',
      backgroundImage: (this.props.type === 'top' ? 'linear-gradient(to top, transparent 0%, rgba(0, 0, 0, 0.34902) 100%)' : 'linear-gradient(transparent 0%, rgba(0, 0, 0, 0.34902) 100%)'),
      backgroundOrigin: 'content-box',
      backgroundSize: 'auto',
      backgroundPosition: 'center',
      position: 'absolute',
      right: '0px',
      bottom: '0px',
      width: '100%',
      height: (this.props.height === undefined ? 'inherit' : this.props.height),
      top: (this.props.height === undefined ? '0px' : null),
    };

    return (
      <div style={style} className={this.props.className} />
    );
  }
}
