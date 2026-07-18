import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../app.js";

describe("GET /health", () => {
  it("reports ok while Mongo is connected, Redis disabled", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      status: "ok",
      mongo: "up",
      redis: "disabled",
    });
    expect(typeof res.body.uptime).toBe("number");
  });

  it("needs no authentication (probes can't log in)", async () => {
    const res = await request(app).get("/health");
    expect(res.status).not.toBe(401);
  });
});
