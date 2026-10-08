import { Router, Request, Response } from 'express';
import { poolPromise, sql } from '../db/config';

const router = Router();

// GET all hospitals
router.get('/', async (req: Request, res: Response) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM Hospital');
        res.json(result.recordset.map(row => {
            const r: any = {};
            for(let k in row) {
                if (k !== 'Settings') r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k];
            }
            if (row.Settings && typeof row.Settings === 'string') {
                try {
                    const parsed = JSON.parse(row.Settings);
                    Object.assign(r, parsed); // spread extra fields to root
                } catch(e){}
            }
            return r;
        }));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

// POST a new hospital
router.post('/', async (req: Request, res: Response) => {
    try {
        const { id, name, code, organizationType, contactPerson, email, phone, address, ...extraData } = req.body;
        const pool = await poolPromise;
        const result = await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('Code', sql.NVarChar, code)
            .input('OrganizationType', sql.NVarChar, organizationType)
            .input('ContactPerson', sql.NVarChar, contactPerson)
            .input('Email', sql.NVarChar, email)
            .input('Phone', sql.NVarChar, phone)
            .input('Address', sql.NVarChar, address || null)
            .input('Settings', sql.NVarChar, JSON.stringify(extraData))
            .query(`
                INSERT INTO Hospital (Id, Name, Code, OrganizationType, ContactPerson, Email, Phone, Address, Settings)
                VALUES (@Id, @Name, @Code, @OrganizationType, @ContactPerson, @Email, @Phone, @Address, @Settings)
            `);
            
        res.status(201).json({ message: 'Hospital created successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT update hospital
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, code, organizationType, contactPerson, email, phone, address, ...extraData } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('Code', sql.NVarChar, code)
            .input('OrganizationType', sql.NVarChar, organizationType)
            .input('ContactPerson', sql.NVarChar, contactPerson)
            .input('Email', sql.NVarChar, email)
            .input('Phone', sql.NVarChar, phone)
            .input('Address', sql.NVarChar, address || null)
            .input('Settings', sql.NVarChar, JSON.stringify(extraData))
            .query(`
                UPDATE Hospital SET 
                Name=@Name, Code=@Code, OrganizationType=@OrganizationType, ContactPerson=@ContactPerson,
                Email=@Email, Phone=@Phone, Address=@Address, Settings=@Settings
                WHERE Id=@Id
            `);
        res.json({ message: 'Hospital updated successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE hospital
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        try {
            await transaction.request()
                .input('Id', sql.NVarChar, id)
                .query('DELETE FROM AppUser WHERE HospitalId=@Id');

            await transaction.request()
                .input('Id', sql.NVarChar, id)
                .query('DELETE FROM Hospital WHERE Id=@Id');
                
            await transaction.commit();
            res.json({ message: 'Hospital and associated users deleted successfully' });
        } catch (err: any) {
            await transaction.rollback();
            throw err;
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;

// trigger restart
