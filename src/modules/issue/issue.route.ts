import { Router } from "express";
import { issueController } from "./issue.controller";
import auth from "../../middleware/auth";
import canUpdateIssue from "../../middleware/canUpdate";
import canPost from "../../middleware/canPostIssue";
import isMaintainer from "../../middleware/canDelete";

const router = Router()

router.post('/', auth(), canPost, issueController.createIssue)
router.get('/', issueController.getAllIssue)
router.get('/:id', issueController.getSingleIssue)
router.patch('/:id', auth(), canUpdateIssue, issueController.updateIssue)
router.delete('/:id', auth(),isMaintainer(), issueController.deleteIssue)

export const issueRoute = router