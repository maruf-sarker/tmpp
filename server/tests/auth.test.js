import request from "supertest";
import app from "../app.js";
import User from "../models/userModel.js";

describe("Auth API", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .field("name", testUser.name)
        .field("email", testUser.email)
        .field("password", testUser.password)
        .attach("avatar", "tests/fixtures/test-avatar.jpg");

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", testUser.name);
      expect(res.body).toHaveProperty("email", testUser.email);
      expect(res.body).toHaveProperty("avatar");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should fail with missing fields", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: testUser.name });

      expect(res.statusCode).toEqual(400);
      expect(res.body.message).toMatch(/required/);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(testUser);
    });

    it("should login existing user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.headers["set-cookie"]).toBeDefined();
    });

    it("should fail with invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: testUser.email,
        password: "wrongpassword",
      });

      expect(res.statusCode).toEqual(401);
    });
  });

  // Add tests for logout, profile, etc.
});
