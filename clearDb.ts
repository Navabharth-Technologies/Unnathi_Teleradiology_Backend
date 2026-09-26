import { poolPromise } from './src/db/config';

async function clearDb() {
    try {
        const pool = await poolPromise;
        
        // Disable foreign key checks if any
        
        console.log('Clearing Studies...');
        await pool.request().query('DELETE FROM Study');
        
        console.log('Clearing Patients...');
        await pool.request().query('DELETE FROM Patient');
        
        console.log('Clearing AppUsers...');
        await pool.request().query('DELETE FROM AppUser');
        
        console.log('Clearing Hospitals...');
        await pool.request().query('DELETE FROM Hospital');
        
        console.log('Clearing Sites/TeleradiologyCompany...');
        await pool.request().query('DELETE FROM TeleradiologyCompany');

        console.log('Re-inserting default Super Admin...');
        await pool.request().query(`
            INSERT INTO AppUser (Id, Name, Email, Phone, Role, Status)
            VALUES ('u1', 'Unnathi Super Admin', 'admin@unnathi.com', '000', 'SUPER_ADMIN', 'Active')
        `);

        console.log('Database successfully cleared!');
        process.exit(0);
    } catch (err) {
        console.error('Failed to clear DB:', err);
        process.exit(1);
    }
}

clearDb();
