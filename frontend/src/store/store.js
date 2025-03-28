import {configureStore} from '@reduxjs/toolkit'
import authSlice from './authSlice'
import darkModeSlice from './darkModeSlice'

const store =configureStore({
    reducer:{
        auth:authSlice,
        darkMode:darkModeSlice
    }
})

export default store

