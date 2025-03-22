import { Router } from "express";
import commentsController from "../controllers/comment_controller";
import { authMiddleware } from "../controllers/auth_controller";

const commentsRouter: Router = Router();

/**
 * @swagger
 * tags:
 *   name: Comments
 *   description: The Comments API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       required:
 *         - message
 *         - owner
 *         - postId
 *         - publishDate
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the comment
 *         message:
 *           type: string
 *           description: The comment message
 *         owner:
 *           type: string
 *           description: The comment owner
 *         postId:
 *           type: string
 *           description: The ID of the post the comment belongs to
 *         publishDate:
 *           type: string
 *           format: date-time
 *           description: The date the comment was published
 *       example:
 *         _id: "60d21b4667d0d8992e610c85"
 *         message: "This is a comment message"
 *         owner: "John Doe"
 *         postId: "60d21b4667d0d8992e610c85"
 *         publishDate: "2025-03-22T12:00:00.000Z"
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Retrieve a list of all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: A list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Internal server error
 */
commentsRouter.get("/", commentsController.getAll.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Retrieve a comment by ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: The comment details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
commentsRouter.get("/:id", (req, res) => {
  commentsController.getById(req, res);
});

/**
 * @swagger
 * /comments/post/{id}:
 *   get:
 *     summary: Retrieve comments by Post ID
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The Post ID
 *     responses:
 *       200:
 *         description: A list of comments for the specified post
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Invalid Post ID
 *       500:
 *         description: Internal server error
 */
commentsRouter.get("/post/:id", (req, res) => {
  commentsController.getByPostId(req, res);
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a new comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       201:
 *         description: The comment was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       500:
 *         description: Internal server error
 */
commentsRouter.post(
  "/",
  authMiddleware,
  commentsController.createItem.bind(commentsController)
);

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: The updated comment message
 *               owner:
 *                 type: string
 *                 description: The updated comment owner
 *               postId:
 *                 type: string
 *                 description: The ID of the post the comment belongs to
 *               publishDate:
 *                 type: string
 *                 format: date-time
 *                 description: The updated publish date of the comment
 *             example:
 *               message: "Updated comment message"
 *               owner: "Jane Doe"
 *               postId: "60d21b4667d0d8992e610c85"
 *               publishDate: "2025-03-23T12:00:00.000Z"
 *     responses:
 *       200:
 *         description: The comment was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       400:
 *         description: Invalid ObjectId
 *       500:
 *         description: Internal server error
 */
commentsRouter.put("/:id", authMiddleware, (req, res) => {
  commentsController.updateItemById(req, res);
});

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete a comment by ID
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The comment ID
 *     responses:
 *       200:
 *         description: The comment was successfully deleted
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Internal server error
 */
commentsRouter.delete("/:id", authMiddleware, (req, res) => {
  commentsController.deleteItemById(req, res);
});

export default commentsRouter;
