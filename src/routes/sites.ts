import { Router, Request, Response } from 'express';
import { poolPromise, sql } from '../db/config';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM TeleradiologyCompany');
        res.json(result.recordset.map(row => { const r = {}; for(let k in row) r[k.charAt(0).toLowerCase() + k.slice(1)] = row[k]; if (r.settings && typeof r.settings === "string") { try { r.settings = JSON.parse(r.settings); } catch(e){} } return r; }));
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        const { id, name, code, legalName, contactPerson, email, phone, address, city, state, country, status, settings } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('Code', sql.NVarChar, code)
            .input('LegalName', sql.NVarChar, legalName || null)
            .input('ContactPerson', sql.NVarChar, contactPerson || null)
            .input('Email', sql.NVarChar, email || null)
            .input('Phone', sql.NVarChar, phone || null)
            .input('Address', sql.NVarChar, address || null)
            .input('City', sql.NVarChar, city || null)
            .input('State', sql.NVarChar, state || null)
            .input('Country', sql.NVarChar, country || null)
            .input('Status', sql.NVarChar, status || 'Active')
            .input('Settings', sql.NVarChar, settings ? JSON.stringify(settings) : null)
            .query(`
                INSERT INTO TeleradiologyCompany (Id, Name, Code, LegalName, ContactPerson, Email, Phone, Address, City, State, Country, Status, Settings)
                VALUES (@Id, @Name, @Code, @LegalName, @ContactPerson, @Email, @Phone, @Address, @City, @State, @Country, @Status, @Settings)
            `);
        res.status(201).json({ message: 'Site created' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, code, legalName, contactPerson, email, phone, address, city, state, country, status, settings } = req.body;
        const pool = await poolPromise;
        await pool.request()
            .input('Id', sql.NVarChar, id)
            .input('Name', sql.NVarChar, name)
            .input('Code', sql.NVarChar, code)
            .input('LegalName', sql.NVarChar, legalName || null)
            .input('ContactPerson', sql.NVarChar, contactPerson || null)
            .input('Email', sql.NVarChar, email || null)
            .input('Phone', sql.NVarChar, phone || null)
            .input('Address', sql.NVarChar, address || null)
            .input('City', sql.NVarChar, city || null)
            .input('State', sql.NVarChar, state || null)
            .input('Country', sql.NVarChar, country || null)
            .input('Status', sql.NVarChar, status || 'Active')
            .input('Settings', sql.NVarChar, settings ? JSON.stringify(settings) : null)
            .query(`
                UPDATE TeleradiologyCompany SET  
                Name = ISNULL(@Name, Name), 
                Code = ISNULL(@Code, Code),
                LegalName = ISNULL(@LegalName, LegalName),
                ContactPerson = ISNULL(@ContactPerson, ContactPerson),
                Email = ISNULL(@Email, Email),
                Phone = ISNULL(@Phone, Phone),
                Address = ISNULL(@Address, Address),
                City = ISNULL(@City, City),
                State = ISNULL(@State, State),
                Country = ISNULL(@Country, Country),
                Status = ISNULL(@Status, Status),
                Settings = ISNULL(@Settings, Settings) 
                WHERE Id = @Id
            `);
        res.json({ message: 'Site updated' });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE site
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;
        const transaction = new sql.Transaction(pool);
        
        await transaction.begin();
        try {
            await transaction.request()
                .input('Id', sql.NVarChar, id)
                .query('DELETE FROM AppUser WHERE SiteId=@Id');

            await transaction.request()
                .input('Id', sql.NVarChar, id)
                .query('DELETE FROM TeleradiologyCompany WHERE Id=@Id');
                
            await transaction.commit();
            res.json({ message: 'Site and associated users deleted successfully' });
        } catch (err: any) {
            await transaction.rollback();
            throw err;
        }
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
