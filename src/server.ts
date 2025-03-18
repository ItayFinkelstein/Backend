import express, { Express } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import indexRouter from "./routes/index";
import postRouter from "./routes/post_routes";
import commentRouter from "./routes/comment_routes";
import authRouter from "./routes/auth_routes";
import userRouter from "./routes/user_routes";
import mongoose from "mongoose";
import swaggerUI from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";

dotenv.config();

const initApp = async (): Promise<Express> => {
  return new Promise<Express>(async (resolve, reject) => {
    const app = express();

    app.use((req, res, next) => {
      res.header("Access-Control-Allow-Origin", "*");
      res.header("Access-Control-Allow-Methods", "*");
      res.header("Access-Control-Allow-Headers", "*");
      next();
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use("/", indexRouter);
    app.use("/post", postRouter);
    app.use("/comments", commentRouter);
    app.use("/auth", authRouter);
    app.use("/user", userRouter);

    const db = mongoose.connection;
    db.on("error", (error) =>
      console.error("Error connecting to Database: " + error)
    );
    db.once("open", () => console.log("Connected to Database"));

    if (process.env.DB_CONNECTION == undefined) {
      reject(new Error("DB_CONNECTION is not defined in .env file"));
    } else {
      await mongoose.connect(process.env.DB_CONNECTION);
      if (process.env.NODE_ENV == "development") {
        const options = {
          definition: {
            openapi: "3.0.0",
            info: {
              title: "Fullstack project",
              version: "1.0.0",
              description:
                "Project of posts and comments, with user authentication",
            },
            servers: [{ url: "http://localhost:3000" }],
          },
          apis: ["./src/routes/*.ts"],
        };
        const specs = swaggerJsDoc(options);
        app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));
      }

      resolve(app);
    }
  });
};

export default initApp;
