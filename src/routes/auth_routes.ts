import express, { Request, Response } from "express";
import authController from "../controllers/auth_controller";

const authRouter = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The Authentication API
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         name:
 *           type: string
 *           description: The user's name
 *         email:
 *           type: string
 *           description: The user's email
 *         password:
 *           type: string
 *           description: The user's password
 *         iconImage:
 *           type: string
 *           description: The user's avatar URL
 *         refreshTokens:
 *           type: array
 *           items:
 *             type: string
 *           description: The refresh tokens of the user
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         name: "John Doe"
 *         email: "bob@gmail.com"
 *         password: "123456"
 *         iconImage: "https://example.com/avatar.jpg"
 *         refreshTokens: []
 *     Tokens:
 *       type: object
 *       properties:
 *         accessToken:
 *           type: string
 *           description: The JWT access token
 *         refreshToken:
 *           type: string
 *           description: The refresh token
 *       example:
 *         accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: The user was successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Internal server error
 */
authRouter.post("/register", (req: Request, res: Response) => {
  authController.register(req, res);
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             example:
 *               email: "bob@gmail.com"
 *               password: "123456"
 *     responses:
 *       200:
 *         description: The user was successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
authRouter.post("/login", (req: Request, res: Response) => {
  authController.login(req, res);
});

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: "some-refresh-token"
 *     responses:
 *       200:
 *         description: The user was successfully logged out
 *       400:
 *         description: Missing or invalid refresh token
 *       500:
 *         description: Internal server error
 */
authRouter.post("/logout", (req: Request, res: Response) => {
  authController.logout(req, res);
});

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh a user's token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *             example:
 *               refreshToken: "some-refresh-token"
 *     responses:
 *       200:
 *         description: The token was successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Internal server error
 */
authRouter.post("/refresh", (req: Request, res: Response) => {
  authController.refresh(req, res);
});

/**
 * @swagger
 * /auth/google:
 *   post:
 *     summary: Authenticate a user using Google OAuth
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               credential:
 *                 type: string
 *                 description: The Google OAuth credential (ID token)
 *             example:
 *               credential: "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
 *     responses:
 *       200:
 *         description: The user was successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Tokens'
 *       400:
 *         description: Invalid or missing credential
 *       500:
 *         description: Internal server error
 */
authRouter.post("/google", (req: Request, res: Response) => {
  authController.googleSignIn(req, res);
});

export default authRouter;
