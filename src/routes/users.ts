import { Router, Request, Response } from 'express';
import { poolPromise, sql } from '../db/config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM AppUser');
        res.json(result.recordset.map(row => { const r = {}; for(let k in row) r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; return r; }));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { id, name, email, phone, role, siteId, hospitalId, status } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('Email', sql.NVarChar, email)
            .input('Phone', sql.NVarChar, phone)
            .input('Role', sql.NVarChar, role)
            .input('SiteId', sql.NVarChar, siteId || null)
            .input('HospitalId', sql.NVarChar, hospitalId || null)
            .input('Status', sql.NVarChar, status || 'Active')
            .query(`
                INSERT INTO AppUser (Id, Name, Email, Phone, Role, SiteId, HospitalId, Status)
                VALUES (@Id, @Name, @Email, @Phone, @Role, @SiteId, @HospitalId, @Status)
            `);
        res.status(201).json({ message: 'User created' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, siteId, hospitalId, status } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('Email', sql.NVarChar, email)
            .input('Phone', sql.NVarChar, phone)
            .input('Role', sql.NVarChar, role)
            .input('SiteId', sql.NVarChar, siteId || null)
            .input('HospitalId', sql.NVarChar, hospitalId || null)
            .input('Status', sql.NVarChar, status)
            .query(`
                UPDATE AppUser SET 
                Name = ISNULL(@Name, Name), 
                Email = ISNULL(@Email, Email), 
                Phone = ISNULL(@Phone, Phone), 
                Role = ISNULL(@Role, Role), 
                SiteId = @SiteId, 
                HospitalId = @HospitalId, 
                Status = ISNULL(@Status, Status)
                WHERE Id = @Id
            `);
        res.json({ message: 'User updated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
