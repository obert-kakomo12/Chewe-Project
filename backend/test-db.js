const mysql = require('mysql2/promise');

async function testConnection() {
  try {
    const connection = await mysql.createConnection({
      host: '13.140.177.98',
      user: 'nestjs_user',
      password: 'Chewetech4321',
      database: 'ct_project_db',
      port: 3306
    });

    console.log('Connection successful!');
    const [rows, fields] = await connection.execute('SHOW TABLES;');
    console.log('Tables:', rows);
    await connection.end();
  } catch (error) {
    console.error('Connection failed:', error.message);
  }
}

testConnection();
