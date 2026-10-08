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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const config_1 = require("../db/config");
const router = (0, express_1.Router)();
// GET all hospitals
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield config_1.poolPromise;
        const result = yield pool.request().query('SELECT * FROM Hospital');
        res.json(result.recordset.map(row => {
            const r = {};
            for (let k in row) {
                if (k !== 'Settings')
                    r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k];
            }
            if (row.Settings && typeof row.Settings === 'string') {
                try {
                    const parsed = JSON.parse(row.Settings);
                    Object.assign(r, parsed); // spread extra fields to root
                }
                catch (e) { }
            }
            return r;
        }));
    }
    catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
}));
// POST a new hospital
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const _a = req.body, { id, name, code, organizationType, contactPerson, email, phone, address } = _a, extraData = __rest(_a, ["id", "name", "code", "organizationType", "contactPerson", "email", "phone", "address"]);
        const pool = yield config_1.poolPromise;
        const result = yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Name', config_1.sql.NVarChar, name)
            .input('Code', config_1.sql.NVarChar, code)
            .input('OrganizationType', config_1.sql.NVarChar, organizationType)
            .input('ContactPerson', config_1.sql.NVarChar, contactPerson)
            .input('Email', config_1.sql.NVarChar, email)
            .input('Phone', config_1.sql.NVarChar, phone)
            .input('Address', config_1.sql.NVarChar, address || null)
            .input('Settings', config_1.sql.NVarChar, JSON.stringify(extraData))
            .query(`
                INSERT INTO Hospital (Id, Name, Code, OrganizationType, ContactPerson, Email, Phone, Address, Settings)
                VALUES (@Id, @Name, @Code, @OrganizationType, @ContactPerson, @Email, @Phone, @Address, @Settings)
            `);
        res.status(201).json({ message: 'Hospital created successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// PUT update hospital
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const _a = req.body, { name, code, organizationType, contactPerson, email, phone, address } = _a, extraData = __rest(_a, ["name", "code", "organizationType", "contactPerson", "email", "phone", "address"]);
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Name', config_1.sql.NVarChar, name)
            .input('Code', config_1.sql.NVarChar, code)
            .input('OrganizationType', config_1.sql.NVarChar, organizationType)
            .input('ContactPerson', config_1.sql.NVarChar, contactPerson)
            .input('Email', config_1.sql.NVarChar, email)
            .input('Phone', config_1.sql.NVarChar, phone)
            .input('Address', config_1.sql.NVarChar, address || null)
            .input('Settings', config_1.sql.NVarChar, JSON.stringify(extraData))
            .query(`
                UPDATE Hospital SET 
                Name=@Name, Code=@Code, OrganizationType=@OrganizationType, ContactPerson=@ContactPerson,
                Email=@Email, Phone=@Phone, Address=@Address, Settings=@Settings
                WHERE Id=@Id
            `);
        res.json({ message: 'Hospital updated successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// DELETE hospital
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pool = yield config_1.poolPromise;
        const transaction = new config_1.sql.Transaction(pool);
        yield transaction.begin();
        try {
            yield transaction.request()
                .input('Id', config_1.sql.NVarChar, id)
                .query('DELETE FROM AppUser WHERE HospitalId=@Id');
            yield transaction.request()
                .input('Id', config_1.sql.NVarChar, id)
                .query('DELETE FROM Hospital WHERE Id=@Id');
            yield transaction.commit();
            res.json({ message: 'Hospital and associated users deleted successfully' });
        }
        catch (err) {
            yield transaction.rollback();
            throw err;
        }
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
// trigger restart
