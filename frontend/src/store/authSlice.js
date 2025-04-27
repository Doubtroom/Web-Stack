import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    status: false,
    userData: (() => {
        try {
            const data = localStorage.getItem("userData");
            return data ? JSON.parse(data) : null;
        } catch (error) {
            return null;
        }
    })(),
    profileCompleted: (() => {
        try {
            const data = localStorage.getItem("profileCompleted");
            return data === "true";
        } catch (error) {
            return false;
        }
    })()
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