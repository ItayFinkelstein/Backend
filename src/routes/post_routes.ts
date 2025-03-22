import { Router } from "express";
import postsController from "../controllers/post_controller";
import { authMiddleware } from "../controllers/auth_controller";

const postRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Posts
 *   description: The Posts API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - message
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the post
 *         title:
 *           type: string
 *           description: The title of the post
 *         message:
 *           type: string
 *           description: The post message
 *         owner:
 *           type: string
 *           description: The post owner
 *         publishDate:
 *           type: string
 *           format: date-time
 *           description: The date the post was published
 *       example:
 *         _id: '60d21b4667d0d8992e610c85'
 *         title: 'My First Post'
 *         message: 'This is a post message'
 *         owner: 'John Doe'
 *         publishDate: '2025-03-22T12:00:00.000Z'
 */

/**
 * @swagger
 * /post:
 *   get:
 *     summary: Returns a list of all posts
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: The list of posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 */
postRouter.get("/", postsController.getAll.bind(postsController));

/** IMPORTANT: This route must be before the get by id route, otherwise
 * the router mistakes it for that and does it instead.  */
/**
 * @swagger
 * /post/paging:
 *   get:
 *     summary: Get posts with paging
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         required: false
 *         description: The page number
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: false
 *         description: The ID of the user to filter posts by
 *     responses:
 *       200:
 *         description: The list of posts with paging
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Post'
 *                 hasNextPage:
 *                   type: boolean
 *                   description: Indicates if there are more pages
 *       500:
 *         description: Some server error
 */
postRouter.get("/paging", (req, res) => {
  postsController.getWithPaging(req, res);
});

/**
 * @swagger
 * /post/byUser:
 *   get:
 *     summary: Get posts by a specific user
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to filter posts by
 *     responses:
 *       200:
 *         description: The list of posts by the user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing or invalid userId
 *       500:
 *         description: Some server error
 */
postRouter.get("/byUser", (req, res) => {
  postsController.getByUser(req, res);
});

/**
 * @swagger
 * /post/{id}:
 *   get:
 *     summary: Get a post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post description by ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 */
postRouter.get("/:id", (req, res) => {
  postsController.getById(req, res);
});

/**
 * @swagger
 * /post:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: The post was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing or invalid input
 *       500:
 *         description: Some server error
 */
postRouter.post(
  "/",
  authMiddleware,
  postsController.createItem.bind(postsController)
);

/**
 * @swagger
 * /post/{id}:
 *   put:
 *     summary: Update a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the post
 *               message:
 *                 type: string
 *                 description: The post message
 *               owner:
 *                 type: string
 *                 description: The post owner
 *             required:
 *               - title
 *               - message
 *               - owner
 *             example:
 *               title: "Updated Post Title"
 *               message: "Updated post message"
 *               owner: "Jane Doe"
 *     responses:
 *       200:
 *         description: The post was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing or invalid input
 *       404:
 *         description: Post not found
 *       500:
 *         description: Some server error
 */
postRouter.put("/:id", authMiddleware, (req, res) => {
  postsController.updateItemById(req, res);
});

/**
 * @swagger
 * /post/{id}:
 *   delete:
 *     summary: Delete a post by ID
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The post ID
 *     responses:
 *       200:
 *         description: The post was successfully deleted
 *       404:
 *         description: Post not found
 */
postRouter.delete("/:id", authMiddleware, (req, res) => {
  postsController.deleteItemById(req, res);
});

export default postRouter;
