import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    profileCompleted: localStorage.getItem('profileCompleted') === 'true' || false
};

const profileSlice = createSlice({
    name: 'profile',
    initialState,
    reducers: {
        updateProfileCompletion: (state, action) => {
            state.profileCompleted = action.payload;
        }
    }
});

export const { updateProfileCompletion } = profileSlice.actions;
export default profileSlice.reducer; 