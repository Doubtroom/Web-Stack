import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isDarkMode:
    localStorage.getItem("darkMode") === null
      ? (() => {
          localStorage.setItem("darkMode", "true");
          return true;
        })()
      : localStorage.getItem("darkMode") === "true",
};

const darkModeSlice = createSlice({
  name: "darkMode",
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      localStorage.setItem("darkMode", state.isDarkMode);
    },
  },
});

export const { toggleDarkMode } = darkModeSlice.actions;
export default darkModeSlice.reducer;
