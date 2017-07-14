/**
 * Created by Jwill on 16/9/26.
 */
import React, { Component, PropTypes } from 'react';
import { Tag } from '../../../../../components/BasicComponents';

export default class TagList extends Component {

  static propTypes = {
    tag: PropTypes.object.isRequired,
    id: PropTypes.number.isRequired,
    handleClick: PropTypes.func.isRequired,
    index: PropTypes.number,
  }

  onClose() {
    this.props.handleClick(this.props.tag);
  }

  render() {
    const tag = this.props.tag;
    return (
      <Tag closable color="blue" onClose={() => this.onClose()}>{tag.collectionName}</Tag>
    );
  }
}
