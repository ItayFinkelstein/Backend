import request from 'supertest';
import mongoose from 'mongoose';
import { Express } from 'express';
import initApp from '../server';
import userModel from '../models/userModel';

let app: Express;

type User = {
    _id?: string;
    email: string;
    password: string;
    name: string;
    type: string;
    refreshTokens: string[];
    token?: string;
};

const testUser: User = {
    _id: "67dc9567425061dee2d2d26e",
    email: "testuser@gmail.com",
    password: "password123",
    name: "Test User",
    type: "normal",
    refreshTokens: [],
    token: ""
};

beforeAll(async () => {
    app = await initApp();
    await userModel.deleteMany();

    await request(app).post("/auth/register").send(testUser);
    const response = await request(app).post("/auth/login").send(testUser);
    testUser.token = response.body.accessToken;
    testUser.refreshTokens = response.body.refreshTokens;
    expect(response.statusCode).toBe(200);
});

afterAll(async () => {
    await mongoose.connection.close();
});

const authRequest = (method: string, url: string) => {
    return (request(app) as any)[method](url).set("authorization", "JWT " + testUser.token);
};

describe("User Tests", () => {
    test("Get All Users - Success", async () => {
        const response = await authRequest('get', '/user');
        expect(response.statusCode).toBe(200);
        expect(response.body).toBeInstanceOf(Array);
    });

    test("Update User - Unauthorized", async () => {
        const updatedUser = { name: "Updated Test User" };
        const response = await request(app).put(`/user/${testUser._id}`).send(updatedUser);
        expect(response.statusCode).toBe(401);
    });

    test("Update User - Invalid ID", async () => {
        const updatedUser = { name: "Updated Test User" };
        const response = await authRequest('put', `/user/invalidId`).send(updatedUser);
        expect(response.statusCode).toBe(400);
    });
});