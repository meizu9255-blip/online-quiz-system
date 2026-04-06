const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const bcrypt = require('bcrypt'); 

const app = express();
const PORT = process.env.PORT || 5000;

// Render-ден DATABASE_URL келсе соны қолданады, әйтпесе локалды (localhost) базаға қосылады
const pool = new Pool(
    process.env.DATABASE_URL 
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
      }
    : {
        user: 'postgres',
        host: 'localhost',
        database: 'beksh_db', 
        password: '1212',     
        port: 5432,
      }
);

app.use(cors());
app.use(express.json());

// ==========================================
// 0. ДЕРЕКҚОРДЫ АВТОМАТТЫ ИНИЦИАЛИЗАЦИЯЛАУ
// ==========================================
const initDatabase = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL
            );
            CREATE TABLE IF NOT EXISTS quizzes (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                category VARCHAR(255),
                difficulty VARCHAR(50),
                questions JSONB
            );
            CREATE TABLE IF NOT EXISTS results (
                id SERIAL PRIMARY KEY,
                quiz_id INTEGER,
                quiz_title VARCHAR(255),
                category VARCHAR(255) DEFAULT 'Жалпы',
                score NUMERIC,
                correct_count INTEGER,
                total_questions INTEGER,
                time_spent VARCHAR(50),
                username VARCHAR(255),
                user_id INTEGER,
                answers JSONB,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS leaderboard (
                user_id INTEGER PRIMARY KEY,
                total_xp INTEGER,
                quizzes_passed INTEGER,
                average_score NUMERIC,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS mistakes (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) NOT NULL,
                category VARCHAR(255) DEFAULT 'Жалпы',
                question TEXT NOT NULL,
                options JSONB NOT NULL,
                correct_answer TEXT NOT NULL,
                UNIQUE(username, question)
            );
        `);
        // Ескі база болса, category қосу
        await pool.query(`ALTER TABLE results ADD COLUMN IF NOT EXISTS category VARCHAR(255) DEFAULT 'Жалпы';`);
        console.log('✅ Дерекқор құрылымы (5 кесте) толық орнатылды және жұмысқа дайын!');
    } catch (error) {
        console.error('Дерекқорды жүктеуде қате кетті:', error.message);
    }
};

initDatabase();

// ==========================================
// 1. АВТОРИЗАЦИЯ ЖӘНЕ ТІРКЕЛУ
// ==========================================


app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Бұл Email немесе Пайдаланушы аты бос емес!" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

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


app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({ error: "Қате: Бұл пошта тіркелмеген!" });
        }

        const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!validPassword) {
            return res.status(400).json({ error: "Қате: Құпия сөз дұрыс емес!" });
        }

        res.json({ id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Сервердегі авторизация қатесі" });
    }
});


// ==========================================
// 2. НӘТИЖЕЛЕРДІ САҚТАУ ЖӘНЕ АЛУ
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
        const { quizId, quizTitle, category, score, correctCount, totalQuestions, timeSpent, username, answers } = req.body;
        
        // 1. Нәтижені results кестесіне сақтау
        const newResult = await pool.query(
            `INSERT INTO results (quiz_id, quiz_title, category, score, correct_count, total_questions, time_spent, username, answers) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
            [quizId, quizTitle, category || 'Жалпы', score, correctCount, totalQuestions, timeSpent, username, JSON.stringify(answers)]
        );

        // 2. Қателескен сұрақтарды mistakes кестесіне сақтау
        if (answers && answers.length > 0) {
            for (let ans of answers) {
                if (ans.isCorrect === false) {
                    try {
                        await pool.query(
                            `INSERT INTO mistakes (username, category, question, options, correct_answer)
                             VALUES ($1, $2, $3, $4, $5)
                             ON CONFLICT (username, question) DO NOTHING`,
                            [username, category || 'Жалпы', ans.question, JSON.stringify(ans.options), ans.correctAnswer]
                        );
                    } catch (e) {
                        console.error('Қатені сақтауда ақау шықты:', e.message);
                    }
                }
            }
        }

        res.json(newResult.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// 2.5 ИНТЕЛЛЕКТУАЛДЫ АНАЛИТИКА ЖӘНЕ ҚАТЕМЕН ЖҰМЫС
// ==========================================

app.get('/api/analytics/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Пайдаланушының тапсырған тесттерінің статистикасы
        const results = await pool.query('SELECT category, score FROM results WHERE username = $1', [username]);
        
        // Категориялар бойынша орташа ұпай есептеу (Radar Chart үшін)
        const categoryMap = {};
        results.rows.forEach(r => {
            const cat = r.category || 'Жалпы';
            if (!categoryMap[cat]) categoryMap[cat] = { total: 0, count: 0 };
            categoryMap[cat].total += Number(r.score);
            categoryMap[cat].count += 1;
        });

        const radarData = Object.keys(categoryMap).map(key => ({
            subject: key,
            A: Math.round(categoryMap[key].total / categoryMap[key].count),
            fullMark: 100
        }));

        // Қателескен сұрақтар санын алу
        const mistakes = await pool.query('SELECT COUNT(*) FROM mistakes WHERE username = $1', [username]);

        res.json({ radarData, totalMistakes: parseInt(mistakes.rows[0].count) });
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/smart-quiz/:username', async (req, res) => {
    try {
        const { username } = req.params;
        
        // Базадан рандомды 10 қатені алу
        const mistakes = await pool.query('SELECT * FROM mistakes WHERE username = $1 ORDER BY RANDOM() LIMIT 10', [username]);
        
        if (mistakes.rows.length === 0) {
            return res.status(404).json({ error: "Қателескен сұрақтар табылмады!" });
        }

        // Кәдімгі Quiz форматына айналдыру
        const questions = mistakes.rows.map(m => {
            const options = typeof m.options === 'string' ? JSON.parse(m.options) : m.options;
            return {
                question: m.question,
                options: options,
                correctAnswer: options.indexOf(m.correct_answer)
            };
        });

        const smartQuiz = {
            id: 'smart-quiz',
            title: '🔥 Менің Қателерім (Smart Quiz)',
            category: 'Қатемен жұмыс',
            difficulty: 'Индивидуальды',
            timeLimit: questions.length * 60,
            questions: questions
        };

        res.json(smartQuiz);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// ==========================================
// 3. ТЕСТТЕРДІ БАСҚАРУ (REST API АДМИН ПАНЕЛЬ ҮШІН)
// ==========================================


app.get('/api/quizzes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM quizzes ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.post('/api/quizzes', async (req, res) => {
    try {
        const { title, category, difficulty, questions } = req.body;
        const newQuiz = await pool.query(
            'INSERT INTO quizzes (title, category, difficulty, questions) VALUES ($1, $2, $3, $4) RETURNING *',
            [title, category, difficulty, JSON.stringify(questions)]
        );
        res.status(201).json(newQuiz.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Тестті қосу кезінде қате шықты" });
    }
});


app.put('/api/quizzes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, category, difficulty, questions } = req.body;
        const updateQuiz = await pool.query(
            'UPDATE quizzes SET title = $1, category = $2, difficulty = $3, questions = $4 WHERE id = $5 RETURNING *',
            [title, category, difficulty, JSON.stringify(questions), id]
        );

        if (updateQuiz.rows.length === 0) {
            return res.status(404).json({ error: "Тест табылмады" });
        }
        res.json(updateQuiz.rows[0]);
    } catch (err) {
        res.status(500).json({ error: "Тестті жаңарту кезінде қате шықты" });
    }
});


app.delete('/api/quizzes/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleteQuiz = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING *', [id]);
        
        if (deleteQuiz.rows.length === 0) {
            return res.status(404).json({ error: "Тест табылмады" });
        }
        res.json({ message: "Тест сәтті өшірілді!" });
    } catch (err) {
        res.status(500).json({ error: "Тестті өшіру кезінде қате шықты" });
    }
});


