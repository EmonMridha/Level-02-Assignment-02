import type { NextFunction, Request, Response } from "express";

const canPost = (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }

    if (!["contributor", "maintainer"].includes(user.role)) {
        return res.status(403).json({
            success: false,
            message: "only contributors and maintainers can post issues"
        });
    }

    next();
};

export default canPost;