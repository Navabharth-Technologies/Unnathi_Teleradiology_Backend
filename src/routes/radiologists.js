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
// GET all radiologists
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pool = yield config_1.poolPromise;
        const result = yield pool.request().query('SELECT * FROM Radiologist');
        res.json(result.recordset.map(row => {
            return {
                id: row.Id,
                userId: row.UserId,
                name: row.Name,
                registrationId: row.RegistrationId,
                subspecialties: row.Specialization ? JSON.parse(row.Specialization) : [],
                availability: row.Availability,
                assignedHospitals: row.AssignedHospitals ? JSON.parse(row.AssignedHospitals) : [],
                status: row.Status
            };
        }));
    }
    catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
}));
// POST a new radiologist
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, userId, name, registrationId, subspecialties, availability, assignedHospitals, status } = req.body;
        const pool = yield config_1.poolPromise;
        const result = yield pool.request()
            .input('Id', config_1.sql.VarChar, id)
            .input('UserId', config_1.sql.VarChar, userId)
            .input('Name', config_1.sql.NVarChar, name)
            .input('RegistrationId', config_1.sql.VarChar, registrationId || '')
            .input('Specialization', config_1.sql.NVarChar, JSON.stringify(subspecialties || []))
            .input('Availability', config_1.sql.VarChar, availability || 'Online')
            .input('AssignedHospitals', config_1.sql.NVarChar, JSON.stringify(assignedHospitals || []))
            .input('Status', config_1.sql.VarChar, status || 'Active')
            .query(`
                INSERT INTO Radiologist (Id, UserId, Name, RegistrationId, Specialization, Availability, AssignedHospitals, Status)
                VALUES (@Id, @UserId, @Name, @RegistrationId, @Specialization, @Availability, @AssignedHospitals, @Status)
            `);
        res.status(201).json({ message: 'Radiologist created successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// PUT update radiologist
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { userId, name, registrationId, subspecialties, availability, assignedHospitals, status } = req.body;
        const pool = yield config_1.poolPromise;
        const result = yield pool.request()
            .input('Id', config_1.sql.VarChar, id)
            .input('UserId', config_1.sql.VarChar, userId)
            .input('Name', config_1.sql.NVarChar, name)
            .input('RegistrationId', config_1.sql.VarChar, registrationId || '')
            .input('Specialization', config_1.sql.NVarChar, JSON.stringify(subspecialties || []))
            .input('Availability', config_1.sql.VarChar, availability || 'Online')
            .input('AssignedHospitals', config_1.sql.NVarChar, JSON.stringify(assignedHospitals || []))
            .input('Status', config_1.sql.VarChar, status || 'Active')
            .query(`
                UPDATE Radiologist 
                SET UserId = @UserId, Name = @Name, RegistrationId = @RegistrationId, 
                    Specialization = @Specialization, Availability = @Availability, 
                    AssignedHospitals = @AssignedHospitals, Status = @Status
                WHERE Id = @Id
            `);
        res.json({ message: 'Radiologist updated successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
// DELETE radiologist
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.VarChar, id)
            .query('DELETE FROM Radiologist WHERE Id = @Id');
        res.json({ message: 'Radiologist deleted successfully' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
