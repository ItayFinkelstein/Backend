import express, { Request, Response } from "express";
import authController from "../controllers/auth_controller";
import { OAuth2Client } from "google-auth-library";

const authRouter = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the user
 *         email:
 *           type: string
 *           description: The user email
 *         password:
 *           type: string
 *           description: The user password
 *         refreshTokens:
 *           type: array
 *           items:
 *             type: string
 *           description: The refresh tokens of the user
 *       example:
 *         _id: '60d21b4667d0d8992e610c85'
 *         email: 'bob@gmail.com'
 *         password: '123456'
 *         refreshTokens: []
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
 *       500:
 *         description: Some server error
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
 *               email: 'bob@gmail.com'
 *               password: '123456'
 *     responses:
 *       200:
 *         description: The user was successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       500:
 *         description: Some server error
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
 *               refreshToken: 'some-refresh-token'
 *     responses:
 *       200:
 *         description: The user was successfully logged out
 *       500:
 *         description: Some server error
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
 *               refreshToken: 'some-refresh-token'
 *     responses:
 *       200:
 *         description: The token was successfully refreshed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 *       500:
 *         description: Some server error
 */
authRouter.post("/refresh", (req: Request, res: Response) => {
  authController.refresh(req, res);
});

interface TokenPayload {
  email: string;
  name: string;
}
const googleSignIn = async (req: Request, res: Response) => {
  const token = req.body.credential;
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload() as TokenPayload;
    const email = payload?.email;
    const name = payload?.name;

    return authController.googleLoginOrRegister(email, name, res);
  } catch (error) {
    return res.status(400).send("error missing email or password");
  }
};

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
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for the authenticated user
 *                 refreshToken:
 *                   type: string
 *                   description: The refresh token for the authenticated user
 *       400:
 *         description: Invalid or missing credential
 *       500:
 *         description: Some server error
 */
authRouter.post("/google", (req, res) => {
  googleSignIn(req, res);
});

export default authRouter;
