import { configureStore } from '@reduxjs/toolkit';
import darkModeReducer from './darkModeSlice.js';
import authReducer from './authSlice.js';
import profileReducer from './profileSlice';

export const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
    auth: authReducer,
    profile: profileReducer
  },
}); 