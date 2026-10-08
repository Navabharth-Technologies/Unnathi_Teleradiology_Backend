const fs = require('fs'); 
let c = fs.readFileSync('src/routes/hospitals.js', 'utf8'); 
c = c.replace(/\.input\('Address', config_1\.sql\.NVarChar, address \|\| null\)\s+\.input\('Settings'/g, ".input('Address', config_1.sql.NVarChar, address || null)\n            .input('ParentCompanyId', config_1.sql.NVarChar, parentSiteId || null)\n            .input('Settings'"); 
c = c.replace(/Address, Settings/g, 'Address, ParentCompanyId, Settings'); 
c = c.replace(/@Address, @Settings/g, '@Address, @ParentCompanyId, @Settings'); 
fs.writeFileSync('src/routes/hospitals.js', c);
