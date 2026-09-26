import { poolPromise } from './src/db/config';

async function run() {
  const pool = await poolPromise;
  try {
    await pool.request().query('ALTER TABLE TeleradiologyCompany ADD Settings NVARCHAR(MAX) NULL');
    console.log('Added Settings to TeleradiologyCompany');
  } catch (e: any) { console.log(e.message) }
  try {
    await pool.request().query('ALTER TABLE Hospital ADD Settings NVARCHAR(MAX) NULL');
    console.log('Added Settings to Hospital');
  } catch (e: any) { console.log(e.message) }
  process.exit(0);
}
run();
