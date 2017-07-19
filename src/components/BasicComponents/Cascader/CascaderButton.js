/**
 * Created by Jwill on 16/10/12.
 */
import { Cascader } from 'antd';
import React, { Component, PropTypes } from 'react';

export default class CascaderButton extends Component {
  static propTypes = {
    allCollections: PropTypes.array,
    color: PropTypes.string,
    addTag: PropTypes.func,
    collections: PropTypes.array
  }
  constructor(props) {
    super(props);
    this.handleClick = (value, option) => this._handleClick(value, option);
  }

  _handleClick(value, option) {
    if (this.props.collections.length === 3) {
      window.alert('不能选择超过三个标签');
      return;
    }
    const data = {
      id: option[0].info.id,
      category: 20,
      type: 50
    };
    this.props.addTag(data);
  }
  render() {
    require('./iconStyle.css');
    require('./progress.css');
    // const styles = require('./cascader.scss');
    const collections = this.props.allCollections;
    const option = collections.map((collection) => ({
      value: collection.id,
      label: collection.collection_name,
      info: collection
    }));

    return (
      <Cascader
        options={option}
        expandTrigger="hover"
        onChange={this.handleClick}
        placeholder="投稿至..."
      >
        {this.props.children}
      </Cascader>
    );
  }
}
