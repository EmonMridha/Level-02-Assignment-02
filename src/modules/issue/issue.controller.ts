import type { Request, Response } from "express"
import { issueService } from "./issue.services"

const createIssue = async (req: Request, res: Response) => {
    try {
        const result = await issueService.createIssueIntoDB(req.body, (req as any).user.id);
        return res.status(201).json({
            success: true,
            message: "Issue created successfully",
            data: result.rows[0]
        })

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: error.message
        })
    }
}

const getAllIssue = async (req: Request, res: Response) => {
    try {
        const result = await issueService.getAllIssue(req.query)
        return res.status(200).json({
            success: true,
            message: "Issues retrieved successfully",
            data: result.rows
        })
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: error.message
        })
    }
}

const getSingleIssue = async (req: Request, res: Response) => {
    const { id } = req.params
    try {
        const result = await issueService.getSingleIssue(id as string);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
                errors: "No issue found with this id"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Issue retrieved successfully",
            data: result
        })

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: error.message
        })
    }
}

const updateIssue = async (req: Request, res: Response) => {
    try {
        const result = await issueService.updateIssue(req.params.id as string, req.body)

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Not found",
                errors: "No issue found with this id"
            })
        } else {
            return res.status(200).json({
                "success": true,
                "message": "Issue updated successfully",
                "data": result.rows[0]
            })
        }
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: error.message
        })
    }
}

const deleteIssue = async (req: Request, res: Response) => {
    try {
        const result = await issueService.deleteIssue(req.params.id as string);

        if (result.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Issue not found",
                errors: "No issue found with this id"
            });
        }
        return res.status(200).json({
            success: true,
            message: "Issue deleted successfully",
            data: "Issue with id " + req.params.id + " has been deleted"
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: error.message
        });
    }
};

export const issueController = {
    createIssue,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
}