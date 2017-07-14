import React, { Component, PropTypes } from 'react';
import { Entity } from 'draft-js';

export default class EditorImage extends Component {

  static propTypes = {
    block: PropTypes.object.isRequired,
  }

  render() {
    // const styles = require('./EditorImage.scss');
    const imgContent = Entity.get(this.props.block.getEntityAt(0)).data.src;
    return (
      <img src={imgContent} role="presentation" />
    );
  }
}
