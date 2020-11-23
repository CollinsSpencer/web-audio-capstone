import React from 'react';
import routes from './pages';
import AppContextProvider from './contexts';

const App = () => {
  return <AppContextProvider>{routes}</AppContextProvider>;
};

export default App;
