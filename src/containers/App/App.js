import React, { Component, PropTypes } from 'react';
// import cookie from 'react-cookie';
import { asyncConnect } from 'redux-async-connect';
import Helmet from 'react-helmet';
import config from '../../config';
import { editorConfig, getCollections } from '../../redux/modules/editor';
import { loadBasicParamsJson } from '../../redux/modules/qiniu';
import { loadAuthByToken } from '../../redux/modules/auth';
@asyncConnect([{
  deferred: true,
  promise: ({ store: { dispatch }, location }) => {
    const promises = [];
    if (Object.prototype.hasOwnProperty.call(location.query, 'c')) {
      promises.push(dispatch(editorConfig(location.query.c)));
    }
    promises.push(dispatch(loadAuthByToken()));
    promises.push(dispatch(getCollections()));
    return Promise.all(promises);
  }
}])

export default class App extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
  }
  componentWillMount() {
    this.props.dispatch(loadBasicParamsJson());
  }

  render() {
    const styles = require('./App.scss');
    return (
      <div className={styles.app}>
        <Helmet {...config.app.head} />
        <div className={styles.appContent}>
          {this.props.children}
        </div>
      </div>
    );
  }
}
