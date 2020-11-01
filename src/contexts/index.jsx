import React from 'react';
import PropTypes from 'prop-types';
import { BrowserRouter as Router } from 'react-router-dom';

import { AppAudioContextProvider } from './AppAudioContext';
import { ToastContextProvider } from './ToastContext';
import { TrackContextProvider } from './TrackContext';

const AppContextProvider = ({ children }) => {
  return (
    <Router>
      <ToastContextProvider>
        <TrackContextProvider>
          <AppAudioContextProvider>{children}</AppAudioContextProvider>
        </TrackContextProvider>
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
export * from './AppAudioContext';
export * from './TrackContext';
