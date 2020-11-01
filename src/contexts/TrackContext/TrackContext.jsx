import React, { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { actions, initialState, reducer } from './reducer';

const defaultContext = {
  tracks: [],
  addTrack: () => null,
};
const TrackContext = createContext(defaultContext);

const getContextValues = (state, dispatch) => ({
  tracks: state.tracks,
  addTrack: (track) => dispatch(actions.addTrack(track)),
});

export const useTrackContext = () => useContext(TrackContext);
export const TrackContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);
  const contextValue = useMemo(() => getContextValues(state, dispatch), [
    state,
    dispatch,
  ]);

  return (
    <TrackContext.Provider value={contextValue}>
      {children}
    </TrackContext.Provider>
  );
};

TrackContextProvider.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
};
