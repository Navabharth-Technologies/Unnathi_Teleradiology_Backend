import { Router, Request, Response } from 'express';
import { poolPromise, sql } from '../db/config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Study');
        res.json(result.recordset.map(row => { const r = {}; for(let k in row) r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; return r; }));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { 
            Id, PatientId, CaseNumber, AccessionNumber, HospitalId, Modality, 
            StudyDescription, BodyPart, Priority, StudyDate, Status, ReportingStatus,
            ClinicalHistory, ReferringPhysician
        } = req.body;
        
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('PatientId', sql.NVarChar, patientId)
            .input('CaseNumber', sql.NVarChar, caseNumber)
            .input('AccessionNumber', sql.NVarChar, accessionNumber)
            .input('HospitalId', sql.NVarChar, hospitalId)
            .input('Modality', sql.NVarChar, modality)
            .input('StudyDescription', sql.NVarChar, studyDescription)
            .input('BodyPart', sql.NVarChar, bodyPart)
            .input('Priority', sql.NVarChar, priority)
            .input('StudyDate', sql.DateTime2, StudyDate)
            .input('Status', sql.NVarChar, status || 'New')
            .input('ReportingStatus', sql.NVarChar, reportingStatus || 'Unread')
            .input('ClinicalHistory', sql.NVarChar, clinicalHistory || null)
            .input('ReferringPhysician', sql.NVarChar, referringPhysician || null)
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
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { 
            Status, ReportingStatus, AssignedRadiologistId, ReportText, 
            ClinicalHistory, Modality, StudyDescription, BodyPart 
        } = req.body;
        
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Status', sql.NVarChar, status)
            .input('ReportingStatus', sql.NVarChar, reportingStatus)
            .input('AssignedRadiologistId', sql.NVarChar, assignedRadiologistId || null)
            .input('ReportText', sql.NVarChar, reportText || null)
            .input('ClinicalHistory', sql.NVarChar, clinicalHistory || null)
            .input('Modality', sql.NVarChar, modality || null)
            .input('StudyDescription', sql.NVarChar, studyDescription || null)
            .input('BodyPart', sql.NVarChar, bodyPart || null)
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
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
