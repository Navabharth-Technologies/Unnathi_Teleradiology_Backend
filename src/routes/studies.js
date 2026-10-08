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
        const result = yield pool.request().query('SELECT * FROM Study');
        res.json(result.recordset.map(row => { const r = {}; for (let k in row)
            r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; return r; }));
    }
    catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
}));
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { Id, PatientId, CaseNumber, AccessionNumber, HospitalId, Modality, StudyDescription, BodyPart, Priority, StudyDate, Status, ReportingStatus, ClinicalHistory, ReferringPhysician } = req.body;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('PatientId', config_1.sql.NVarChar, patientId)
            .input('CaseNumber', config_1.sql.NVarChar, caseNumber)
            .input('AccessionNumber', config_1.sql.NVarChar, accessionNumber)
            .input('HospitalId', config_1.sql.NVarChar, hospitalId)
            .input('Modality', config_1.sql.NVarChar, modality)
            .input('StudyDescription', config_1.sql.NVarChar, studyDescription)
            .input('BodyPart', config_1.sql.NVarChar, bodyPart)
            .input('Priority', config_1.sql.NVarChar, priority)
            .input('StudyDate', config_1.sql.DateTime2, StudyDate)
            .input('Status', config_1.sql.NVarChar, status || 'New')
            .input('ReportingStatus', config_1.sql.NVarChar, reportingStatus || 'Unread')
            .input('ClinicalHistory', config_1.sql.NVarChar, clinicalHistory || null)
            .input('ReferringPhysician', config_1.sql.NVarChar, referringPhysician || null)
            .query(`
                INSERT INTO Study (
                    Id, PatientId, CaseNumber, AccessionNumber, HospitalId, Modality, 
                    StudyDescription, BodyPart, Priority, StudyDate, Status, ReportingStatus,
                    ClinicalHistory, ReferringPhysician
                )
                VALUES (
                    @Id, @PatientId, @CaseNumber, @AccessionNumber, @HospitalId, @Modality, 
                    @StudyDescription, @BodyPart, @Priority, @StudyDate, @Status, @ReportingStatus,
                    @ClinicalHistory, @ReferringPhysician
                )
            `);
        res.status(201).json({ message: 'Study created' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
router.put('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { Status, ReportingStatus, AssignedRadiologistId, ReportText, ClinicalHistory, Modality, StudyDescription, BodyPart } = req.body;
        const pool = yield config_1.poolPromise;
        yield pool.request()
            .input('Id', config_1.sql.NVarChar, id)
            .input('Status', config_1.sql.NVarChar, status)
            .input('ReportingStatus', config_1.sql.NVarChar, reportingStatus)
            .input('AssignedRadiologistId', config_1.sql.NVarChar, assignedRadiologistId || null)
            .input('ReportText', config_1.sql.NVarChar, reportText || null)
            .input('ClinicalHistory', config_1.sql.NVarChar, clinicalHistory || null)
            .input('Modality', config_1.sql.NVarChar, modality || null)
            .input('StudyDescription', config_1.sql.NVarChar, studyDescription || null)
            .input('BodyPart', config_1.sql.NVarChar, bodyPart || null)
            .query(`
                UPDATE Study SET 
                Status = ISNULL(@Status, Status), 
                ReportingStatus = ISNULL(@ReportingStatus, ReportingStatus), 
                AssignedRadiologistId = @AssignedRadiologistId, 
                ReportText = ISNULL(@ReportText, ReportText),
                ClinicalHistory = ISNULL(@ClinicalHistory, ClinicalHistory),
                Modality = ISNULL(@Modality, Modality),
                StudyDescription = ISNULL(@StudyDescription, StudyDescription),
                BodyPart = ISNULL(@BodyPart, BodyPart),
                UpdatedAt = GETDATE()
                WHERE Id = @Id
            `);
        res.json({ message: 'Study updated' });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
