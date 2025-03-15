import request from 'supertest';
import mongoose from 'mongoose';
import commentsModel, { IComment } from '../models/commentModel';
import testCommentsArray from './comments.json';
import { Express } from 'express';
import initApp from '../server';

let app: Express;

const testComments: IComment[] = testCommentsArray;
const baseUrl = '/comments';

type User = {
    email: string;
    password: string;
    token?: string;
    _id?: string;
}

const testUser: User = {
    email: "itayf@gmail.com",
    password: "898989",
}

beforeAll(async () => {
    app = await initApp();
    await commentsModel.deleteMany();

    await request(app).post("/auth/register").send(testUser);
    const response = await request(app).post("/auth/login").send(testUser);
    testUser.token = response.body.accessToken;
    testUser._id = response.body._id;
    expect(response.statusCode).toBe(200);
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe('Comments Test', () => {
    test('Test get all comments - no results', async () => {
        const response = await request(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(0);
    });

    test('Test create new comment', async () => {
        for (let comment of testComments) {
            const response = await request(app).post(baseUrl)
                .set("authorization", "JWT " + testUser.token)
                .send(comment);
            expect(response.statusCode).toBe(201);
            expect(response.body.message).toBe(comment.message);
            expect(response.body.postId).toBe(comment.postId);
            comment._id = response.body._id;
        }

        const response = await request(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testComments.length);
    });

    test('Test get all comments after creation', async () => {
        const response = await request(app).get(baseUrl);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(testComments.length);
    });

    test('Test get comment by id', async () => {
        const response = await request(app).get(baseUrl + '/' + testComments[0]._id);
        expect(response.statusCode).toBe(200);
        expect(response.body._id).toBe(testComments[0]._id);
    });

    test('Test filter comments by postId', async () => {
        const response = await request(app).get(baseUrl + '?postId=' + testComments[0].postId);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    });

    test('Test filter comments by owner', async () => {
        const response = await request(app).get(baseUrl + '?owner=' + testUser._id);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(3);
    });

    test('Test filter comments by owner and postId', async () => {
        const response = await request(app).get(baseUrl + '?owner=' + testUser._id + '&postId=' + testComments[0].postId);
        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBe(2);
    });

    test('Test update comment', async () => {
        const updatedComment = { ...testComments[0], message: 'Updated message' };
        const response = await request(app).put(baseUrl + '/' + testComments[0]._id).set("authorization", "JWT " + testUser.token).send(updatedComment);
        expect(response.statusCode).toBe(200);

        const responseGet = await request(app).get(baseUrl + '/' + testComments[0]._id);
        expect(responseGet.statusCode).toBe(200);
        expect(responseGet.body.message).toBe('Updated message');
    });

    test('Test delete comment', async () => {
        const response = await request(app).delete(baseUrl + '/' + testComments[0]._id).set("authorization", "JWT " + testUser.token);
        expect(response.statusCode).toBe(200);

        const responseGet = await request(app).get(baseUrl + '/' + testComments[0]._id);
        expect(responseGet.statusCode).toBe(404);
    });

    test('Test create new comment with invalid data', async () => {
        const response = await request(app).post(baseUrl).set("authorization", "JWT " + testUser.token)
            .send({
                message: 'invalid comment!',
                postId: ''
            });
        expect(response.statusCode).toBe(500);
    });

    test('Test get comment by invalid id', async () => {
        const response = await request(app).get(baseUrl + '/invalidId');
        expect(response.statusCode).toBe(400);
    });

    test('Test update comment with invalid id', async () => {
        const response = await request(app).put(baseUrl + '/invalidId').set("authorization", "JWT " + testUser.token)
            .send({
                message: 'Updated message',
                owner: 'Updated owner',
                postId: 'Updated postId'
            });
        expect(response.statusCode).toBe(400);
    });

    test('Test update comment when item not found', async () => {
        const updatedComment = { ...testComments[0], message: 'Updated message' };
        const nonExistentId = new mongoose.Types.ObjectId().toHexString();
        const response = await request(app).put(baseUrl + '/' + nonExistentId).set("authorization", "JWT " + testUser.token).send(updatedComment);
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe(`Item with id ${nonExistentId} not found`);
    });

    test('Test delete comment with invalid id', async () => {
        const response = await request(app).delete(baseUrl + '/invalidId').set("authorization", "JWT " + testUser.token);
        expect(response.statusCode).toBe(400);
    });

    test('Test delete comment when item not found', async () => {
        const nonExistentId = new mongoose.Types.ObjectId().toHexString();
        const response = await request(app).delete(baseUrl + '/' + nonExistentId).set("authorization", "JWT " + testUser.token);
        expect(response.statusCode).toBe(404);
        expect(response.text).toBe(`Item with id ${nonExistentId} not found`);
    });
});