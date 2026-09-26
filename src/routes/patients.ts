import { Router, Request, Response } from 'express';
import { poolPromise, sql } from '../db/config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Patient');
        res.json(result.recordset.map(row => { const r = {}; for(let k in row) r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; return r; }));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { id, uhid, name, dob, age, gender, phone, email, referringDoctor, hospitalId } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Uhid', sql.NVarChar, uhid)
            .input('Name', sql.NVarChar, name)
            .input('Dob', sql.DateTime2, Dob)
            .input('Age', sql.Int, age)
            .input('Gender', sql.NVarChar, gender)
            .input('Phone', sql.NVarChar, phone)
            .input('Email', sql.NVarChar, email)
            .input('ReferringDoctor', sql.NVarChar, referringDoctor || null)
            .input('HospitalId', sql.NVarChar, hospitalId)
            .query(`
                INSERT INTO Patient (Id, Uhid, Name, Dob, Age, Gender, Phone, Email, ReferringDoctor, HospitalId)
                VALUES (@Id, @Uhid, @Name, @Dob, @Age, @Gender, @Phone, @Email, @ReferringDoctor, @HospitalId)
            `);
        res.status(201).json({ message: 'Patient created' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, age, phone, email, referringDoctor } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('Age', sql.Int, age)
            .input('Phone', sql.NVarChar, phone)
            .input('Email', sql.NVarChar, email)
            .input('ReferringDoctor', sql.NVarChar, referringDoctor || null)
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
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
