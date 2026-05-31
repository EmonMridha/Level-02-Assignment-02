import type { NextFunction, Request, Response } from "express";
import { pool } from "../db";

const canUpdateIssue = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const user = (req as any).user;

    const issueId = req.params.id;

    // find issue
    const issueData = await pool.query(
        `
        SELECT id, reporter_id, status
        FROM issues
        WHERE id = $1
        `,
        [issueId]
    );

    if (issueData.rows.length === 0) {
        return res.status(404).json({
            success: false,
            message: "Issue not found"
        });
    }

    const issue = issueData.rows[0];

    // maintainer can update any issue
    if (user.role === "maintainer") {
        return next();
    }

    // contributor can update own OPEN issue only
    if (
        user.role === "contributor" &&
        issue.reporter_id === user.id &&
        issue.status === "open"
    ) {
        return next();
    }

    return res.status(403).json({
        success: false,
        message: "Forbidden access"
    });
};

export default canUpdateIssue;