require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/authMiddleware");

app.use(express.json());
app.use(cors());

const db = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,

    ssl: {
        minVersion: "TLSv1.2"
    }
});

db.getConnection()
    .then(connection => {
        console.log("MySQL connected successfully!");
        connection.release();
    })
    .catch(error => {
        console.error("MySQL connection failed:", error.message);
    });



app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, phone_number, password } = req.body;

        if (!name || !email || !phone_number || !password) {
            return res.status(400).json({
                error: "All fields are required"
            });
        }

        const sql = `
            SELECT user_id
            FROM users
            WHERE email = ?
        `;

        const [rows] = await db.query(sql, [email]);

        if (rows.length > 0) {
            return res.status(409).json({
                error: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const insertSql = `
            INSERT INTO users
                (name, email, phone_number, password_hash)
            VALUES
                (?, ?, ?, ?)
        `;

        const [result] = await db.query(insertSql, [
            name,
            email,
            phone_number,
            passwordHash
        ]);

        res.status(201).json({
            message: "User registered successfully",
            user_id: result.insertId
        });

    } catch (error) {
        console.error("Error registering user:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});



app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: "Email and password are required"
            });
        }

        const sql = `
            SELECT user_id, name, email, password_hash
            FROM users
            WHERE email = ?
        `;

        const [rows] = await db.query(sql, [email]);

        if (rows.length === 0) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const user = rows[0];

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password_hash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                error: "Invalid email or password"
            });
        }

        const token = jwt.sign(
            {
                user_id: user.user_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Error logging in:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});


app.get("/", (req, res) => {
    res.send("Expense Tracker API");
});

