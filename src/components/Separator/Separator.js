import React, { Component } from 'react';

export default class Separator extends Component {

  render() {
    const styles = require('./Separator.scss');
    return (
      <div className={styles.container} />
    );
  }
}
