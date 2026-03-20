const initialState = {
  audioLocked: false,
  pendingNavigation: null,
};

export default function ui(state = initialState, action) {
  switch (action.type) {
    case 'SET_AUDIO_LOCKED':
      return {
        ...state,
        audioLocked: Boolean(action.payload),
      };
    case 'SET_PENDING_NAVIGATION':
      return {
        ...state,
        pendingNavigation: action.payload,
      };
    case 'CLEAR_PENDING_NAVIGATION':
      return {
        ...state,
        pendingNavigation: null,
      };
    default:
      return state;
  }
}
