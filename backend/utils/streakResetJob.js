import { resetInactiveStreaks } from "../controllers/streakController.js";

// Function to run streak reset job
export const runStreakResetJob = async () => {
  try {
    console.log("Running streak reset job...");
    await resetInactiveStreaks();
    console.log("Streak reset job completed successfully");
  } catch (error) {
    console.error("Streak reset job failed:", error);
  }
};

// Schedule the job to run every hour
export const scheduleStreakResetJob = () => {
  // Run immediately on startup
  runStreakResetJob();
  
  // Then schedule to run every hour
  setInterval(runStreakResetJob, 60 * 60 * 1000); // 1 hour in milliseconds
  
  console.log("Streak reset job scheduled to run every hour");
}; 