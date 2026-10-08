"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.poolPromise = exports.sql = void 0;
const mssql_1 = __importDefault(require("mssql"));
exports.sql = mssql_1.default;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const config = {
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
const poolPromise = new mssql_1.default.ConnectionPool(config)
    .connect()
    .then(pool => {
    console.log('Connected to MS SQL Server');
    return pool;
})
    .catch(err => {
    console.error('Database Connection Failed! Bad Config: ', err);
    throw err;
});
exports.poolPromise = poolPromise;
