import User from "../models/userModel.js";
import request from "supertest";
import app from "../app.js";

export const adminUser = {
  name: "Admin User",
  email: "admin@test.com",
  password: "password123",
  isAdmin: true,
};

export const createAdminUser = async () => {
  const user = await User.create(adminUser);
  const loginRes = await request(app).post("/api/auth/login").send({
    email: adminUser.email,
    password: adminUser.password,
  });
  return loginRes.headers["set-cookie"][0].split(";")[0].split("=")[1];
};

export const createTestUser = async (userData) => {
  const user = await User.create(userData);
  const loginRes = await request(app).post("/api/auth/login").send({
    email: userData.email,
    password: userData.password,
  });
  return {
    user,
    token: loginRes.headers["set-cookie"][0].split(";")[0].split("=")[1],
  };
};
