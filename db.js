const mysql = require('mysql2');

const db = mysql.createConnection({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: 'Lucas19*',
  database: 'biblioteca'
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar no banco:', err.message);
    return;
  }

  console.log('Conectado ao banco biblioteca!');
});

module.exports = db;