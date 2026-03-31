const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); // Парольді шифрлау үшін

const app = express();
const PORT = 5000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'beksh_db', // Өзіңіздің база атыңыз
    password: '1212',     // Өзіңіздің құпия сөзіңіз
    port: 5432,
});

app.use(cors());
app.use(express.json());

// ==========================================
// 1. АВТОРИЗАЦИЯ ЖӘНЕ ТІРКЕЛУ (ЖАҢА)
// ==========================================

// Тіркелу (Register)
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Пайдаланушы бар-жоғын тексеру
        const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Бұл Email немесе Пайдаланушы аты бос емес!" });
        }

        // 2. Құпия сөзді шифрлау (Hashing)
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 3. Базаға сақтау
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
        );

        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Сервердегі тіркелу қатесі" });
    }
});

// Кіру (Login)
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Пайдаланушыны Email арқылы іздеу
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Қате: Бұл пошта тіркелмеген!" });
        }

        // 2. Құпия сөзді тексеру
        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: "Қате: Құпия сөз дұрыс емес!" });
        }

        // 3. Сәтті кіру
        res.json({ id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Сервердегі авторизация қатесі" });
    }
});

// ==========================================
// 2. НӘТИЖЕЛЕРДІ САҚТАУ ЖӘНЕ АЛУ (ЕСКІ)
// ==========================================

app.get('/api/results', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM results ORDER BY date DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/results', async (req, res) => {
    try {
        const { quizId, quizTitle, score, correctCount, totalQuestions, timeSpent, username, answers } = req.body;
        const newResult = await pool.query(
            `INSERT INTO results (quiz_id, quiz_title, score, correct_count, total_questions, time_spent, username, answers) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
            [quizId, quizTitle, score, correctCount, totalQuestions, timeSpent, username, JSON.stringify(answers)]
        );
        res.json(newResult.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер қосылды: http://localhost:${PORT}`);
}); 