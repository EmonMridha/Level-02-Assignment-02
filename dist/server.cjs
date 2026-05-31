
        import {createRequire} from 'module';
        const require = createRequire(import.meta.url);
        
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/app.ts
var import_express3 = __toESM(require("express"), 1);

// src/modules/user/user.route.ts
var import_express = require("express");

// src/modules/user/user.services.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);

// src/db/index.ts
var import_pg = require("pg");

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);
import_dotenv.default.config({
  path: import_path.default.join(process.cwd(), ".env")
});
var config = {
  connection_string: process.env.CONNECTIONSTRING,
  port: process.env.PORT,
  secret: process.env.JWT_SECRET
};
var config_default = config;

// src/db/index.ts
var pool = new import_pg.Pool({
  connectionString: config_default.connection_string
});
var initDB = async () => {
  try {
    await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(20) NOT NULL,
            email VARCHAR(20) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            role VARCHAR(20) NOT NULL DEFAULT 'contributor',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            `);
    await pool.query(`
                CREATE TABLE IF NOT EXISTS issues (
                id SERIAL PRIMARY KEY,
                title VARCHAR(150) NOT NULL,
                description TEXT NOT NULL CHECK (length(trim(description))>=20),
                type VARCHAR(20) NOT NULL CHECK (type IN ('bug', 'feature_request')),
                status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
                reporter_id INT REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)
                `);
    console.log("Database connected successfully");
  } catch (error) {
    console.log(error);
  }
};

// src/modules/user/user.services.ts
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var createUserIntoDB = async (payLoad) => {
  const { name, email, password, role = "contributor" } = payLoad;
  const hashedPassword = await import_bcryptjs.default.hash(password, 10);
  if (role !== "contributor" && role !== "maintainer") {
    throw new Error("Invalid role");
  }
  const result = await pool.query(`
        INSERT INTO users(name, email, password, role)
        VALUES($1, $2, $3, $4)
        RETURNING id, name, email, role, created_at, updated_at
    `, [name, email, hashedPassword, role]);
  return result;
};
var loginUserIntoDB = async (payLoad) => {
  const { email, password } = payLoad;
  const userData = await pool.query(`
        SELECT * FROM users WHERE email = $1
        `, [email]);
  if (userData.rows.length === 0) {
    throw new Error("Invalid credentials");
  }
  const user = userData.rows[0];
  const { id, name, email: userEmail, role, created_at, updated_at } = user;
  const matchPassword = await import_bcryptjs.default.compare(password, user.password);
  if (!matchPassword) {
    throw new Error("Password not matched");
  }
  const jwtPayLoad = {
    id: user.id,
    name: user.name,
    role: user.role
  };
  const accessToken = import_jsonwebtoken.default.sign(jwtPayLoad, config_default.secret, {
    expiresIn: "1d"
  });
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
  };
};
var userService = {
  createUserIntoDB,
  loginUserIntoDB
};

// src/modules/user/user.controller.ts
var createUser = async (req, res) => {
  try {
    const result = await userService.createUserIntoDB(req.body);
    const user = result.rows[0];
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message || "Bad Request",
      errors: error?.details || error.message
    });
  }
};
var loginUser = async (req, res) => {
  try {
    const result = await userService.loginUserIntoDB(req.body);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: error.message || "Unauthorized",
      errors: error?.details || error.message
    });
  }
};
var userController = {
  createUser,
  loginUser
};

// src/modules/user/user.route.ts
var router = (0, import_express.Router)();
router.post("/signup", userController.createUser);
router.post("/login", userController.loginUser);
var userRoute = router;

// src/modules/issue/issue.route.ts
var import_express2 = require("express");

// src/modules/issue/issue.services.ts
var createIssueIntoDB = async (payLoad, id) => {
  const { title, description, type } = payLoad;
  const user = await pool.query(`
        SELECT * FROM users WHERE id = $1
    `, [id]);
  if (user.rows.length === 0) {
    throw new Error("User not found");
  }
  const result = await pool.query(`
        INSERT INTO issues (title, description, type, reporter_id) VALUES($1,$2,$3,$4) RETURNING *
        `, [title, description, type, id]);
  return result;
};
var getAllIssue = async (query) => {
  const { sort = "newest", type, status } = query;
  let sql = `SELECT * FROM issues`;
  const conditions = [];
  const values = [];
  if (type) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }
  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }
  if (conditions.length > 0) {
    sql += ` WHERE ` + conditions.join(" AND ");
  }
  if (sort === "oldest") {
    sql += ` ORDER BY created_at ASC`;
  } else {
    sql += ` ORDER BY created_at DESC`;
  }
  const issuesResult = await pool.query(sql, values);
  const issues = issuesResult.rows;
  const reporterIds = [...new Set(
    issues.map((issue) => issue.reporter_id)
  )];
  const usersResult = await pool.query(
    `SELECT id, name, role FROM users WHERE id = ANY($1)`,
    [reporterIds]
  );
  const users = usersResult.rows;
  const formattedIssues = issues.map((issue) => {
    const reporter = users.find(
      (user) => user.id === issue.reporter_id
    );
    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter: reporter || null,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  });
  return {
    rows: formattedIssues
  };
};
var getSingleIssue = async (id) => {
  const singleIssue = await pool.query(`
        SELECT * FROM issues WHERE id = $1
        `, [id]);
  const issue = singleIssue.rows[0];
  if (!issue) {
    throw new Error("Issue not found");
  }
  const userResult = await pool.query(`
        SELECT id, name, role FROM users WHERE id = $1
        `, [issue.reporter_id]);
  const reporter = userResult.rows[0];
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter: reporter || null,
    created_at: issue.created_at,
    updated_at: issue.updated_at
  };
};
var updateIssue = async (id, payLoad) => {
  const { title, description, type } = payLoad;
  const result = await pool.query(`
        UPDATE issues SET title=COALESCE($1, title), description=COALESCE($2, description), type=COALESCE($3, type) WHERE id =$4 RETURNING *
        `, [title, description, type, id]);
  return result;
};
var deleteIssue = async (id) => {
  const result = await pool.query(`
        DELETE FROM issues WHERE id = $1
        `, [id]);
  return result;
};
var issueService = {
  createIssueIntoDB,
  getAllIssue,
  getSingleIssue,
  updateIssue,
  deleteIssue
};

// src/modules/issue/issue.controller.ts
var createIssue = async (req, res) => {
  try {
    const result = await issueService.createIssueIntoDB(req.body, req.user.id);
    return res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: result.rows[0]
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message
    });
  }
};
var getAllIssue2 = async (req, res) => {
  try {
    const result = await issueService.getAllIssue(req.query);
    return res.status(200).json({
      success: true,
      message: "Issues retrieved successfully",
      data: result.rows
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message
    });
  }
};
var getSingleIssue2 = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await issueService.getSingleIssue(id);
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
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message
    });
  }
};
var updateIssue2 = async (req, res) => {
  try {
    const result = await issueService.updateIssue(req.params.id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Not found",
        errors: "No issue found with this id"
      });
    } else {
      return res.status(200).json({
        "success": true,
        "message": "Issue updated successfully",
        "data": result.rows[0]
      });
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message
    });
  }
};
var deleteIssue2 = async (req, res) => {
  try {
    const result = await issueService.deleteIssue(req.params.id);
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
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      errors: error.message
    });
  }
};
var issueController = {
  createIssue,
  getAllIssue: getAllIssue2,
  getSingleIssue: getSingleIssue2,
  updateIssue: updateIssue2,
  deleteIssue: deleteIssue2
};

// src/middleware/auth.ts
var import_jsonwebtoken2 = __toESM(require("jsonwebtoken"), 1);
var auth = () => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization;
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided"
        });
      }
      const decoded = import_jsonwebtoken2.default.verify(
        token,
        config_default.secret
      );
      const userData = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [decoded.id]
      );
      if (userData.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }
      const user = userData.rows[0];
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Invalid token"
      });
    }
  };
};
var auth_default = auth;

// src/middleware/canUpdate.ts
var canUpdateIssue = async (req, res, next) => {
  const user = req.user;
  const issueId = req.params.id;
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
  if (user.role === "maintainer") {
    return next();
  }
  if (user.role === "contributor" && issue.reporter_id === user.id && issue.status === "open") {
    return next();
  }
  return res.status(403).json({
    success: false,
    message: "Forbidden access"
  });
};
var canUpdate_default = canUpdateIssue;

// src/middleware/canPostIssue.ts
var canPost = (req, res, next) => {
  const user = req.user;
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
var canPostIssue_default = canPost;

// src/middleware/canDelete.ts
var isMaintainer = () => {
  return (req, res, next) => {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }
    if (user.role !== "maintainer") {
      return res.status(403).json({
        success: false,
        message: "Only maintainers can access this route"
      });
    }
    next();
  };
};
var canDelete_default = isMaintainer;

// src/modules/issue/issue.route.ts
var router2 = (0, import_express2.Router)();
router2.post("/", auth_default(), canPostIssue_default, issueController.createIssue);
router2.get("/", issueController.getAllIssue);
router2.get("/:id", issueController.getSingleIssue);
router2.patch("/:id", auth_default(), canUpdate_default, issueController.updateIssue);
router2.delete("/:id", auth_default(), canDelete_default(), issueController.deleteIssue);
var issueRoute = router2;

// src/app.ts
var import_cors = __toESM(require("cors"), 1);
var app = (0, import_express3.default)();
app.use(import_express3.default.json());
app.use(import_express3.default.text());
app.use(import_express3.default.urlencoded({ extended: true }));
app.use((0, import_cors.default)({
  origin: "http://localhost:5000"
}));
app.get("/", (req, res) => {
  res.status(200).json({
    message: "hello bro"
  });
});
app.use("/api/auth", userRoute);
app.use("/api/issues", issueRoute);
var app_default = app;

// src/server.ts
var main = () => {
  initDB();
  app_default.listen(config_default.port, () => {
    console.log(`Example app listening on port ${config_default.port}`);
  });
};
main();
//# sourceMappingURL=server.cjs.map