app.listen(PORT, () => {
    console.log(`Сервер қосылды: http://localhost:${PORT}`);
});
app.post('/api/results', async (req, res) => {
    try {
        const { quizId, quizTitle, score, correctCount, timeSpent, username, answers } = req.body;


        const userQuery = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        const userId = userQuery.rows[0]?.id;

        if (!userId) {
            return res.status(404).json({ error: "Пайдаланушы табылмады" });
        }


        const newResult = await pool.query(
            `INSERT INTO results (user_id, quiz_id, quiz_title, score, correct_count, time_spent, answers) 
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [userId, quizId, quizTitle, score, correctCount, timeSpent, JSON.stringify(answers)]
        );


        const xpGained = score * 10;

        await pool.query(
            `INSERT INTO leaderboard (user_id, total_xp, quizzes_passed, average_score) 
             VALUES ($1, $2, 1, $3)
             ON CONFLICT (user_id) 
             DO UPDATE SET 
                total_xp = leaderboard.total_xp + EXCLUDED.total_xp,
                quizzes_passed = leaderboard.quizzes_passed + 1,
                average_score = (leaderboard.average_score * leaderboard.quizzes_passed + EXCLUDED.average_score) / (leaderboard.quizzes_passed + 1),
                last_updated = CURRENT_TIMESTAMP`,
            [userId, xpGained, score]
        );

        res.json(newResult.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ error: "Нәтижені сақтау немесе рейтингті жаңарту қатесі" });
    }
});


app.post('/api/auto-sync', async (req, res) => {
    const { results } = req.body;

    try {
        for (const item of results) {

            const score = Number(item.bestScore || item.score) || 0;
            const tests = Number(item.tests) || 1;
            const avgScore = Number(item.avgScore || item.score) || 0;
            const xpGained = score * 10;

            
            let userRes = await pool.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) ON CONFLICT (username) DO UPDATE SET username = EXCLUDED.username RETURNING id',
                [item.username, `${item.username}@mail.com`, '123456']
            );
            const userId = userRes.rows[0].id;


            await pool.query(
                `INSERT INTO leaderboard (user_id, total_xp, quizzes_passed, average_score) 
                 VALUES ($1, $2, $3, $4)
                 ON CONFLICT (user_id) 
                 DO UPDATE SET 
                    total_xp = GREATEST(leaderboard.total_xp, EXCLUDED.total_xp),
                    quizzes_passed = GREATEST(leaderboard.quizzes_passed, EXCLUDED.quizzes_passed),
                    average_score = GREATEST(leaderboard.average_score, EXCLUDED.average_score)`,
                [userId, xpGained, tests, avgScore]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error("Синхрондау қатесі:", err.message);
        res.status(500).json({ error: "Авто-синхрондау қатесі" });
    }
});