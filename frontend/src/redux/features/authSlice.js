import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    userData: JSON.parse(localStorage.getItem("userData")) || null,
    profileCompleted: JSON.parse(localStorage.getItem("profileCompleted")) || false,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action) => {
            state.status = true;
            state.userData = action.payload.userData;
            state.profileCompleted = action.payload.profileCompleted;
        },
        logout: (state) => {
            state.status = false;
            state.userData = null;
            state.profileCompleted = false;
        },
        completeProfile: (state) => {
            state.profileCompleted = true;
            localStorage.setItem("profileCompleted", JSON.stringify(true));
        }
    }
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer; 