import express, { type Application, type Request, type Response } from "express"
import { userRoute } from "./modules/user/user.route";
import { issueRoute } from "./modules/issue/issue.route";
import cors from "cors";
const app: Application = express()

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }))

app.use(cors({
    origin: 'http://localhost:5000'
}))

app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
        message: 'hello bro'
    })
})

app.use('/api/auth', userRoute)
app.use('/api/issues', issueRoute)


export default app