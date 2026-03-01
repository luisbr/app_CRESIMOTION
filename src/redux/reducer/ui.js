const initialState = {
  audioLocked: false,
};

export default function ui(state = initialState, action) {
  switch (action.type) {
    case 'SET_AUDIO_LOCKED':
      return {
        ...state,
        audioLocked: Boolean(action.payload),
      };
    default:
      return state;
  }
}
