import { Router, Request, Response } from 'express';
import { poolPromise, sql } from '../db/config';

const router = Router();

// GET all hospitals
router.get('/', async (req: Request, res: Response) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Hospital');
        res.json(result.recordset.map(row => { const r: any = {}; for(let k in row) r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; if (r.settings && typeof r.settings === 'string') { try { r.settings = JSON.parse(r.settings); } catch(e){} } return r; }));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST a new hospital
router.post('/', async (req: Request, res: Response) => {
    try {
        const { id, name, code, organizationType, contactPerson, email, phone, address, settings } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('Code', sql.NVarChar, code)
            .input('OrganizationType', sql.NVarChar, organizationType)
            .input('ContactPerson', sql.NVarChar, contactPerson)
            .input('Email', sql.NVarChar, email)
            .input('Phone', sql.NVarChar, phone)
            .input('Address', sql.NVarChar, address)
            .input('Settings', sql.NVarChar, settings ? JSON.stringify(settings) : null)
            .query(`
                INSERT INTO Hospital (Id, Name, Code, OrganizationType, ContactPerson, Email, Phone, Address, Settings)
                VALUES (@Id, @Name, @Code, @OrganizationType, @ContactPerson, @Email, @Phone, @Address, @Settings)
            `);
            
        res.status(201).json({ message: 'Hospital created successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
