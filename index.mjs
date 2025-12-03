import express from 'express';
import mysql from 'mysql2/promise';

const app = express();

app.set('view engine', 'ejs');
app.use(express.static('public'));

//for Express to get values using POST method
app.use(express.urlencoded({ extended: true }));

//setting up database connection pool
const pool = mysql.createPool({
  host: "m7wltxurw8d2n21q.cbetxkdyhwsb.us-east-1.rds.amazonaws.com",
  user: "exrx95yzt6jpscyl",
  password: "nmyfikxes5e7l9d9",
  database: "vt9oamunbvqriz0o",
  connectionLimit: 10,
  waitForConnections: true
});

//routes
app.get('/', async (req, res) => {
  let sqlAuthor = `SELECT authorId, firstName, lastName
             FROM q_authors
             ORDER BY lastName`;
  let sqlCategory = `SELECT DISTINCT category
                     FROM q_quotes
                     ORDER BY category`;
  let sqlMaxLikes = `SELECT MAX(likes) AS likes
                     FROM q_quotes`;
  const [rowsAuthor] = await pool.query(sqlAuthor);
  const [rowsCategory] = await pool.query(sqlCategory);
  const [rowsMaxLikes] = await pool.query(sqlMaxLikes);
  res.render('index', { 
    "authors": rowsAuthor,
    "categories": rowsCategory,
    "maxLikes": rowsMaxLikes[0].likes,
  });
});

app.get('/searchByKeyword', async (req, res) => {
  let keyword = req.query.keyword;
  let sql = `SELECT quote, authorId, firstName, lastName, category, likes
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE quote LIKE ?`;
  let sqlParams = [`%${keyword}%`];
  const [rows] = await pool.query(sql, sqlParams);
  res.render("results", { "quotes": rows });
});

app.get('/searchByAuthor', async (req, res) => {
  let userAuthorId = req.query.authorId;
  let sql = `SELECT quote, authorId, firstName, lastName, category, likes
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE authorId = ?`;
  let sqlParams = [userAuthorId];
  const [rows] = await pool.query(sql, sqlParams);
  res.render("results", { "quotes": rows });
});

app.get('/api/author/:id', async (req, res) => {
  let authorId = req.params.id;
  let sql = `SELECT *
             FROM q_authors
             WHERE authorId = ?`;           
  let [rows] = await pool.query(sql, [authorId]);
  res.send(rows)
});

app.get('/searchByCategory', async (req, res) => {
  let userCategory = req.query.categoryName;
  let sql = `SELECT quote, authorId, firstName, lastName, category, likes
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE category = ?`;
  let sqlParams = [userCategory];
  const [rows] = await pool.query(sql, sqlParams);
  res.render("results", { "quotes": rows });
});

app.get('/searchByLikes', async (req, res) => {
  let minLikes = req.query.minLikes;
  let maxLikes = req.query.maxLikes;
  let sql = `SELECT quote, authorId, firstName, lastName, category, likes
             FROM q_quotes
             NATURAL JOIN q_authors
             WHERE likes BETWEEN ? AND ?`;
  let sqlParams = [minLikes, maxLikes];
  const [rows] = await pool.query(sql, sqlParams);
  res.render("results", { "quotes": rows });
});


app.get("/dbTest", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT CURDATE()");
    res.send(rows);
  } catch (err) {
    console.error("Database error:", err);
    res.status(500).send("Database error");
  }
});//dbTest

app.listen(3000, () => {
  console.log("Express server running")
})
