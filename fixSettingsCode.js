const fs = require('fs');

const fixSettings = (filePath, tableName) => {
    let content = fs.readFileSync(filePath, 'utf8');

    // GET parsing
    content = content.replace(
        'return r; }));', 
        'if (r.settings && typeof r.settings === "string") { try { r.settings = JSON.parse(r.settings); } catch(e){} } return r; }));'
    );

    // POST
    content = content.replace(
        /const { id, name, ([A-Za-z0-9_, ]+) } = req\.body;/,
        'const { id, name, $1, settings } = req.body;'
    );
    
    // PUT
    content = content.replace(
        /const { name, ([A-Za-z0-9_, ]+) } = req\.body;/,
        'const { name, $1, settings } = req.body;'
    );

    // .inputs (add right after Status)
    content = content.replace(
        /\.input\('Status', sql\.NVarChar, status \|\| 'Active'\)/g,
        ".input('Status', sql.NVarChar, status || 'Active')\n            .input('Settings', sql.NVarChar, settings ? JSON.stringify(settings) : null)"
    );
    // Hospital might not have `status || 'Active'` fallback in input, let's see.
    // If it fails, I'll fix Hospital manually. Let's do a more robust regex for .input.
    // Let's just find the .query( and insert before it.
    content = content.replace(
        /(\.query\(`)/g,
        ".input('Settings', sql.NVarChar, settings ? JSON.stringify(settings) : null)\n            $1"
    );

    // INSERT INTO
    let insertRegex = new RegExp(`INSERT INTO ${tableName} \\(([^)]+)\\)\\s+VALUES \\(([^)]+)\\)`);
    content = content.replace(insertRegex, (match, cols, vals) => {
        return `INSERT INTO ${tableName} (${cols}, Settings)\n                VALUES (${vals}, @Settings)`;
    });

    // UPDATE
    let updateRegex = new RegExp(`UPDATE ${tableName} SET([\\s\\S]+?)WHERE`);
    content = content.replace(updateRegex, (match, setStr) => {
        return `UPDATE ${tableName} SET ${setStr} Settings = ISNULL(@Settings, Settings) \n                WHERE`;
    });

    fs.writeFileSync(filePath, content, 'utf8');
};

fixSettings('c:/Users/NBT/Desktop/KINS_CLONE/diagnostic-backend/src/routes/sites.ts', 'TeleradiologyCompany');
// Note: hospital.ts may need specific fixes because of its structure.
