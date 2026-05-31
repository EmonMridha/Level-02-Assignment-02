import type { Request, Response } from "express";
import { userService } from "./user.services";

const createUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.createUserIntoDB(req.body);

        const user = result.rows[0];

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user
        });

    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message: error.message || "Bad Request",
            errors: error?.details || error.message
        });
    }
};

const loginUser = async (req: Request, res: Response) => {
    try {
        const result = await userService.loginUserIntoDB(req.body);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });

    } catch (error: any) {
        return res.status(401).json({
            success: false,
            message: error.message || "Unauthorized",
            errors: error?.details || error.message
        });
    }
};

export const userController = {
    createUser,
    loginUser
};