import { configureStore } from '@reduxjs/toolkit';
import darkModeReducer from './features/darkModeSlice';
import authReducer from './features/authSlice';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
    auth: authReducer,
    profile: profileReducer
  },
}); 