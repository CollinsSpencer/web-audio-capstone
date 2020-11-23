export const initialState = {
  tracks: {},
};

// Action Types
export const ADD_TRACK = 'appAudioContext/ADD_TRACK';
export const UPDATE_TRACK_OFFSET = 'appAudioContext/UPDATE_TRACK_OFFSET';
export const DELETE_TRACK = 'appAudioContext/DELETE_TRACK';

// Actions
export const actions = {
  addTrack: (track) => ({
    type: ADD_TRACK,
    payload: track,
  }),
  updateTrackOffset: (trackId, offset) => ({
    type: UPDATE_TRACK_OFFSET,
    payload: { trackId, offset },
  }),
  deleteTrack: (trackId) => ({
    type: DELETE_TRACK,
    payload: { trackId },
  }),
};

// Reducers
const tracks = (state = {}, action) => {
  switch (action.type) {
    case ADD_TRACK:
      return { ...state, [action.payload.trackId]: action.payload };
    case UPDATE_TRACK_OFFSET: {
      const track = state[action.payload.trackId];
      return {
        ...state,
        [action.payload.trackId]: { ...track, offset: action.payload.offset },
      };
    }
    case DELETE_TRACK: {
      const { [action.payload.trackId]: value, ...newState } = state;
      return newState;
    }
    default:
      return state;
  }
};

function combineReducers(slices) {
  return (state, action) =>
    Object.keys(slices).reduce(
      (acc, prop) => ({
        ...acc,
        [prop]: slices[prop](acc[prop], action),
      }),
      state,
    );
}

export const reducer = combineReducers({
  tracks,
});