app.get("/api/top-categories", authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT
                month,
                cat_name,
                total,
                rnk
            FROM (
                SELECT
                    month,
                    cat_id,
                    total,
                    RANK() OVER (
                        PARTITION BY month
                        ORDER BY total DESC
                    ) AS rnk
                FROM (
                    SELECT
                        DATE_FORMAT(tran_date, "%Y-%m") AS month,
                        cat_id,
                        SUM(amount) AS total
                    FROM transactions
                    WHERE user_id = ?
                    GROUP BY DATE_FORMAT(tran_date, "%Y-%m"), cat_id
                ) x
            ) y
            JOIN categories c
                ON c.cat_id = y.cat_id
            WHERE y.rnk = 1
            ORDER BY month;
        `;

        const [rows] = await db.query(sql, [req.userId]);

        res.json(rows);

    } catch (error) {
        console.error("Error fetching top categories:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.get("/api/running-total", authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT
                tran_id,
                DATE_FORMAT(tran_date, "%Y-%m-%d") AS tran_date,
                amount,
                SUM(amount) OVER (
                    ORDER BY tran_date, tran_id
                ) AS running_total
            FROM transactions
            WHERE user_id = ?
            ORDER BY tran_date, tran_id;
        `;

        const [rows] = await db.query(sql, [req.userId]);

        res.json(rows);

    } catch (error) {
        console.error("Error fetching running total:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.get("/api/mom-growth", authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT
                month,
                total,
                previous_total,
                ((total - previous_total) /
                    NULLIF(previous_total, 0)) * 100 AS percentage_change
            FROM (
                SELECT
                    month,
                    total,
                    LAG(total) OVER (
                        ORDER BY month
                    ) AS previous_total
                FROM (
                    SELECT
                        DATE_FORMAT(tran_date, "%Y-%m") AS month,
                        SUM(amount) AS total
                    FROM transactions
                    WHERE user_id = ?
                    GROUP BY DATE_FORMAT(tran_date, "%Y-%m")
                ) x
            ) y
            ORDER BY month;
        `;

        const [rows] = await db.query(sql, [req.userId]);

        res.json(rows);

    } catch (error) {
        console.error("Error fetching MoM growth:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.get("/api/top-transactions", authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT
                tran_id,
                amount,
                ROUND(percentile * 100, 2) AS percentile
            FROM (
                SELECT
                    tran_id,
                    amount,
                    PERCENT_RANK() OVER (
                        ORDER BY amount ASC
                    ) AS percentile
                FROM transactions
                WHERE user_id = ?
            ) x
            ORDER BY amount DESC
            LIMIT 5;
        `;

        const [rows] = await db.query(sql, [req.userId]);

        res.json(rows);

    } catch (error) {
        console.error("Error fetching top transactions:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.post("/api/transactions", authMiddleware, async (req, res) => {
    try {
        const { cat_id, amount, tran_date } = req.body;

        const sql = `
            INSERT INTO transactions
                (user_id, cat_id, amount, tran_date)
            VALUES
                (?, ?, ?, ?)
        `;

        const [result] = await db.query(sql, [
            req.userId,
            cat_id,
            amount,
            tran_date
        ]);

        res.status(201).json({
            message: "Transaction added successfully",
            tran_id: result.insertId
        });

    } catch (error) {
        console.error("Error adding transaction:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.get("/api/categories", async (req, res) => {
    try {
        const sql = `
            SELECT cat_id, cat_name
            FROM categories
            ORDER BY cat_id
        `;

        const [rows] = await db.query(sql);

        res.json(rows);
    }
    catch (error) {
        console.error("Error fetching categories:", error.message);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.get("/api/transactions",authMiddleware, async (req,res)=>{
    try{
        const sql =`select tran_id,c.cat_id,cat_name,amount,DATE_FORMAT(tran_date, '%Y-%m-%d') AS tran_date
        from transactions t 
        join categories c 
        on t.cat_id=c.cat_id 
        where t.user_id=?
        order by tran_date desc,tran_id desc;`;
        
        const [rows] = await db.query(sql, [req.userId]);
        res.json(rows);
    }catch(error){
        console.error("Error fetching transactions:", error.message);
        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.put("/api/transactions/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;

        const { cat_id, amount, tran_date } = req.body;

        const sql = `
            UPDATE transactions
            SET
                cat_id = ?,
                amount = ?,
                tran_date = ?
            WHERE tran_id = ?
              AND user_id = ?
        `;

        const [result] = await db.query(sql, [
            cat_id,
            amount,
            tran_date,
            id,
            req.userId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction updated successfully"
        });

    } catch (error) {
        console.error("Error updating transaction:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.delete("/api/transactions/:id", authMiddleware, async (req, res) => {
    try {
        const id = req.params.id;

        const sql = `
            DELETE FROM transactions
            WHERE tran_id = ?
              AND user_id = ?
        `;

        const [result] = await db.query(sql, [
            id,
            req.userId
        ]);

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Transaction not found"
            });
        }

        res.json({
            message: "Transaction deleted successfully"
        });

    } catch (error) {
        console.error("Error deleting transaction:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.get("/api/summary", authMiddleware, async (req, res) => {
    try {
        const sql = `
            SELECT
                COALESCE(
                    SUM(
                        CASE
                            WHEN YEAR(tran_date) = YEAR(CURDATE())
                             AND MONTH(tran_date) = MONTH(CURDATE())
                            THEN amount
                            ELSE 0
                        END
                    ),
                    0
                ) AS current_month_expenses,

                COALESCE(
                    MAX(
                        CASE
                            WHEN YEAR(tran_date) = YEAR(CURDATE())
                             AND MONTH(tran_date) = MONTH(CURDATE())
                            THEN amount
                            ELSE NULL
                        END
                    ),
                    0
                ) AS highest_expense_this_month,

                COUNT(*) AS total_transactions,

                COALESCE(SUM(amount), 0) AS total_amount

            FROM transactions
            WHERE user_id = ?
        `;

        const [rows] = await db.query(sql, [req.userId]);

        res.json(rows[0]);

    } catch (error) {
        console.error("Error fetching summary:", error.message);

        res.status(500).json({
            error: "Internal Server Error"
        });
    }
});

app.listen(port, "0.0.0.0", () => {
    console.log(`Server is running on port ${port}`);
});