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
        const { id, name, email, phone, role, siteId, hospitalId, status, password, loginMode, mfaEnabled, allowedCentres } = req.body;
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
            .input('Password', sql.NVarChar, password || null)
            .input('LoginMode', sql.NVarChar, loginMode || null)
            .input('MfaEnabled', sql.Bit, mfaEnabled ? 1 : 0)
            .input('AllowedCentres', sql.NVarChar, allowedCentres ? JSON.stringify(allowedCentres) : null)
            .query(`
                INSERT INTO AppUser (Id, Name, Email, Phone, Role, SiteId, HospitalId, Status, Password, LoginMode, MfaEnabled, AllowedCentres)
                VALUES (@Id, @Name, @Email, @Phone, @Role, @SiteId, @HospitalId, @Status, @Password, @LoginMode, @MfaEnabled, @AllowedCentres)
            `);
        res.status(201).json({ message: 'User created' });
    } catch (err: any) {
        require('fs').appendFileSync('error.log', new Date().toISOString() + ' POST /users error: ' + err.message + '\n');
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, phone, role, siteId, hospitalId, status, password, loginMode, mfaEnabled, allowedCentres } = req.body;
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
            .input('Password', sql.NVarChar, password || null)
            .input('LoginMode', sql.NVarChar, loginMode || null)
            .input('MfaEnabled', sql.Bit, mfaEnabled ? 1 : 0)
            .input('AllowedCentres', sql.NVarChar, allowedCentres ? JSON.stringify(allowedCentres) : null)
            .query(`
                UPDATE AppUser SET 
                Name = ISNULL(@Name, Name), 
                Email = ISNULL(@Email, Email), 
                Phone = ISNULL(@Phone, Phone), 
                Role = ISNULL(@Role, Role), 
                SiteId = ISNULL(@SiteId, SiteId), 
                HospitalId = ISNULL(@HospitalId, HospitalId), 
                Status = ISNULL(@Status, Status),
                Password = ISNULL(@Password, Password),
                LoginMode = ISNULL(@LoginMode, LoginMode),
                MfaEnabled = ISNULL(@MfaEnabled, MfaEnabled),
                AllowedCentres = ISNULL(@AllowedCentres, AllowedCentres)
                WHERE Id = @Id
            `);
        res.json({ message: 'User updated' });
    } catch (err: any) {
        require('fs').appendFileSync('error.log', new Date().toISOString() + ' PUT /users error: ' + err.message + '\n');
        res.status(500).json({ error: err.message });
    }
});

// DELETE user
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .query('DELETE FROM AppUser WHERE Id=@Id');
        res.json({ message: 'User deleted successfully' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
