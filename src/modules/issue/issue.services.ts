import { pool } from "../../db"

const createIssueIntoDB = async (payLoad: { title: string; description: string; type: "bug" | "feature" | "task" }, id: string) => {

    const { title, description, type } = payLoad

    // Checking if the user exists
    const user = await pool.query(`
        SELECT * FROM users WHERE id = $1
    `, [id])

    if (user.rows.length === 0) {
        throw new Error("User not found")
    }

    // inserting the issue in the database
    const result = await pool.query(`
        INSERT INTO issues (title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING *
        `, [title, description, type, id])
    return result
}

const getAllIssue = async (query: any) => {

    const { sort = 'newest', type, status } = query

    let sql = `SELECT * FROM issues`
    const conditions = []
    const values = []

    // filter type
    if (type) {
        values.push(type)
        conditions.push(`type = $${values.length}`)
    }

    // filter status
    if (status) {
        values.push(status)
        conditions.push(`status = $${values.length}`)
    }

    // add WHERE
    if (conditions.length > 0) {
        sql += ` WHERE ` + conditions.join(' AND ')
    }

    // sorting
    if (sort === 'oldest') {
        sql += ` ORDER BY created_at ASC`
    } else {
        sql += ` ORDER BY created_at DESC`
    }

    // get issues
    const issuesResult = await pool.query(sql, values)

    const issues = issuesResult.rows

    // get all reporter ids
    const reporterIds = [...new Set(
        issues.map(issue => issue.reporter_id)
    )]

    // fetch all reporters
    const usersResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = ANY($1)`,
        [reporterIds]
    )

    const users = usersResult.rows

    // attach reporter info
    const formattedIssues = issues.map(issue => {

        const reporter = users.find(
            user => user.id === issue.reporter_id
        )

        return {
            id: issue.id,
            title: issue.title,
            description: issue.description,
            type: issue.type,
            status: issue.status,
            reporter: reporter || null,
            created_at: issue.created_at,
            updated_at: issue.updated_at
        }
    })

    return {
        rows: formattedIssues
    }
}

const getSingleIssue = async (id: string) => {
    // getting the single issue
    const singleIssue = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        `, [id])

    const issue = singleIssue.rows[0]

    if (!issue) {
        throw new Error('Issue not found')
    }

    // getting reporter 
    const userResult = await pool.query(`
        SELECT id, name, role FROM users WHERE id = $1
        `, [issue.reporter_id])

    const reporter = userResult.rows[0]


    return {
        id: issue.id,
        title: issue.title,
        description: issue.description,
        type: issue.type,
        status: issue.status,

        reporter: reporter || null,

        created_at: issue.created_at,
        updated_at: issue.updated_at
    }
}

const updateIssue = async (id: string, payLoad: { title?: string; description?: string; type?: "bug" | "feature" | "task"; }) => {
    const { title, description, type } = payLoad

    const result = await pool.query(`
        UPDATE issues SET title=COALESCE($1, title), description=COALESCE($2, description), type=COALESCE($3, type) WHERE id =$4 RETURNING *
        `, [title, description, type, id])

    return result
}

const deleteIssue = async (id: string) => {
    const result = await pool.query(`
        DELETE FROM issues WHERE id = $1
        `, [id])
    return result
}

export const issueService = {
    createIssueIntoDB,
    getAllIssue,
    getSingleIssue,
    updateIssue,
    deleteIssue
}