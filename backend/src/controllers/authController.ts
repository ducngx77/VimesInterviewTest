import { Request, Response } from 'express';
import * as authService from '../services/authService.js';
import { LoginResponse } from '@shared/type.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== 'string' ||
      typeof password !== 'string'
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const user = await authService.verifyUser(trimmedUsername, trimmedPassword);

    if (user) {
      const { password, ...userWithoutPassword } = user;

      return res.json({
        message: "Success!",
        user: {
          ...userWithoutPassword,
          user_id: user.user_id.toString()
        },
        token: "jwt-token-xyz"
      });
    }

    return res.status(401).json({ message: "Wrong Username or Password, pls try again!" });

  } catch (error: any) {
    return res.status(500).json({
      message: "System Error",
      detail: error.message
    });
  }
};