"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../db/config");
const router = (0, express_1.Router)();
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield config_1.poolPromise;
        const result = yield pool.request().query('SELECT * FROM AppUser');
        res.json(result.recordset.map(row => { const r = {}; for (let k in row)
            r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; return r; }));
    }
    catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, email, phone, role, siteId, hospitalId, status, password, loginMode, mfaEnabled, allowedCentres } = req.body;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Name', config_1.sql.NVarChar, name)
            .input('Email', config_1.sql.NVarChar, email)
            .input('Phone', config_1.sql.NVarChar, phone)
            .input('Role', config_1.sql.NVarChar, role)
            .input('SiteId', config_1.sql.NVarChar, siteId || null)
            .input('HospitalId', config_1.sql.NVarChar, hospitalId || null)
            .input('Status', config_1.sql.NVarChar, status || 'Active')
            .input('Password', config_1.sql.NVarChar, password || null)
            .input('LoginMode', config_1.sql.NVarChar, loginMode || null)
            .input('MfaEnabled', config_1.sql.Bit, mfaEnabled ? 1 : 0)
            .input('AllowedCentres', config_1.sql.NVarChar, allowedCentres ? JSON.stringify(allowedCentres) : null)
            .query(`
                INSERT INTO AppUser (Id, Name, Email, Phone, Role, SiteId, HospitalId, Status, Password, LoginMode, MfaEnabled, AllowedCentres)
                VALUES (@Id, @Name, @Email, @Phone, @Role, @SiteId, @HospitalId, @Status, @Password, @LoginMode, @MfaEnabled, @AllowedCentres)
            `);
        res.status(201).json({ message: 'User created' });
    }
    catch (err) {
        require('fs').appendFileSync('error.log', new Date().toISOString() + ' POST /users error: ' + err.message + '\n');
        res.status(500).json({ error: err.message });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, email, phone, role, siteId, hospitalId, status, password, loginMode, mfaEnabled, allowedCentres } = req.body;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Name', config_1.sql.NVarChar, name)
            .input('Email', config_1.sql.NVarChar, email)
            .input('Phone', config_1.sql.NVarChar, phone)
            .input('Role', config_1.sql.NVarChar, role)
            .input('SiteId', config_1.sql.NVarChar, siteId || null)
            .input('HospitalId', config_1.sql.NVarChar, hospitalId || null)
            .input('Status', config_1.sql.NVarChar, status)
            .input('Password', config_1.sql.NVarChar, password || null)
            .input('LoginMode', config_1.sql.NVarChar, loginMode || null)
            .input('MfaEnabled', config_1.sql.Bit, mfaEnabled ? 1 : 0)
            .input('AllowedCentres', config_1.sql.NVarChar, allowedCentres ? JSON.stringify(allowedCentres) : null)
            .query(`
                UPDATE AppUser SET 
                Name = ISNULL(@Name, Name), 
                Email = ISNULL(@Email, Email), 
                Phone = ISNULL(@Phone, Phone), 
                Role = ISNULL(@Role, Role), 
                SiteId = ISNULL(@SiteId, SiteId), 
                HospitalId = ISNULL(@HospitalId, HospitalId), 
                Status = ISNULL(@Status, Status),
                Password = ISNULL(@Password, Password),
                LoginMode = ISNULL(@LoginMode, LoginMode),
                MfaEnabled = ISNULL(@MfaEnabled, MfaEnabled),
                AllowedCentres = ISNULL(@AllowedCentres, AllowedCentres)
                WHERE Id = @Id
            `);
        res.json({ message: 'User updated' });
    }
    catch (err) {
        require('fs').appendFileSync('error.log', new Date().toISOString() + ' PUT /users error: ' + err.message + '\n');
        res.status(500).json({ error: err.message });
    }
}));
// DELETE user
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .query('DELETE FROM AppUser WHERE Id=@Id');
        res.json({ message: 'User deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
