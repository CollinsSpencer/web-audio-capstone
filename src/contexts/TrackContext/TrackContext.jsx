import React, { createContext, useContext, useMemo, useReducer } from 'react';
import PropTypes from 'prop-types';
import { actions, initialState, reducer } from './reducer';
import { useAppAudioContext } from '../AppAudioContext';

const defaultContext = {
  tracks: [],
  addTrack: () => null,
};
const TrackContext = createContext(defaultContext);

export const useTrackContext = () => useContext(TrackContext);
export const TrackContextProvider = ({ children }) => {
  const { addAudioSource } = useAppAudioContext();
  const [state, dispatch] = useReducer(reducer, initialState);

  const contextValue = useMemo(
    () => ({
      tracks: state.tracks,
      addTrack: async (track) => {
        console.log(track);
        addAudioSource(track.audioBuffer);
        dispatch(actions.addTrack(track));
      },
    }),
    [state, dispatch, addAudioSource],
  );

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
