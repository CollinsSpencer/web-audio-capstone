import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import Analysis from './Analysis';
import Record from './Record';

const createRoute = ({
  path,
  component,
  exact = true,
  RouteComponent = Route,
}) => (
  <RouteComponent path={path} component={component} key={path} exact={exact} />
);

const routes = [
  <Route exact path="/" key="home">
    <Redirect to="/analysis" />
  </Route>,
  createRoute({
    path: '/record',
    component: Record,
  }),
  createRoute({
    path: '/analysis',
    component: Analysis,
  }),
];

export default routes;
