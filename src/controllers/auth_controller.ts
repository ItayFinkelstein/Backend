import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt, { SignOptions } from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const wrongDetails = "wrong email or password";
const missingDetails = "missing email or password";

const NORMAL_USER = "normal";
const GOOGLE_USER = "google";

const googleAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

type TokenPayload = {
  _id: string;
};

interface GoogleTokenPayload {
  email: string;
  name: string;
}

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

interface UserWithRequiredId extends Omit<IUser, "_id"> {
  _id: string; // make the '_id' field required
}

const generateTokens = (_id: string): Tokens | null => {
  const tokenSignRandom = Math.floor(Math.random() * 10000000000);
  const tokenSecret: string = process.env.TOKEN_SECRET as string;

  if (!tokenSecret) {
    return null;
  }

  const accessToken = jwt.sign(
    {
      _id: _id,
      tokenSignRandom: tokenSignRandom,
    },
    tokenSecret,
    { expiresIn: process.env.TOKEN_EXPIRATION || "1h" } as SignOptions
  );

  const refreshToken = jwt.sign(
    {
      _id: _id,
      tokenSignRandom: tokenSignRandom,
    },
    tokenSecret,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || "7d" } as SignOptions
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token: string, secret: string): Promise<TokenPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        return reject(err);
      }

      resolve(decoded as TokenPayload);
    });
  });
};

const invalidateUserTokens = async (user: any, refreshToken: string) => {
  if (user) {
    user.refreshTokens = [];
    await user.save();
  }
};

const register = async (req: Request, res: Response) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send(missingDetails);
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await userModel.create({
      name: name,
      email: email,
      password: hashedPassword,
    });
    return res.status(200).send(user);
  } catch (error) {
    return res.status(400).send(error);
  }
};

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  console.log("middleware", token);

  if (!token) {
    res.status(401).send("missing token");
  } else if (!process.env.TOKEN_SECRET) {
    res.status(400).send("missing auth configuration");
  } else {
    jwt.verify(token, process.env.TOKEN_SECRET, (err, data) => {
      if (err) {
        res.status(403).send("invalid token");
        return;
      }

      const payload = data as TokenPayload;
      req.query.userId = payload._id;

      next();
    });
  }
};

class AuthController {
  async register(req: Request, res: Response) {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;
    if (!email || !password) {
      return res.status(400).send(missingDetails);
    }
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await userModel.create({
        name: name,
        email: email,
        password: hashedPassword,
        type: NORMAL_USER,
      });
      return res.status(200).send(user);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  async login(req: Request, res: Response) {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).send(wrongDetails);
    }

    try {
      const user = await userModel.findOne({ email: email, type: NORMAL_USER });
      if (!user) {
        return res.status(400).send(wrongDetails);
      }

      const isValidPassword = await bcrypt.compare(password, user.password!);
      if (!isValidPassword) {
        return res.status(400).send(wrongDetails);
      }

      generateTokensForLogin(user, res);
    } catch (error) {
      return res.status(400).send(error);
    }
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) {
      return res.status(400).send("missing refresh token");
    }

    if (!process.env.TOKEN_SECRET) {
      return res.status(400).send("missing auth configuration");
    }
    try {
      const payload = await verifyToken(refreshToken, process.env.TOKEN_SECRET);
      const user = await userModel.findOne({ _id: payload._id });
      if (
        !user ||
        !user.refreshTokens ||
        !user.refreshTokens.includes(refreshToken)
      ) {
        await invalidateUserTokens(user, refreshToken);
        return res.status(400).send("invalid token");
      }

      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );
      await user.save();
      res.status(200).send("logged out");
    } catch (error) {
      res.status(403).send("invalid token");
    }
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).send("invalid token");
    }
    if (!process.env.TOKEN_SECRET) {
      return res.status(400).send("missing auth configuration");
    }

    try {
      const payload = await verifyToken(refreshToken, process.env.TOKEN_SECRET);
      const user = await userModel.findOne({ _id: payload._id });
      if (
        !user ||
        !user.refreshTokens ||
        !user.refreshTokens.includes(refreshToken)
      ) {
        await invalidateUserTokens(user, refreshToken);
        return res.status(400).send("invalid token");
      }

      const newTokens = generateTokens(user._id);
      user.refreshTokens = user.refreshTokens.filter(
        (token) => token !== refreshToken
      );

      if (newTokens) {
        user.refreshTokens.push(newTokens.refreshToken);
        await user.save();

        return res.status(200).send(newTokens);
      } else {
        return res.status(400).send("missing auth configuration");
      }
    } catch (err) {
      return res.status(403).send("invalid token");
    }
  }

  async googleLoginOrRegister(email: string, name: string, res: Response) {
    try {
      let user = await userModel.findOne({ email, type: GOOGLE_USER });
      if (!user) {
        user = await userModel.create({
          email,
          name,
          type: GOOGLE_USER,
        });
      }

      generateTokensForLogin({ ...user.toObject(), name: user.email }, res);
    } catch (error) {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async googleSignIn(req: Request, res: Response) {
    const token = req.body.credential;
    try {
      const ticket = await googleAuthClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload() as GoogleTokenPayload;
      const email = payload?.email;
      const name = payload?.name;

      return this.googleLoginOrRegister(email, name, res);
    } catch (error) {
      return res.status(400).send("error missing email or password");
    }
  }
}

async function generateTokensForLogin(
  user: UserWithRequiredId,
  res: Response<any, Record<string, any>>
) {
  const tokens = generateTokens(user._id);
  if (!tokens) {
    return res.status(400).send("missing auth configuration");
  }

  if (user.refreshTokens == null) {
    user.refreshTokens = [];
  }
  user.refreshTokens.push(tokens.refreshToken);
  await userModel.findByIdAndUpdate(user._id, user, { new: true });
  res.status(200).send({
    _id: user._id,
    email: user.email,
    accessToken: tokens.accessToken,
    refreshToken: tokens.refreshToken,
    name: user.name,
  });
}

const authController = new AuthController();
export default authController;
