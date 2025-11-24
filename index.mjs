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
app.get('/', (req, res) => {
  res.send('Hello Express app!')
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
