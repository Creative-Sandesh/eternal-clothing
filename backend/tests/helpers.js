import "dotenv/config";
import request from "supertest";
import { app } from "../src/app.js";
import "../src/models/relation.js";

export const api = () => request(app);

export const loginAdmin = async () => {
  const res = await api()
    .post("/api/v1/auth/login")
    .send({ email: "admin@eternal.com", password: "Admin@123" });
  return res.body?.data?.accessToken;
};

export const loginCustomer = async () => {
  const res = await api()
    .post("/api/v1/auth/login")
    .send({ email: "customer@eternal.com", password: "Customer@123" });
  return res.body?.data?.accessToken;
};

export const auth = (token) => ({ Authorization: `Bearer ${token}` });
