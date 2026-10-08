const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();
const config = { user: process.env.DB_USER, password: process.env.DB_PASSWORD, server: process.env.DB_SERVER, database: process.env.DB_NAME, options: { encrypt: false, trustServerCertificate: true } };
sql.connect(config).then(pool => pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'Hospital'")).then(res => { console.log('Hospital columns:', res.recordset.map(r => r.COLUMN_NAME)); process.exit(0); }).catch(console.error);
