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
        const result = yield pool.request().query('SELECT * FROM TeleradiologyCompany');
        res.json(result.recordset.map(row => { const r = {}; for (let k in row)
            r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; if (r.settings && typeof r.settings === "string") {
            try {
                r.settings = JSON.parse(r.settings);
            }
            catch (e) { }
        } return r; }));
    }
    catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, name, code, legalName, contactPerson, email, phone, address, city, state, country, status, settings } = req.body;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Name', config_1.sql.NVarChar, name)
            .input('Code', config_1.sql.NVarChar, code)
            .input('LegalName', config_1.sql.NVarChar, legalName || null)
            .input('ContactPerson', config_1.sql.NVarChar, contactPerson || null)
            .input('Email', config_1.sql.NVarChar, email || null)
            .input('Phone', config_1.sql.NVarChar, phone || null)
            .input('Address', config_1.sql.NVarChar, address || null)
            .input('City', config_1.sql.NVarChar, city || null)
            .input('State', config_1.sql.NVarChar, state || null)
            .input('Country', config_1.sql.NVarChar, country || null)
            .input('Status', config_1.sql.NVarChar, status || 'Active')
            .input('Settings', config_1.sql.NVarChar, settings ? JSON.stringify(settings) : null)
            .query(`
                INSERT INTO TeleradiologyCompany (Id, Name, Code, LegalName, ContactPerson, Email, Phone, Address, City, State, Country, Status, Settings)
                VALUES (@Id, @Name, @Code, @LegalName, @ContactPerson, @Email, @Phone, @Address, @City, @State, @Country, @Status, @Settings)
            `);
        res.status(201).json({ message: 'Site created' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, code, legalName, contactPerson, email, phone, address, city, state, country, status, settings } = req.body;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Name', config_1.sql.NVarChar, name)
            .input('Code', config_1.sql.NVarChar, code)
            .input('LegalName', config_1.sql.NVarChar, legalName || null)
            .input('ContactPerson', config_1.sql.NVarChar, contactPerson || null)
            .input('Email', config_1.sql.NVarChar, email || null)
            .input('Phone', config_1.sql.NVarChar, phone || null)
            .input('Address', config_1.sql.NVarChar, address || null)
            .input('City', config_1.sql.NVarChar, city || null)
            .input('State', config_1.sql.NVarChar, state || null)
            .input('Country', config_1.sql.NVarChar, country || null)
            .input('Status', config_1.sql.NVarChar, status || 'Active')
            .input('Settings', config_1.sql.NVarChar, settings ? JSON.stringify(settings) : null)
            .query(`
                UPDATE TeleradiologyCompany SET  
                Name = ISNULL(@Name, Name), 
                Code = ISNULL(@Code, Code),
                LegalName = ISNULL(@LegalName, LegalName),
                ContactPerson = ISNULL(@ContactPerson, ContactPerson),
                Email = ISNULL(@Email, Email),
                Phone = ISNULL(@Phone, Phone),
                Address = ISNULL(@Address, Address),
                City = ISNULL(@City, City),
                State = ISNULL(@State, State),
                Country = ISNULL(@Country, Country),
                Status = ISNULL(@Status, Status),
                Settings = ISNULL(@Settings, Settings) 
                WHERE Id = @Id
            `);
        res.json({ message: 'Site updated' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// DELETE site
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pool = yield config_1.poolPromise;
        const transaction = new config_1.sql.Transaction(pool);
        yield transaction.begin();
        try {
            yield transaction.request()
                .input('Id', config_1.sql.NVarChar, id)
                .query('DELETE FROM AppUser WHERE SiteId=@Id');
            yield transaction.request()
                .input('Id', config_1.sql.NVarChar, id)
                .query('DELETE FROM TeleradiologyCompany WHERE Id=@Id');
            yield transaction.commit();
            res.json({ message: 'Site and associated users deleted successfully' });
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
