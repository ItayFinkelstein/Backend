import { Router } from "express";
import postsController from "../controllers/post_controller";
import { authMiddleware } from "../controllers/auth_controller";

const router = Router();

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
 *         - message
 *         - owner
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated id of the post
 *         message:
 *           type: string
 *           description: The post message
 *         owner:
 *           type: string
 *           description: The post owner
 *       example:
 *         _id: '60d21b4667d0d8992e610c85'
 *         message: 'This is a post message'
 *         owner: 'John Doe'
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
router.get("/", postsController.getAll.bind(postsController));

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
 *     responses:
 *       200:
 *         description: The list of posts with paging
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       500:
 *         description: Some server error
 */
router.get("/paging", (req, res) => {
  postsController.getWithPaging(req, res);
});

router.get("/byUser", (req, res) => {
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
router.get("/:id", (req, res) => {
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
 *       500:
 *         description: Some server error
 */
router.post(
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
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       200:
 *         description: The post was successfully updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *       500:
 *         description: Some server error
 */
router.put("/:id", authMiddleware, (req, res) => {
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
router.delete("/:id", authMiddleware, (req, res) => {
  postsController.deleteItemById(req, res);
});

export default router;
