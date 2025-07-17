# Daily Streak Feature Implementation

## Overview
The Daily Streak feature tracks user activity and maintains a daily streak counter that resets after 24 hours of inactivity. All streak logic is now handled centrally in the backend, ensuring consistency and maintainability.

## Features Implemented

### 1. Backend Implementation

#### Database Schema Updates ✅
- **Streaks Model** (`backend/models/Streaks.js`):
  - `currentStreak`: Current daily streak count
  - `longestStreak`: Longest streak achieved
  - `lastActiveDate`: Last activity timestamp
  - `currentStreakStartDate`, `longestStreakStartDate`, `longestStreakEndDate`, `updatedAt`
- **User Model**: No longer contains streak fields (removed to prevent data drift and confusion).

#### API Endpoints ✅
- **GET** `/api/streak`: Get user's current streak data
- **POST** `/api/streak/update`: Update user's streak (called on activity)
- **POST** `/api/streak/reset/:userId`: Admin-only manual reset for a user's streak

#### Controllers ✅
- **`streakController.js`**: Handles all streak logic including:
  - Daily streak calculation
  - Consecutive day tracking
  - Streak reset after inactivity
  - Longest streak tracking
  - **Centralized activity type tracking**: All valid activity types are defined in `STREAK_ACTIVITY_TYPES`. To add a new activity, update this constant only.
- **Other Controllers**: Must call the `/api/streak/update` endpoint for streak updates. No direct Streak model updates are allowed outside the streak controller and the scheduled reset job.

#### Automated Reset Job ✅
- **`streakResetJob.js`**: Scheduled job that runs every hour to reset streaks for inactive users
- Only updates the Streaks model (no longer touches the User model)
- Logs user IDs whose streaks were reset (placeholder for future notifications)

### 2. Frontend Implementation

#### Redux State Management ✅
- **`streakSlice.js`**: Manages streak state with actions:
  - `fetchStreak`: Get user's streak data
  - `updateStreak`: Update streak on activity (calls backend API)
  - `resetStreak`: Reset streak state
  - Handles optimistic UI and error feedback
  - Resets streak state on logout

#### UI Components ✅
- **`StreakIcon.jsx`**: Displays streak icon with count badge
  - Shows current streak number (or zero, with tooltip)
  - Interactive tooltip with streak details and error state
  - Manual refresh supported via prop
  - Positioned near profile icon in navbar

#### Activity Tracking ✅
- **Integration Points**: Streak updates are triggered by calling the backend API after user activities (e.g., question/answer submission). No direct frontend-only tracking or custom hook is used as the source of truth.
- **How to Add New Activities**: Update the `STREAK_ACTIVITY_TYPES` constant in the backend. All controllers and frontend code should reference this for valid activity types.

### 3. Visual Design

#### Streak Icon
- **Location**: Next to profile icon in navbar (both desktop and mobile)
- **Design**: Circular icon with streak count badge
- **Animation**: Pulse animation for active streaks
- **Tooltip**: Shows current and longest streak on hover, and error state if fetch fails

#### Responsive Design
- Works on both desktop and mobile layouts
- Consistent positioning across different screen sizes

## Technical Details

### Streak Logic
1. **Daily Check**: System checks if user was active today
2. **Consecutive Days**: If user was active yesterday, increment streak
3. **Gap Detection**: If more than 1 day gap, reset streak to 1
4. **Longest Streak**: Automatically updates if current streak exceeds previous best
5. **Centralized Activity Types**: All valid activities are defined in `STREAK_ACTIVITY_TYPES` in the backend. Update this list to add new activities.

### Reset Mechanism
- **Scheduled Job**: Runs every hour to check for inactive users
- **24-hour Rule**: Users inactive for more than 24 hours have their streak reset
- **Database Query**: Finds users with last activity > 24 hours ago
- **Only Streaks Model Updated**: User model is not touched

### Activity Tracking
- **API-Driven Updates**: All streak updates are triggered by backend API calls after user activities
- **Daily Limits**: Only one streak update per day per user
- **Real-time Updates**: Immediate UI updates when streak changes
- **No Direct Model Updates in Controllers**: All updates go through the streak controller

## Usage

### For Users
1. **View Streak**: Hover over the streak icon in the navbar
2. **Build Streak**: Use the app daily to maintain your streak
3. **Track Progress**: See both current and longest streaks

### For Developers
1. **Add Activity Tracking**: Call the `/api/streak/update` endpoint after new user activities
2. **Manual Updates**: Use the streak API for all streak changes
3. **Custom Integration**: Use streak services for custom implementations
4. **Add New Activity Types**: Update `STREAK_ACTIVITY_TYPES` in the backend

## Configuration

### Environment Variables
No additional environment variables required - uses existing database and server configuration.

### Customization Options
- **Reset Interval**: Modify `streakResetJob.js` for different reset schedules
- **Activity Types**: Add more activity triggers in `STREAK_ACTIVITY_TYPES`
- **UI Styling**: Customize `StreakIcon.jsx` for different visual designs

## Testing

### Manual Testing
1. **Login**: User should see streak icon in navbar
2. **Activity**: Perform actions (ask question, answer) to update streak
3. **Inactivity**: Wait 24+ hours to test reset functionality
4. **Tooltip**: Hover over streak icon to see details

### Automated Testing
- Backend: API endpoints for streak operations
- Frontend: Redux state management and UI components
- Integration: End-to-end user flow testing
- **Edge Cases**: See `backend/tests/streak.test.js` for test scaffolds covering daylight saving, leap years, timezones, double activity, and inactivity reset

## Future Enhancements

### Potential Improvements
1. **Streak Rewards**: Badges or achievements for milestone streaks
2. **Social Features**: Share streaks with friends
3. **Analytics**: Detailed streak statistics and insights
4. **Notifications**: Reminders to maintain streaks
5. **Gamification**: Points or rewards for consistent activity

### Technical Enhancements
1. **Caching**: Redis caching for better performance
2. **Webhooks**: Real-time streak updates
3. **Analytics**: Detailed user activity tracking
4. **Mobile Push**: Push notifications for streak maintenance

## Files Modified/Created

### Backend
- `models/Streaks.js` - Streak data (User.js no longer contains streak fields)
- `controllers/streakController.js` - Centralized streak logic and activity types
- `routes/streakRoutes.js` - Streak API routes
- `utils/streakResetJob.js` - Scheduled reset job
- `server.js` - Registers streak routes and job scheduling
- `tests/streak.test.js` - Edge case test scaffold

### Frontend
- `store/streakSlice.js` - Redux state management
- `services/streak.services.js` - API service calls
- `components/StreakIcon.jsx` - UI component
- `store/store.js` - Added streak reducer

## Conclusion

The Daily Streak feature is now robust, maintainable, and consistent across backend and frontend. All streak logic is centralized in the backend, with a single source of truth for activity types and no redundant data storage. The implementation is scalable and can be easily extended with additional features in the future. 