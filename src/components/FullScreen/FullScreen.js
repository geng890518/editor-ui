import React, { Component, PropTypes } from 'react';

export default class FullScreen extends Component {
  static propTypes = {
    color: PropTypes.string.isRequired,
    noNavigationBar: PropTypes.string,
    fmap: PropTypes.bool,
    nopaddingButtom: PropTypes.bool,
  }

  render() {
    let styles = {
      backgroundColor: this.props.color,
      width: '100%',
      height: '100%'
    };
    if (this.props.noNavigationBar) {
      styles = {
        backgroundColor: this.props.color,
        width: '100%',
        position: 'absolute',
        top: '0px',
        paddingBottom: '15px'
      };
      if (this.props.nopaddingButtom) {
        styles = {
          backgroundColor: this.props.color,
          width: '100%',
          position: 'absolute',
          top: '0px'
        };
      }
    }
    if (this.props.fmap) {
      styles = {
        backgroundColor: this.props.color,
        width: '100%',
        height: '100%',
        marginBottom: '75px'
      };
    }
    return (
      <div style={styles}>
        {this.props.children}
      </div>
    );
  }
}
