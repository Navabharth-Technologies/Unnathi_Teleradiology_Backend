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
        const result = yield pool.request().query('SELECT * FROM Patient');
        res.json(result.recordset.map(row => { const r = {}; for (let k in row)
            r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; return r; }));
    }
    catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, uhid, name, dob, age, gender, phone, email, referringDoctor, hospitalId } = req.body;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Uhid', config_1.sql.NVarChar, uhid)
            .input('Name', config_1.sql.NVarChar, name)
            .input('Dob', config_1.sql.DateTime2, Dob)
            .input('Age', config_1.sql.Int, age)
            .input('Gender', config_1.sql.NVarChar, gender)
            .input('Phone', config_1.sql.NVarChar, phone)
            .input('Email', config_1.sql.NVarChar, email)
            .input('ReferringDoctor', config_1.sql.NVarChar, referringDoctor || null)
            .input('HospitalId', config_1.sql.NVarChar, hospitalId)
            .query(`
                INSERT INTO Patient (Id, Uhid, Name, Dob, Age, Gender, Phone, Email, ReferringDoctor, HospitalId)
                VALUES (@Id, @Uhid, @Name, @Dob, @Age, @Gender, @Phone, @Email, @ReferringDoctor, @HospitalId)
            `);
        res.status(201).json({ message: 'Patient created' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { name, age, phone, email, referringDoctor } = req.body;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Name', config_1.sql.NVarChar, name)
            .input('Age', config_1.sql.Int, age)
            .input('Phone', config_1.sql.NVarChar, phone)
            .input('Email', config_1.sql.NVarChar, email)
            .input('ReferringDoctor', config_1.sql.NVarChar, referringDoctor || null)
            .query(`
                UPDATE Patient SET 
                Name = ISNULL(@Name, Name), 
                Age = ISNULL(@Age, Age), 
                Phone = ISNULL(@Phone, Phone), 
                Email = ISNULL(@Email, Email), 
                ReferringDoctor = @ReferringDoctor
                WHERE Id = @Id
            `);
        res.json({ message: 'Patient updated' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
