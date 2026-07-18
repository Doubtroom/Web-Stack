import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../app.js";
import Questions from "../models/Questions.js";
import { createVerifiedUser, loginAgent } from "./helpers/factories.js";

// In-memory MongoDB has no Atlas Search, so these tests pin down the
// fallback contract: the $search attempt throws, the regex path answers,
// and the response reports which engine served it.
describe("search", () => {
  let agent;
  let user;

  beforeAll(async () => {
    ({ user } = await createVerifiedUser());
    agent = await loginAgent(user, "Sup3rSecret!");

    await Questions.insertMany([
      {
        text: "How does thermodynamics entropy work?",
        topic: "Thermodynamics",
        branch: "mechanical_engineering",
        collegeName: "Test College",
        postedBy: user._id,
      },
      {
        text: "Explain thermocouple calibration",
        topic: "Instrumentation",
        branch: "electrical_engineering",
        collegeName: "Test College",
        postedBy: user._id,
      },
      {
        text: "What is a red-black tree?",
        topic: "Data Structures",
        branch: "computer_science_engineering",
        collegeName: "Test College",
        postedBy: user._id,
      },
    ]);
  });

  describe("full search (getFilteredQuestions)", () => {
    it("falls back to regex and says so", async () => {
      const res = await agent.get("/api/data/questions/filter?search=thermo");

      expect(res.status).toBe(200);
      expect(res.body.engine).toBe("regex");
      const texts = res.body.questions.map((q) => q.text);
      expect(texts).toContain("How does thermodynamics entropy work?");
      expect(texts).toContain("Explain thermocouple calibration");
      expect(texts).not.toContain("What is a red-black tree?");
    });

    it("reports 'filter' engine when browsing without a query", async () => {
      const res = await agent.get(
        "/api/data/questions/filter?branch=computer_science_engineering",
      );
      expect(res.body.engine).toBe("filter");
    });
  });

  describe("autocomplete", () => {
    it("suggests matching questions with a small payload", async () => {
      const res = await agent.get("/api/data/questions/autocomplete?q=thermo");

      expect(res.status).toBe(200);
      expect(res.body.engine).toBe("regex");
      expect(res.body.suggestions.length).toBeGreaterThanOrEqual(2);
      const first = res.body.suggestions[0];
      expect(first.text).toBeTruthy();
      // Lightweight: no populated user, no answer bodies.
      expect(first.postedBy).toBeUndefined();
    });

    it("matches on topic too", async () => {
      const res = await agent.get(
        "/api/data/questions/autocomplete?q=Data Structures",
      );
      expect(
        res.body.suggestions.some((s) => s.topic === "Data Structures"),
      ).toBe(true);
    });

    it("returns nothing for queries under 2 characters", async () => {
      const res = await agent.get("/api/data/questions/autocomplete?q=t");
      expect(res.body.suggestions).toHaveLength(0);
      expect(res.body.engine).toBe("none");
    });

    it("caps suggestions at 6", async () => {
      const docs = Array.from({ length: 10 }, (_, i) => ({
        text: `zebra question number ${i}`,
        topic: "Zoology",
        branch: "B",
        collegeName: "C",
        postedBy: user._id,
      }));
      await Questions.insertMany(docs);

      const res = await agent.get("/api/data/questions/autocomplete?q=zebra");
      expect(res.body.suggestions.length).toBeLessThanOrEqual(6);
    });

    it("requires authentication", async () => {
      const res = await request(app).get(
        "/api/data/questions/autocomplete?q=thermo",
      );
      expect(res.status).toBe(401);
    });
  });
});
