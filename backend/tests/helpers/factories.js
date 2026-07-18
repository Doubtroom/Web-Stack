import bcrypt from "bcrypt";
import request from "supertest";
import app from "../../app.js";
import User from "../../models/User.js";

let userCounter = 0;

// Low bcrypt cost: these hashes only need to be comparable, not secure.
const TEST_BCRYPT_ROUNDS = 4;

export const createVerifiedUser = async (overrides = {}) => {
  const password = overrides.password || "Sup3rSecret!";
  userCounter += 1;
  const user = await User.create({
    email: overrides.email || `user${userCounter}@test.local`,
    password: await bcrypt.hash(password, TEST_BCRYPT_ROUNDS),
    displayName: overrides.displayName || `Test User ${userCounter}`,
    isVerified: overrides.isVerified ?? true,
    collegeName: overrides.collegeName || "Test College",
    branch: overrides.branch || "CSE",
  });
  return { user, password };
};

// A supertest agent keeps cookies between requests, like a browser tab.
export const loginAgent = async (user, password) => {
  const agent = request.agent(app);
  const res = await agent
    .post("/api/auth/login")
    .send({ email: user.email, password });
  if (res.status !== 200) {
    throw new Error(`Test login failed with status ${res.status}`);
  }
  return agent;
};

// Poll until an async condition holds — used to wait out fire-and-forget
// side effects (e.g. StarDust awards) without sprinkling sleeps in tests.
export const waitFor = async (
  predicate,
  { timeout = 3000, step = 50 } = {},
) => {
  const deadline = Date.now() + timeout;
  for (;;) {
    if (await predicate()) return;
    if (Date.now() > deadline) {
      throw new Error("waitFor: condition not met within timeout");
    }
    await new Promise((resolve) => setTimeout(resolve, step));
  }
};
