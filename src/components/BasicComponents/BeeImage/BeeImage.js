import React, { Component, PropTypes } from 'react';

export default class BeeImage extends Component {
  static propTypes = {
    src: PropTypes.string,
    href: PropTypes.string,
    onClick: PropTypes.func,
    onMouseOver: PropTypes.func,
    onMouseLeave: PropTypes.func,
    target: PropTypes.string,
  }
  constructor(props) {
    super(props);
    this.state = {
      jump: true,
      touchmove: false,
    };
  }

  mouseDown = (index) => {
    if (!this.state.touchmove && this.state.jump) parent.location.href = index;
  }

  touchmove = () => {
    // window.alert(e);
    // e.preventDefault();
    this.setState({
      jump: false,
      touchmove: true,
    });
  }

  touchstart = () => {
    this.setState({
      jump: true,
      touchmove: false,
    });
  }
  render() {
    const style = {
      backgroundImage: 'url(' + this.props.src + ')',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: 'inherit',
      display: 'block',
    };
    const link = (this.props.target === '_blank') ? (
      <a onTouchStart={() => this.touchstart()} onTouchMove={(e) => this.touchmove(e)} onTouchEnd={() => this.mouseDown('http://dev.beegree.cc' + this.props.href)} style={style} onMouseOver={this.props.onMouseOver} onMouseLeave={this.props.onMouseLeave} href={'http://dev.beegree.cc' + this.props.href} target="_blank" rel="noopener noreferrer">
        {this.props.children}
      </a>
    ) : (<a style={style} onMouseOver={this.props.onMouseOver} onMouseLeave={this.props.onMouseLeave} href={this.props.href} >
      {this.props.children}
    </a>);

    const element = this.props.href === undefined ? (
      <div style={style} onMouseOver={this.props.onMouseOver} onMouseLeave={this.props.onMouseLeave} onClick={this.props.onClick} >
        {this.props.children}
      </div>
    ) : link;
    return element;
  }
}
