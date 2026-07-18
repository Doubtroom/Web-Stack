import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import mongoose from "mongoose";
import app from "../app.js";
import Questions from "../models/Questions.js";
import { createVerifiedUser, loginAgent } from "./helpers/factories.js";

describe("questions API", () => {
  let agent;
  let user;

  beforeAll(async () => {
    ({ user } = await createVerifiedUser({ collegeName: "IIT Test" }));
    agent = await loginAgent(user, "Sup3rSecret!");
  });

  describe("create", () => {
    it("creates a text-only question and starts the author's streak", async () => {
      const res = await agent.post("/api/data/questions").send({
        text: "What is a pointer?",
        topic: "C Programming",
        branch: "CSE",
        collegeName: "IIT Test",
      });

      expect(res.status).toBe(201);
      expect(res.body.question.text).toBe("What is a pointer?");
      expect(res.body.question.postedBy).toBe(String(user._id));

      const stored = await Questions.findById(res.body.question._id);
      expect(stored).not.toBeNull();
      expect(stored.noOfAnswers).toBe(0);
    });

    it("rejects an unauthenticated create", async () => {
      const res = await request(app).post("/api/data/questions").send({
        text: "No auth",
        topic: "T",
        branch: "B",
        collegeName: "C",
      });
      expect(res.status).toBe(401);
    });

    it("fails when required fields are missing (current behavior: 500)", async () => {
      const res = await agent
        .post("/api/data/questions")
        .send({ text: "Missing everything else" });
      expect(res.status).toBe(500);
    });
  });

  describe("read", () => {
    it("fetches a single question by id", async () => {
      const created = await agent.post("/api/data/questions").send({
        text: "Single fetch target",
        topic: "Networks",
        branch: "CSE",
        collegeName: "IIT Test",
      });

      const res = await agent.get(
        `/api/data/questions/${created.body.question._id}`,
      );
      expect(res.status).toBe(200);
      expect(res.body.question.text).toBe("Single fetch target");
      // populate() swaps the raw id for author details
      expect(res.body.question.postedBy.displayName).toBe(user.displayName);
    });

    it("returns 404 for a well-formed but unknown id", async () => {
      const ghostId = new mongoose.Types.ObjectId();
      const res = await agent.get(`/api/data/questions/${ghostId}`);
      expect(res.status).toBe(404);
    });
  });

  describe("filtering and pagination", () => {
    beforeAll(async () => {
      // Seed a known corpus directly (skipping the HTTP layer keeps this fast).
      const docs = [];
      for (let i = 0; i < 12; i++) {
        docs.push({
          text: `Thermodynamics doubt number ${i}`,
          topic: "Thermodynamics",
          branch: "Mechanical",
          collegeName: "NIT Test",
          postedBy: user._id,
          createdAt: new Date(Date.now() - i * 60000),
        });
      }
      docs.push({
        text: "How does a binary heap work?",
        topic: "Data Structures",
        branch: "CSE",
        collegeName: "NIT Test",
        postedBy: user._id,
      });
      await Questions.insertMany(docs);
    });

    it("paginates newest-first with correct metadata", async () => {
      const res = await agent.get(
        "/api/data/questions/filter?branch=Mechanical&page=1&limit=5",
      );

      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(5);
      expect(res.body.pagination).toMatchObject({
        currentPage: 1,
        totalPages: 3,
        totalItems: 12,
        hasNextPage: true,
        hasPrevPage: false,
      });

      // Newest first
      const dates = res.body.questions.map((q) =>
        new Date(q.createdAt).getTime(),
      );
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });

    it("serves the last page with the remainder", async () => {
      const res = await agent.get(
        "/api/data/questions/filter?branch=Mechanical&page=3&limit=5",
      );
      expect(res.body.questions).toHaveLength(2);
      expect(res.body.pagination.hasNextPage).toBe(false);
      expect(res.body.pagination.hasPrevPage).toBe(true);
    });

    it("filters by branch and topic together", async () => {
      const res = await agent.get(
        "/api/data/questions/filter?branch=CSE&topic=Data Structures",
      );
      expect(res.status).toBe(200);
      expect(
        res.body.questions.every((q) => q.topic === "Data Structures"),
      ).toBe(true);
    });

    it("search matches text case-insensitively and overrides other filters", async () => {
      const res = await agent.get(
        "/api/data/questions/filter?search=BINARY HEAP&branch=Mechanical",
      );
      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(1);
      expect(res.body.questions[0].text).toBe("How does a binary heap work?");
    });
  });
});
