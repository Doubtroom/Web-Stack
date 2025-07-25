import { configureStore } from "@reduxjs/toolkit";
import darkModeReducer from "./darkModeSlice.js";
import authReducer from "./authSlice.js";
import dataReducer from "./dataSlice.js";
import flashcardStatusReducer from "./flashcardStatusSlice.js";
import starDustReducer from "./starDustSlice.js";
import streakReducer from "./streakSlice.js";

export const store = configureStore({
  reducer: {
    darkMode: darkModeReducer,
    auth: authReducer,
    data: dataReducer,
    flashcardStatus: flashcardStatusReducer,
    starDust: starDustReducer,
    streak: streakReducer,
  },
});
