import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || 'password',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'Unnathi_Teleradiology',
    options: {
        encrypt: false, // For local development
        trustServerCertificate: true,
        enableArithAbort: true
    },
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log('Connected to MS SQL Server');
        return pool;
    })
    .catch(err => {
        console.error('Database Connection Failed! Bad Config: ', err);
        throw err;
    });

export { sql, poolPromise };
