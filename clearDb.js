"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./src/db/config");
function clearDb() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pool = yield config_1.poolPromise;
            // Disable foreign key checks if any
            console.log('Clearing Studies...');
            yield pool.request().query('DELETE FROM Study');
            console.log('Clearing Patients...');
            yield pool.request().query('DELETE FROM Patient');
            console.log('Clearing AppUsers...');
            yield pool.request().query('DELETE FROM AppUser');
            console.log('Clearing Hospitals...');
            yield pool.request().query('DELETE FROM Hospital');
            console.log('Clearing Sites/TeleradiologyCompany...');
            yield pool.request().query('DELETE FROM TeleradiologyCompany');
            console.log('Re-inserting default Super Admin...');
            yield pool.request().query(`
            INSERT INTO AppUser (Id, Name, Email, Phone, Role, Status)
            VALUES ('u1', 'Unnathi Super Admin', 'admin@unnathi.com', '000', 'SUPER_ADMIN', 'Active')
        `);
            console.log('Database successfully cleared!');
            process.exit(0);
        }
        catch (err) {
            console.error('Failed to clear DB:', err);
            process.exit(1);
        }
    });
}
clearDb();
