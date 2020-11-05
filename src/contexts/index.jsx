import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import { AppAudioContextProvider } from './AppAudioContext/AppAudioContext';
import { ToastContextProvider } from './ToastContext';

const AppContextProvider = ({ children }) => {
  return (
    <Router>
      <ToastContextProvider>
        <AppAudioContextProvider>{children}</AppAudioContextProvider>
      </ToastContextProvider>
    </Router>
  );
};

AppContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};

export { AppContextProvider };
export * from './AppAudioContext/AppAudioContext';
