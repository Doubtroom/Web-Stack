import { describe, it, expect, vi } from "vitest";
import request from "supertest";

// Replace the real nodemailer-backed module so no email leaves the test run;
// the OTP the controller generates is captured from the mock's call args.
vi.mock("../utils/email.js", () => ({
  sendOtpEmail: vi.fn().mockResolvedValue(undefined),
  sendPasswordResetEmail: vi.fn().mockResolvedValue(undefined),
}));

import { sendOtpEmail } from "../utils/email.js";
import app from "../app.js";
import User from "../models/User.js";
import { createVerifiedUser, loginAgent } from "./helpers/factories.js";

describe("signup → OTP verification lifecycle", () => {
  const email = "flow@test.local";
  const password = "Sup3rSecret!";
  // One agent for the whole flow — it carries cookies like a browser would.
  const agent = request.agent(app);

  it("signs up a new user and sets both auth cookies", async () => {
    const res = await agent
      .post("/api/auth/signup")
      .send({ email, password, displayName: "Flow User" });

    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(email);
    expect(res.body.user.isVerified).toBe(false);

    const cookies = res.headers["set-cookie"].join(" ");
    expect(cookies).toContain("accessToken=");
    expect(cookies).toContain("refreshToken=");
  });

  it("rejects a duplicate signup for the same email", async () => {
    const res = await request(app)
      .post("/api/auth/signup")
      .send({ email, password, displayName: "Imposter" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("blocks unverified users from protected data routes", async () => {
    const res = await agent.get("/api/data/questions");
    expect(res.status).toBe(403);
    expect(res.body.isVerified).toBe(false);
  });

  it("sends an OTP via the (mocked) email service", async () => {
    const res = await agent.post("/api/auth/send-otp");

    expect(res.status).toBe(200);
    expect(sendOtpEmail).toHaveBeenCalledTimes(1);
    expect(sendOtpEmail.mock.calls[0][0]).toBe(email);
  });

  it("rejects a wrong OTP", async () => {
    const res = await agent
      .post("/api/auth/verify-otp")
      .send({ otp: "000000" });
    expect(res.status).toBe(400);
  });

  it("verifies the correct OTP and marks the user verified", async () => {
    const otp = sendOtpEmail.mock.calls[0][1];
    const res = await agent
      .post("/api/auth/verify-otp")
      .send({ otp: String(otp) });

    expect(res.status).toBe(200);
    expect(res.body.user.isVerified).toBe(true);

    const dbUser = await User.findOne({ email });
    expect(dbUser.isVerified).toBe(true);
  });

  it("allows protected routes once verified", async () => {
    const res = await agent.get("/api/data/questions");
    expect(res.status).toBe(200);
  });

  it("refuses login while a session is already active", async () => {
    const res = await agent.post("/api/auth/login").send({ email, password });
    expect(res.status).toBe(400);
  });
});

describe("login", () => {
  it("logs in a verified user with correct credentials", async () => {
    const { user, password } = await createVerifiedUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password });

    expect(res.status).toBe(200);
    expect(res.body.isAuthenticated).toBe(true);
    expect(res.body.user.isVerified).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const { user } = await createVerifiedUser();
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password: "totally-wrong" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid password");
  });

  it("rejects an unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.local", password: "whatever" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User not found");
  });
});

describe("silent refresh via refresh token", () => {
  it("issues a new access token when only the refresh cookie is present", async () => {
    const { user, password } = await createVerifiedUser();
    const login = await request(app)
      .post("/api/auth/login")
      .send({ email: user.email, password });

    const refreshCookie = login.headers["set-cookie"]
      .find((c) => c.startsWith("refreshToken="))
      .split(";")[0];

    // Simulate an expired access token: send only the refresh cookie.
    const res = await request(app)
      .get("/api/data/questions")
      .set("Cookie", refreshCookie);

    expect(res.status).toBe(200);
    const newCookies = res.headers["set-cookie"] || [];
    expect(newCookies.some((c) => c.startsWith("accessToken="))).toBe(true);
  });

  it("rejects a forged refresh token", async () => {
    const res = await request(app)
      .get("/api/data/questions")
      .set("Cookie", "refreshToken=forged-token");

    expect(res.status).toBe(401);
    expect(res.body.isAuthenticated).toBe(false);
  });

  it("rejects requests with no cookies at all", async () => {
    const res = await request(app).get("/api/data/questions");
    expect(res.status).toBe(401);
  });
});

describe("logout", () => {
  it("clears the stored refresh token server-side", async () => {
    const { user, password } = await createVerifiedUser();
    const agent = await loginAgent(user, password);

    const res = await agent.post("/api/auth/logout");
    expect(res.status).toBe(200);
    expect(res.body.isAuthenticated).toBe(false);

    const dbUser = await User.findById(user._id);
    expect(dbUser.refreshToken).toBeNull();
  });
});
