import React, { Component, PropTypes } from 'react';

export default class Icon extends Component {
  static propTypes = {
    width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    style: PropTypes.object,
    type: PropTypes.string,
  }

  static defaultProps = {
    width: 36,
    height: 36,
    type: 'play',
  }

  _renderSvg() {
    switch (this.props.type) {
      case 'play':
        return (
          <path fill="#fff" d="M 12,26 18.5,22 18.5,14 12,10 z M 18.5,22 25,18 25,18 18.5,14 z" id="ytp-svg-37" />
        );
      case 'pause':
        return (
          <path fill="#fff" d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z" id="ytp-svg-38" />
        );
      case 'volume':
        return (
          <path fill="#fff" d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z M19,14 L19,22 C20.48,21.32 21.5,19.77 21.5,18 C21.5,16.26 20.48,14.74 19,14 Z M19,11.29 C21.89,12.15 24,14.83 24,18 C24,21.17 21.89,23.85 19,24.71 L19,26.77 C23.01,25.86 26,22.28 26,18 C26,13.72 23.01,10.14 19,9.23 L19,11.29 Z" id="ytp-svg-13" />
        );
      default:
        return null;
    }
  }

  viewBox() {
    switch (this.props.type) {
      case 'play':
      case 'pause':
      case 'mute':
        return '0 0 36 36';
      default:
        return '0 0 36 36';
    }
  }

  styles() {
    return {
      component: Object.assign({
        width: this.props.width,
        height: this.props.height,
        display: 'inline-block',
        // verticalAlign: 'middle',
        padding: 0,
        margin: 0
      }, this.props.style)
    };
  }

  render() {
    const styles = this.styles();
    return (
      <svg
        {...this.props}
        className="mx-icon"
        preserveAspectRatio="xMidYMid meet"
        style={styles.component}
        viewBox={this.viewBox()}
      >
        {this.props.type !== 'fullScreen' && this.props.type !== 'mute' && this._renderSvg()}

        { this.props.type === 'mute' && <path fill="#fff" d="M8,21 L12,21 L17,26 L17,10 L12,15 L8,15 L8,21 Z" id="ytp-svg-13" /> }
        { this.props.type === 'mute' && <path fill="#fff" d="M 26.11,15.73 24.85,14.5 22.52,16.76 20.20,14.5 18.94,15.73 21.26,18 18.94,20.26 20.20,21.5 22.52,19.23 24.85,21.5 26.11,20.26 23.79,18 l 2.32,-2.26 0,0 z" id="ytp-svg-14" /> }

        { this.props.type === 'fullScreen' && <path fill="#fff" d="m 10,16 2,0 0,-4 4,0 0,-2 L 10,10 l 0,6 0,0 z" id="ytp-svg-21" /> }
        { this.props.type === 'fullScreen' && <path fill="#fff" d="m 20,10 0,2 4,0 0,4 2,0 L 26,10 l -6,0 0,0 z" id="ytp-svg-22" /> }
        { this.props.type === 'fullScreen' && <path fill="#fff" d="m 24,24 -4,0 0,2 L 26,26 l 0,-6 -2,0 0,4 0,0 z" id="ytp-svg-23" /> }
        { this.props.type === 'fullScreen' && <path fill="#fff" d="M 12,20 10,20 10,26 l 6,0 0,-2 -4,0 0,-4 0,0 z" id="ytp-svg-24" /> }
      </svg>
    );
  }
}
