import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import config from "../config";
import { pool } from "../db";

const auth = () => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const token = req.headers.authorization;

            if (!token) {
                return res.status(401).json({
                    success: false,
                    message: "No token provided"
                });
            }

            const decoded = jwt.verify(
                token,
                config.secret as string
            ) as JwtPayload; // decoding the owner of the token from jwt

            // find user by id from database
            const userData = await pool.query(
                `SELECT * FROM users WHERE id = $1`,
                [decoded.id]
            );

            if (userData.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: "User not found"
                });
            }

            const user = userData.rows[0]; // token owner information from database

            // attach user to request
            (req as any).user = user;

            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid token"
            });
        }
    };
};

export default auth;