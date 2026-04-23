import AsyncStorage from '@react-native-async-storage/async-storage';

const PROFILE_PREFS_KEY = 'USER_PROFILE_PREFERENCES';

export const setProfilePreferences = (preferences) => {
  return async (dispatch) => {
    dispatch({
      type: 'SET_PROFILE_PREFERENCES',
      payload: preferences,
    });
    
    // Persist to AsyncStorage
    try {
      await AsyncStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.log('Error saving profile preferences to AsyncStorage', e);
    }
  };
};

export const setProfileData = (data) => {
  return (dispatch) => {
    dispatch({
      type: 'SET_PROFILE_DATA',
      payload: data,
    });
  };
};

export const loadProfilePreferences = () => {
  return async (dispatch) => {
    try {
      const stored = await AsyncStorage.getItem(PROFILE_PREFS_KEY);
      if (stored) {
        const preferences = JSON.parse(stored);
        dispatch({
          type: 'SET_PROFILE_PREFERENCES',
          payload: preferences,
        });
      }
    } catch (e) {
      console.log('Error loading profile preferences from AsyncStorage', e);
    }
  };
};

export const updatePreference = (key, value) => {
  return async (dispatch, getState) => {
    const currentPrefs = getState().profile?.preferences || {};
    const newPrefs = { ...currentPrefs, [key]: value };
    
    dispatch({
      type: 'SET_PROFILE_PREFERENCES',
      payload: newPrefs,
    });
    
    try {
      await AsyncStorage.setItem(PROFILE_PREFS_KEY, JSON.stringify(newPrefs));
    } catch (e) {
      console.log('Error saving preference to AsyncStorage', e);
    }
  };
};
