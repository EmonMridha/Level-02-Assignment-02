import type { NextFunction, Request, Response } from "express";

const isMaintainer = () => {
    return (req: Request, res: Response, next: NextFunction) => {
        const user = (req as any).user;

        // check if user exists in request
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        // check role
        if (user.role !== "maintainer") {
            return res.status(403).json({
                success: false,
                message: "Only maintainers can access this route"
            });
        }

        next();
    };
};

export default isMaintainer;