import request from 'supertest';
import mongoose from 'mongoose';
import postsArray from './posts.json';
import { Express } from 'express';
import initApp from '../server';
import postModel, { IPost } from '../models/postModel';

let app: Express;

const testPosts: IPost[] = postsArray.map(post => ({
    ...post,
    publishDate: new Date(post.publishDate)
}));
const baseUrl = '/post';

type User = {
    _id?: string;
    email: string;
    type: string;
    name: string;
    iconImage?: string;
    password?: string;
    refreshTokens: string[];

    token: string;
}

const testUser: User = {
    _id: "67dc9567425061dee2d2d26e",
    name: "Itay",
    email: "itayf@gmail.com",
    password: "898989",
    refreshTokens: [],
    type: "normal",
    token: ""
}

beforeAll(async () => {
    app = await initApp();
    await postModel.deleteMany();

    await request(app).post("/auth/register").send(testUser);
    const response = await request(app).post("/auth/login").send(testUser);
    testUser.token = response.body.accessToken;
    testUser._id = response.body._id;
    expect(response.statusCode).toBe(200);
});

afterAll(async () => {
    await mongoose.connection.close();
});

// Custom request function to include the token in the headers
const authRequest = (method: string, url: string) => {
    return (request(app) as any)[method](url).set("authorization", "JWT " + testUser.token);
};

describe('Posts Test', () => {
    test('Test get all posts - no results', async () => {
        const response = await authRequest('get', baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });

    test('Test create new post', async () => {
        for (let post of testPosts) {
            const response = await authRequest('post', baseUrl).send(post);
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe(post.message);
            expect(response.body.owner).toBe(testUser._id);
            post._id = response.body._id;
        }

        const response = await authRequest('get', baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testPosts.length);
    });

    test('Test get all posts after creation', async () => {
        const response = await authRequest('get', baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testPosts.length);
    });

    test('Test get post by id', async () => {
        const response = await authRequest('get', baseUrl + '/' + testPosts[0]._id);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testPosts[0]._id);
    });

    test('Test get post by invalid id', async () => {
        const response = await authRequest('get', baseUrl + '/invalidId');
        expect(response.statusCode).toBe(400);
    });

    test('Test filter posts by owner', async () => {
        const response = await authRequest('get', baseUrl + '?owner=' + testUser._id);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testPosts.length);
    });

    test('Test update post', async () => {
        const updatedPost = { ...testPosts[0], message: 'Updated message' };
        const response = await authRequest('put', baseUrl + '/' + testPosts[0]._id).send(updatedPost);
        expect(response.statusCode).toBe(200);

        const responseGet = await authRequest('get', baseUrl + '/' + testPosts[0]._id);
        expect(responseGet.statusCode).toBe(200);
        expect(responseGet.body.message).toBe('Updated message');
    });

    test('Test delete post', async () => {
        const response = await authRequest('delete', baseUrl + '/' + testPosts[0]._id);
        expect(response.statusCode).toBe(200);

        const responseGet = await authRequest('get', baseUrl + '/' + testPosts[0]._id);
        expect(responseGet.statusCode).toBe(400);
    });

    test('Test get all posts after deleting one', async () => {
        const response = await authRequest('get', baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testPosts.length - 1);
    });

    test('Test update post when item not found', async () => {
        const updatedPost = { ...testPosts[0], message: 'Updated message' };
        const nonExistentId = new mongoose.Types.ObjectId().toHexString();
        const response = await authRequest('put', baseUrl + '/' + nonExistentId).send(updatedPost);
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('Item with id ' + nonExistentId + ' not found');
    });

    test('Test delete post with invalid id', async () => {
        const response = await authRequest('delete', baseUrl + '/invalidId');
        expect(response.statusCode).toBe(400);
    });

    test('Test delete post when item not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toHexString();
        const response = await authRequest('delete', baseUrl + '/' + nonExistentId);
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe('Item with id ' + nonExistentId + ' not found');
    });

    test('Test update post with invalid id', async () => {
        const response = await authRequest('put', baseUrl + '/invalidId').send({
            message: 'Updated message',
            owner: 'Updated owner'
        });
        expect(response.statusCode).toBe(400);
    });
});