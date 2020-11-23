import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';

import { AppAudioContextProvider } from './AppAudioContext/AppAudioContext';
import { ToastContextProvider } from './ToastContext';
import ErrorFallback from '../components/ErrorFallback';

const AppContextProvider = ({ children }) => {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Router>
        <ToastContextProvider>
          <AppAudioContextProvider>{children}</AppAudioContextProvider>
        </ToastContextProvider>
      </Router>
    </ErrorBoundary>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export default AppContextProvider;
