import mongoose from 'mongoose';
// import fs from 'fs';
import path from 'path';
import { faker } from '@faker-js/faker';
import dotenv from 'dotenv';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// MongoDB connection string
const devDbUri = process.env.MONGO_URI;

// Helper to dynamically import models (ESM compatible, Windows safe)
async function getModel(modelName) {
  const modelPath = path.join(__dirname, '../models', modelName + '.js');
  const modelUrl = pathToFileURL(modelPath).href;
  const imported = await import(modelUrl);
  return imported.default || imported;
}

async function seedMockData() {
  try {
    await mongoose.connect(devDbUri);
    console.log('Connected to testDB_2.');

    // 1. Seed Users
    const User = await getModel('User');
    await User.deleteMany({});
    const users = Array.from({ length: 50 }, () => ({
      email: faker.internet.email(),
      password: faker.internet.password(),
      displayName: faker.person.fullName(),
      photoURL: faker.image.avatar(),
      photoId: faker.string.uuid(),
      isVerified: faker.datatype.boolean(),
      branch: faker.commerce.department(),
      studyType: faker.helpers.arrayElement(['Full-time', 'Part-time']),
      phone: faker.phone.number(),
      gender: faker.helpers.arrayElement(['Male', 'Female', 'Other']),
      role: faker.helpers.arrayElement(['student', 'admin']),
      collegeName: faker.company.name(),
      dob: faker.date.birthdate().toISOString(),
      refreshToken: faker.string.uuid(),
      createdAt: faker.date.past(),
      otp: { code: faker.string.numeric(6), expiresAt: faker.date.soon() },
      resetToken: faker.string.uuid(),
      resetExpires: faker.date.soon(),
      provider: faker.helpers.arrayElement(['email', 'google']),
      passwordRecoveryDone: faker.datatype.boolean(),
      isMigrated: faker.datatype.boolean(),
      features: { flashcards: true },
      starDustPoints: faker.number.int({ min: 0, max: 1000 }),
      streak: {
        currentStreak: faker.number.int({ min: 0, max: 30 }),
        longestStreak: faker.number.int({ min: 0, max: 100 }),
        lastStreakDate: faker.date.recent()
      }
    }));
    const userDocs = await User.insertMany(users);
    const userIds = userDocs.map(u => u._id);
    console.log('Seeded Users');

    // 2. Seed Branch, College, StudyType
    const Branch = await getModel('Branch');
    await Branch.deleteMany({});
    const branches = Array.from({ length: 10 }, () => ({
      value: faker.commerce.department(),
      label: faker.commerce.department()
    }));
    await Branch.insertMany(branches);
    console.log('Seeded Branches');

    const College = await getModel('College');
    await College.deleteMany({});
    const colleges = Array.from({ length: 10 }, () => ({
      value: faker.company.name(),
      label: faker.company.name()
    }));
    await College.insertMany(colleges);
    console.log('Seeded Colleges');

    const StudyType = await getModel('StudyType');
    await StudyType.deleteMany({});
    const studyTypes = [
      { value: 'Full-time', label: 'Full-time' },
      { value: 'Part-time', label: 'Part-time' }
    ];
    await StudyType.insertMany(studyTypes);
    console.log('Seeded StudyTypes');

    // 3. Seed Questions
    const Question = await getModel('Questions');
    await Question.deleteMany({});
    const questions = Array.from({ length: 50 }, (_, i) => ({
      text: faker.lorem.sentence(),
      topic: faker.commerce.department(),
      branch: faker.commerce.department(),
      collegeName: faker.company.name(),
      photoUrl: faker.image.url(),
      photoId: faker.string.uuid(),
      noOfAnswers: faker.number.int({ min: 0, max: 10 }),
      postedBy: userIds[i % userIds.length],
      createdAt: faker.date.past(),
      isMigrated: faker.datatype.boolean()
    }));
    const questionDocs = await Question.insertMany(questions);
    const questionIds = questionDocs.map(q => q._id);
    console.log('Seeded Questions');

    // 4. Seed Answers
    const Answer = await getModel('Answers');
    await Answer.deleteMany({});
    const answers = Array.from({ length: 50 }, (_, i) => ({
      text: faker.lorem.paragraph(),
      questionId: questionIds[i % questionIds.length],
      photoUrl: faker.image.url(),
      photoId: faker.string.uuid(),
      postedBy: userIds[i % userIds.length],
      createdAt: faker.date.past(),
      upvotes: faker.number.int({ min: 0, max: 100 }),
      upvotedBy: [userIds[(i + 1) % userIds.length]],
      isMigrated: faker.datatype.boolean()
    }));
    const answerDocs = await Answer.insertMany(answers);
    const answerIds = answerDocs.map(a => a._id);
    console.log('Seeded Answers');

    // 5. Seed Comments
    const Comment = await getModel('Comments');
    await Comment.deleteMany({});
    const comments = Array.from({ length: 50 }, (_, i) => ({
      text: faker.lorem.sentence(),
      answerId: answerIds[i % answerIds.length],
      postedBy: userIds[i % userIds.length],
      createdAt: faker.date.past(),
      upvotes: faker.number.int({ min: 0, max: 20 }),
      upvotedBy: [userIds[(i + 2) % userIds.length]],
      isMigrated: faker.datatype.boolean()
    }));
    await Comment.insertMany(comments);
    console.log('Seeded Comments');

    // 6. Seed Badges
    const Badge = await getModel('Badges');
    await Badge.deleteMany({});
    const badgeTypes = ['constellation', 'planet', 'astronaut'];
    const badges = Array.from({ length: 10 }, () => ({
      badgeName: faker.word.noun(),
      resourceLink: faker.internet.url(),
      starDustValue: faker.number.int({ min: 0, max: 100 }),
      badgeType: faker.helpers.arrayElement(badgeTypes),
      criteria: faker.lorem.sentence(),
      createdAt: faker.date.past()
    }));
    const badgeDocs = await Badge.insertMany(badges);
    const badgeIds = badgeDocs.map(b => b._id);
    console.log('Seeded Badges');

    // 7. Seed UserBadge
    const UserBadge = await getModel('UserBadge');
    await UserBadge.deleteMany({});
    const userBadges = Array.from({ length: 50 }, (_, i) => ({
      userId: userIds[i % userIds.length],
      badgeId: badgeIds[i % badgeIds.length],
      createdAt: faker.date.past()
    }));
    await UserBadge.insertMany(userBadges);
    console.log('Seeded UserBadges');

    // 8. Seed Leaderboard
    const Leaderboard = await getModel('Leaderboard');
    await Leaderboard.deleteMany({});
    const leaderboards = Array.from({ length: 50 }, (_, i) => ({
      userId: userIds[i % userIds.length],
      pointsReceived: faker.number.int({ min: 0, max: 1000 }),
      rank: i + 1,
      snapshotData: faker.date.past()
    }));
    await Leaderboard.insertMany(leaderboards);
    console.log('Seeded Leaderboard');

    // 9. Seed Streaks
    const Streak = await getModel('Streaks');
    await Streak.deleteMany({});
    const streaks = Array.from({ length: 50 }, (_, i) => ({
      userId: userIds[i % userIds.length],
      currentStreak: faker.number.int({ min: 0, max: 30 }),
      currentStreakStartDate: faker.date.past(),
      lastActiveDate: faker.date.recent(),
      longestStreak: faker.number.int({ min: 0, max: 100 }),
      longestStreakStartDate: faker.date.past(),
      longestStreakEndDate: faker.date.recent(),
      updatedAt: faker.date.recent()
    }));
    await Streak.insertMany(streaks);
    console.log('Seeded Streaks');

    // 10. Seed StarDust
    const StarDust = await getModel('StarDust');
    await StarDust.deleteMany({});
    const actions = ['postAnswers', 'postQuestions', 'upvote', 'lostUpvote', 'deleteAnswers', 'deleteQuestions', 'admin_adjust', 'login'];
    const directions = ['in', 'out'];
    const refModels = ['Questions', 'Answers', 'Comments', 'Streaks', 'Upvotes', 'User'];
    const starDusts = Array.from({ length: 50 }, (_, i) => ({
      userId: userIds[i % userIds.length],
      points: faker.number.int({ min: 0, max: 100 }),
      action: faker.helpers.arrayElement(actions),
      direction: faker.helpers.arrayElement(directions),
      relatedId: questionIds[i % questionIds.length],
      refModel: faker.helpers.arrayElement(refModels),
      date: faker.date.past(),
      createdAt: faker.date.past()
    }));
    await StarDust.insertMany(starDusts);
    console.log('Seeded StarDust');

    // 11. Seed FlashcardStatus
    const FlashcardStatus = await getModel('FlashcardStatus');
    await FlashcardStatus.deleteMany({});
    const difficulties = ['easy', 'medium', 'hard'];
    const flashcardStatuses = Array.from({ length: 50 }, (_, i) => ({
      userId: userIds[i % userIds.length],
      questionId: questionIds[i % questionIds.length],
      difficulty: faker.helpers.arrayElement(difficulties),
      nextReviewAt: faker.date.soon(),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent()
    }));
    await FlashcardStatus.insertMany(flashcardStatuses);
    console.log('Seeded FlashcardStatus');

    // 12. Seed CustomerCare
    const CustomerCare = await getModel('CustomerCare');
    await CustomerCare.deleteMany({});
    const customerCares = Array.from({ length: 20 }, (_, i) => ({
      subject: faker.lorem.words(3),
      message: faker.lorem.sentences(2),
      postedBy: userIds[i % userIds.length],
      createdAt: faker.date.past()
    }));
    await CustomerCare.insertMany(customerCares);
    console.log('Seeded CustomerCare');

    // 13. Seed ReportedQuestions
    const ReportedQuestion = await getModel('ReportedQuestions');
    await ReportedQuestion.deleteMany({});
    const reportReasons = ["spam", "inappropriate", "offensive", "irrelevant", "duplicate", "other"];
    const reportedQuestions = Array.from({ length: 20 }, (_, i) => ({
      question: questionIds[i % questionIds.length],
      reportedBy: [
        {
          userId: userIds[i % userIds.length],
          reason: faker.helpers.arrayElement(reportReasons),
          description: faker.lorem.sentence(),
          reportedAt: faker.date.past()
        }
      ]
    }));
    await ReportedQuestion.insertMany(reportedQuestions);
    console.log('Seeded ReportedQuestions');

    console.log('Mock data seeding completed.');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

seedMockData();