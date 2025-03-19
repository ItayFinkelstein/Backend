import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Express } from "express";
import path from "path";
import fs from "fs/promises";

let app: Express;

beforeAll(async () => {
    app = await initApp();
});

afterAll(() => {
    mongoose.connection.close();
});

describe("File Tests", () => {
    test("upload file", async () => {
        const filePath = path.join(__dirname, 'test_file.txt');

        try {
            const response = await request(app)
                .post("/file")
                .attach('file', filePath);

            expect(response.statusCode).toEqual(200);

            let url = response.body.url;
            url = url.replace(/^.*\/\/[^/]+/, '');
            const res = await request(app).get(url);
            expect(res.statusCode).toEqual(200);
            expect(res.text).toContain("Test file for the upload file routes!");

            // Clean up the uploaded file
            const uploadedFilePath = path.join(__dirname, '../../storage', path.basename(url));
            await fs.unlink(uploadedFilePath);
            console.log(`Deleted file: ${uploadedFilePath}`);
        } catch (err) {
            console.log('Error:', err);
            expect(1).toEqual(2);
        }
    });
});