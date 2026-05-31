import { Router, type Request, type Response } from "express";
import { userController } from "./user.controller";

const router = Router()

router.post('/signup', userController.createUser)
router.post('/login', userController.loginUser)
export const userRoute = router