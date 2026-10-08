import { Router, Request, Response } from 'express';
import { poolPromise, sql } from '../db/config';

const router = Router();

// GET all radiologists
router.get('/', async (req: Request, res: Response) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Radiologist');
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
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST a new radiologist
router.post('/', async (req: Request, res: Response) => {
    try {
        const { id, userId, name, registrationId, subspecialties, availability, assignedHospitals, status } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.VarChar, id)
            .input('UserId', sql.VarChar, userId)
            .input('Name', sql.NVarChar, name)
            .input('RegistrationId', sql.VarChar, registrationId || '')
            .input('Specialization', sql.NVarChar, JSON.stringify(subspecialties || []))
            .input('Availability', sql.VarChar, availability || 'Online')
            .input('AssignedHospitals', sql.NVarChar, JSON.stringify(assignedHospitals || []))
            .input('Status', sql.VarChar, status || 'Active')
            .query(`
                INSERT INTO Radiologist (Id, UserId, Name, RegistrationId, Specialization, Availability, AssignedHospitals, Status)
                VALUES (@Id, @UserId, @Name, @RegistrationId, @Specialization, @Availability, @AssignedHospitals, @Status)
            `);
            
        res.status(201).json({ message: 'Radiologist created successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update radiologist
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { userId, name, registrationId, subspecialties, availability, assignedHospitals, status } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.VarChar, id)
            .input('UserId', sql.VarChar, userId)
            .input('Name', sql.NVarChar, name)
            .input('RegistrationId', sql.VarChar, registrationId || '')
            .input('Specialization', sql.NVarChar, JSON.stringify(subspecialties || []))
            .input('Availability', sql.VarChar, availability || 'Online')
            .input('AssignedHospitals', sql.NVarChar, JSON.stringify(assignedHospitals || []))
            .input('Status', sql.VarChar, status || 'Active')
            .query(`
                UPDATE Radiologist 
                SET UserId = @UserId, Name = @Name, RegistrationId = @RegistrationId, 
                    Specialization = @Specialization, Availability = @Availability, 
                    AssignedHospitals = @AssignedHospitals, Status = @Status
                WHERE Id = @Id
            `);
            
        res.json({ message: 'Radiologist updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE radiologist
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.VarChar, id)
            .query('DELETE FROM Radiologist WHERE Id = @Id');
            
        res.json({ message: 'Radiologist deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
