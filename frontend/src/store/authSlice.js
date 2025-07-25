import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/auth.services.js";
import { incrementStarDustPoints } from "./starDustSlice";

// Async thunks
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { dispatch, rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      
      // After successful login, check for daily login award
      let dailyLoginAwarded = false;
      if (response.data.isAuthenticated && response.data.user?.isVerified) {
        const verifyResponse = await authService.verifyUser();
        dailyLoginAwarded = verifyResponse.data.dailyLoginAwarded;
        if (dailyLoginAwarded) {
          dispatch(incrementStarDustPoints(1));
        }
      }
      
      return { ...response.data, dailyLoginAwarded };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  },
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.signup(userData);
      // After successful signup, send OTP
      await authService.sendOtp(userData.email);
      return {
        ...response.data,
        otpSent: true,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Signup failed");
    }
  },
);

export const googleLogin = createAsyncThunk(
  "auth/google-login",
  async (token, { dispatch, rejectWithValue }) => {
    try {
      const response = await authService.googleLogin(token);
      
      // After successful Google login, check for daily login award
      let dailyLoginAwarded = false;
      if (response.data.isAuthenticated && response.data.user?.isVerified) {
        const verifyResponse = await authService.verifyUser();
        dailyLoginAwarded = verifyResponse.data.dailyLoginAwarded;
        if (dailyLoginAwarded) {
          dispatch(incrementStarDustPoints(1));
        }
      }
      
      return { ...response.data, dailyLoginAwarded };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Google login failed",
      );
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  },
);

export const fetchUser = createAsyncThunk(
  "/user",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getUser();
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch user data",
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  "auth/saveUserProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await authService.saveProfile(profileData);
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Profile update failed",
      );
    }
  },
);

export const sendOtp = createAsyncThunk(
  "auth/send-otp",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.sendOtp(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

export const verifyOtp = createAsyncThunk(
  "auth/verify-otp",
  async (otpData, { rejectWithValue }) => {
    try {
      const response = await authService.verifyOtp(otpData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  },
);

export const requestPasswordReset = createAsyncThunk(
  "/auth/request-reset",
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.requestReset(email);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to request password reset",
      );
    }
  },
);

export const verifyResetToken = createAsyncThunk(
  "auth/verifyResetToken",
  async (token, { rejectWithValue }) => {
    try {
      const response = await authService.verifyResetToken(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Invalid reset token",
      );
    }
  },
);

export const resetPassword = createAsyncThunk(
  "auth/reset-password",
  async ({ token, newPassword }, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(token, newPassword);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Password reset failed",
      );
    }
  },
);

// Thunk to verify user and handle daily login points
export const verifyUserAndHandlePoints = createAsyncThunk(
  "auth/verifyUserAndHandlePoints",
  async ({ willFetchStarDustInfo = false } = {}, { dispatch, rejectWithValue }) => {
    try {
      const response = await authService.verifyUser();
      // If daily login was awarded and we are NOT about to fetch points, increment instantly
      if (response.data.dailyLoginAwarded && !willFetchStarDustInfo) {
        dispatch(incrementStarDustPoints(1));
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    loading: false,
    error: null,
    isAuthenticated: false,
    isVerified: false,
    otpSent: false,
    resetTokenValid: false,
    features: { flashcards: true },
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setAuth: (state, action) => {
      if (typeof action.payload === "boolean") {
        state.isAuthenticated = action.payload;
      } else {
        state.isAuthenticated = action.payload.isAuthenticated;
        state.isVerified = action.payload.isVerified;
        if (action.payload.user) {
          state.user = action.payload.user;
        }
      }
    },
    clearAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isVerified = false;
      state.otpSent = false;
      state.error = null;
    },
    setOtpSent: (state, action) => {
      state.otpSent = action.payload;
    },
    updateProfile: (state, action) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
        if (action.payload.features) {
          state.user.features = action.payload.features;
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isVerified = action.payload.user.isVerified;
        if (!action.payload.user.isVerified) {
          state.otpSent = true;
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Signup
      .addCase(signup.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isVerified = false;
        state.otpSent = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.otpSent = false;
      })
      // Google Login
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isVerified = false;
        state.error = null;
      })
      // Fetch User
      .addCase(fetchUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = true;
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state) => {
        state.loading = false;
        state.isVerified = true;
        state.otpSent = false;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Request Password Reset
      .addCase(requestPasswordReset.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(requestPasswordReset.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Verify Reset Token
      .addCase(verifyResetToken.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyResetToken.fulfilled, (state) => {
        state.loading = false;
        state.resetTokenValid = true;
      })
      .addCase(verifyResetToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.resetTokenValid = false;
      })
      // Reset Password
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.resetTokenValid = false;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setAuth, clearAuth, setOtpSent } = authSlice.actions;
export default authSlice.reducer;
