import React, { Component, PropTypes } from 'react';

export default class Spin extends Component {
  static propTypes = {
    children: PropTypes.node,
    direction: PropTypes.oneOf(['counterclockwise', 'clockwise']),
    speed: PropTypes.number // milliseconds, time it takes to make 1 full rotation
  }

  static defaultProps = {
    direction: 'clockwise',
    speed: 1000
  }

  componentDidMount() {
    const el = this.node;
    const speed = this.props.speed;
    const spinDirection = this.props.direction === 'clockwise' ? -1 : 1;
    let rotation = 0;

    setInterval(() => {
      el.style.transform = 'rotate(' + (rotation * spinDirection) + 'deg)';

      if (rotation < 360) {
        rotation += 1;
      } else {
        rotation = 0;
      }
    }, speed / 360);
  }

  render() {
    return (
      <div className="mx-spin" ref={(c) => { this.node = c; }} style={{ display: 'inline-block' }}>
        {this.props.children}
      </div>
    );
  }
}
