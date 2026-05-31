import bcrypt from "bcryptjs";
import { pool } from "../../db"
import jwt from "jsonwebtoken"
import config from "../../config";

const createUserIntoDB = async (payLoad: {
    name: string;
    email: string;
    password: string;
    role: string;
}) => {

    const { name, email, password, role = "contributor" } = payLoad;

    const hashedPassword = await bcrypt.hash(password, 10);

    // validate role
    if (role !== "contributor" && role !== "maintainer") {
        throw new Error("Invalid role")
    }

    const result = await pool.query(`
        INSERT INTO users(name, email, password, role)
        VALUES($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at
    `, [name, email, hashedPassword, role])

    return result
}

const loginUserIntoDB = async (payLoad: { email: string, password: string }) => {
    const { email, password } = payLoad

    // check if the uer exists
    const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `, [email])

    if (userData.rows.length === 0) {
        throw new Error('Invalid credentials')
    }

    const user = userData.rows[0]
    const { id, name, email: userEmail, role, created_at, updated_at } = user

    const matchPassword = await bcrypt.compare(password, user.password)

    if (!matchPassword) {
        throw new Error('Password not matched')
    }

    // generate token
    const jwtPayLoad = {
        id: user.id,
        name: user.name,
        role: user.role
    }

    const accessToken = jwt.sign(jwtPayLoad, config.secret as string, {
        expiresIn: '1d'
    })

    return {
        token: accessToken,
        user: {
            id,
            name,
            email: userEmail,
            role,
            created_at,
            updated_at
        }
    }
}

export const userService = {
    createUserIntoDB,
    loginUserIntoDB
}