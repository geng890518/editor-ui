/**
 * Created by Jwill on 16/9/26.
 */

import React, { Component, PropTypes } from 'react';

export default class CollectionsList extends Component {

  static propTypes = {
    collection: PropTypes.object.isRequired,
    handleClick: PropTypes.func.isRequired,
  }

  handleClick() {
    this.props.handleClick(this.props.collection);
  }

  render() {
    const collection = this.props.collection;
    // const liteCollection = {}
    // console.log(collection.collection_name);

    return (
      <div>
        <a onClick={() => this.handleClick()}>{collection.collection_name}</a>
      </div>
    );
  }
}
