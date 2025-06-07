import { configureStore } from '@reduxjs/toolkit';
import darkModeReducer from './darkModeSlice.js';
import authReducer from './authSlice.js';
import dataReducer from './dataSlice.js';

export const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
    auth: authReducer,
    data: dataReducer,
  },
}); 