import React, { Component, PropTypes } from 'react';

export default class EditorText extends Component {

  static propTypes = {
    textModel: PropTypes.object.isRequired,
  }

  render() {
    const styles = require('./EditorText.scss');
    const { textModel } = this.props;

    return (
      <div>
        EditorText
      </div>
    );
  }
}
