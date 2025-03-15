import { Router } from 'express';
import commentsController from '../controllers/comment_controller';
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
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the comment
 *         message:
 *           type: string
 *           description: The comment message
 *         owner:
 *           type: string
 *           description: The comment owner
 *         postId:
 *           type: string
 *           description: The ID of the post the comment belongs to
 *       example:
 *         _id: '60d21b4667d0d8992e610c85'
 *         message: 'This is a comment message'
 *         owner: 'John Doe'
 *         postId: '60d21b4667d0d8992e610c85'
 */

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: Returns a list of all comments
 *     tags: [Comments]
 *     responses:
 *       200:
 *         description: The list of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 */
commentsRouter.get("/", commentsController.getAll.bind(commentsController));

/**
 * @swagger
 * /comments/{id}:
 *   get:
 *     summary: Get a comment by ID
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
 *         description: The comment description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 */
commentsRouter.get("/:id", (req, res) => { commentsController.getById(req, res) });

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
 *         description: Some server error
 */
commentsRouter.post("/", authMiddleware, commentsController.createItem.bind(commentsController));

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
 *             $ref: '#/components/schemas/Comment'
 *     responses:
 *       200:
 *         description: The comment was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         description: Comment not found
 *       500:
 *         description: Some server error
 */
commentsRouter.put("/:id", authMiddleware, (req, res) => { commentsController.updateItemById(req, res) });

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
 */
commentsRouter.delete("/:id", authMiddleware, (req, res) => { commentsController.deleteItemById(req, res) });

export default commentsRouter;