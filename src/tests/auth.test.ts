import { Express } from "express";
import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import userModel from "../models/userModel";
let app: Express;

beforeAll(async () => {
    app = await initApp();
    await userModel.deleteMany();
});

afterAll(async () => {
    await mongoose.connection.close();
});

type UserInfo = {
    _id?: string;
    email: string;
    password: string;
    type: string;
    name: string;
    accessToken?: string;
    refreshToken?: string;
};

const userInfo: UserInfo = {
    _id: "67dc9567425061dee2d2d26e",
    name: "Itay",
    email: "itayf@gmail.com",
    password: "898989",
    type: "normal",
}

describe("Auth Tests", () => {
    test("Auth Registration", async () => {
        const response = await request(app).post("/auth/register").send(userInfo);
        console.log("responseAuth:");
        console.log(response.body);
        expect(response.statusCode).toBe(200);
    });

    test("Auth Registration Fail missing password", async () => {
        const response = await request(app).post("/auth/register").send({ email: "itay.f@gmail.com" });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("missing email or password");
    });

    test("Auth Registration Fail missing email", async () => {
        const response = await request(app).post("/auth/register").send({ password: "11111" });
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("missing email or password");
    });

    test("Auth Login", async () => {
        const response = await request(app).post("/auth/login").send(userInfo);
        expect(response.statusCode).toBe(200);

        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;
        const userId = response.body._id;

        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        expect(userId).toBeDefined();

        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
        userInfo._id = userId;
    });

    test("Auth Logout", async () => {
        const response = await request(app).post("/auth/logout").send({
            refreshToken: userInfo.refreshToken
        });

        expect(response.statusCode).toBe(200);
        expect(response.text).toBe("logged out");
    });

    test("Auth Login - after logout", async () => {
        const response = await request(app).post("/auth/login").send(userInfo);
        expect(response.statusCode).toBe(200);

        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;
        const userId = response.body._id;

        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        expect(userId).toBeDefined();

        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
        userInfo._id = userId;
    });

    test("Get protected API", async () => {
        const response = await request(app).post("/comments").send({
            owner: userInfo._id,
            message: "comment 1",
            postId: "67db0c3089b72f5cefaa9427",
            publishDate: "2025-03-18T00:00:00.000Z"
        });
        expect(response.statusCode).not.toBe(201);

        const secondResponse = await request(app).post("/comments").set({
            authorization: 'jwt ' + userInfo.accessToken
        }).send({
            owner: userInfo._id,
            message: "comment 2",
            postId: "67db0c3089b72f5cefaa9427",
            publishDate: "2025-03-18T00:00:00.000Z"
        });
        console.log("secondResponse:");
        console.log(secondResponse.body);

        expect(secondResponse.statusCode).toBe(201);
    });

    test("Auth Refresh Token", async () => {
        const response = await request(app).post("/auth/refresh").send({
            refreshToken: userInfo.refreshToken
        });
        expect(response.statusCode).toBe(200);

        const newAccessToken = response.body.accessToken;
        const newRefreshToken = response.body.refreshToken;

        expect(newAccessToken).toBeDefined();
        expect(newRefreshToken).toBeDefined();

        userInfo.accessToken = newAccessToken;
        userInfo.refreshToken = newRefreshToken;
    });

    test("Auth Refresh Token Multiple Usage", async () => {
        // First usage
        const firstResponse = await request(app).post("/auth/refresh").send({
            refreshToken: userInfo.refreshToken
        });
        expect(firstResponse.statusCode).toBe(200);

        const newAccessToken = firstResponse.body.accessToken;
        const newRefreshToken = firstResponse.body.refreshToken;

        expect(newAccessToken).toBeDefined();
        expect(newRefreshToken).toBeDefined();

        // Second usage with the same token
        const secondResponse = await request(app).post("/auth/refresh").send({
            refreshToken: userInfo.refreshToken
        });
        expect(secondResponse.statusCode).toBe(400);
        expect(secondResponse.text).toBe("invalid token");
    });

    test("Auth Login- after multiple usage", async () => {
        const response = await request(app).post("/auth/login").send(userInfo);
        expect(response.statusCode).toBe(200);

        const accessToken = response.body.accessToken;
        const refreshToken = response.body.refreshToken;
        const userId = response.body._id;

        expect(accessToken).toBeDefined();
        expect(refreshToken).toBeDefined();
        expect(userId).toBeDefined();

        userInfo.accessToken = accessToken;
        userInfo.refreshToken = refreshToken;
        userInfo._id = userId;
    });

    test("Auth Refresh Token Fail missing token", async () => {
        const response = await request(app).post("/auth/refresh").send({});
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("invalid token");
    });

    test("Auth Refresh Token Fail invalid token", async () => {
        const response = await request(app).post("/auth/refresh").send({
            refreshToken: "invalid_refresh_token"
        });
        expect(response.statusCode).toBe(403);
        expect(response.text).toBe("invalid token");
    });

    test("Logout - invalidate refresh token", async () => {
        const response = await request(app).post("/auth/logout").send({
            refreshToken: userInfo.refreshToken
        });
        expect(response.statusCode).toBe(200);
        const response2 = await request(app).post("/auth/refresh").send({
            refreshToken: userInfo.refreshToken
        });
        expect(response2.statusCode).not.toBe(200);
    });

    test("Auth Logout Fail missing token", async () => {
        const response = await request(app).post("/auth/logout").send({});
        expect(response.statusCode).toBe(400);
        expect(response.text).toBe("missing refresh token");
    });

    test("Auth Logout Fail invalid token", async () => {
        const response = await request(app).post("/auth/logout").send({
            refreshToken: "invalid_refresh_token"
        });
        expect(response.statusCode).toBe(403);
        expect(response.text).toBe("invalid token");
    });

    jest.setTimeout(20000);
    test("timeout on refresh access token", async () => {
        const response = await request(app).post("/auth/login").send({
            email: userInfo.email,
            password: userInfo.password
        });

        expect(response.statusCode).toBe(200);
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.refreshToken).toBeDefined();

        userInfo.accessToken = response.body.accessToken;
        userInfo.refreshToken = response.body.refreshToken;
        //wait for 10 seconds
        await new Promise(resolve => setTimeout(resolve, 10000));


        const response2 = await request(app).post("/post").set({
            authorization: 'jwt ' + userInfo.accessToken
        }).send({
            message: "send",
            owner: "Jill",
            title: "Second Post",
            image: "http://example.com/image2.jpg",
            publishDate: "2025-03-10T00:00:00.000Z",
            likes: [],
            commentAmount: 0
        });

        expect(response2.statusCode).not.toBe(201);

        const response3 = await request(app).post("/auth/refresh").send({
            refreshToken: userInfo.refreshToken
        });
        expect(response3.statusCode).toBe(200);
        userInfo.accessToken = response3.body.accessToken;
        userInfo.refreshToken = response3.body.refreshToken;

        const response4 = await request(app).post("/post").set({
            authorization: 'jwt ' + userInfo.accessToken
        }).send({
            message: "another one",
            owner: "Jill",
            title: "Second Post",
            image: "http://example.com/image2.jpg",
            publishDate: "2025-03-10T00:00:00.000Z",
            likes: [],
            commentAmount: 0
        });

        expect(response4.statusCode).toBe(201);
    });
});