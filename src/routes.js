import React from 'react';
import { IndexRoute, Route } from 'react-router';
// import { isLoaded as isAuthLoaded, loadAuthCookie } from 'redux/modules/auth';
import {
    App,
    BeeEditor,
    NotFound,
  } from 'containers';

export default () => (
  <Route breadcrumbName="首页" path="/" component={App}>
    { /* Home (main) route */ }
    <IndexRoute component={BeeEditor} />
    <Route path="*" component={NotFound} status={404} />
  </Route>
  );
