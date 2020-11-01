export const initialState = {
  tracks: [],
};

// Action Types
export const ADD_TRACK = 'trackContext/ADD_TRACK';

// Actions
export const actions = {
  addTrack: (track) => ({
    type: ADD_TRACK,
    payload: track,
  }),
};

// Reducers
const tracks = (state = [], action) => {
  switch (action.type) {
    case ADD_TRACK:
      return [...state, action.payload];
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
