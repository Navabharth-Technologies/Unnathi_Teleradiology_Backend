"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const hospitals_1 = __importDefault(require("./routes/hospitals"));
const users_1 = __importDefault(require("./routes/users"));
const patients_1 = __importDefault(require("./routes/patients"));
const studies_1 = __importDefault(require("./routes/studies"));
const sites_1 = __importDefault(require("./routes/sites"));
const radiologists_1 = __importDefault(require("./routes/radiologists"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 5000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ limit: '50mb', extended: true }));
// Routes
app.use('/api/hospitals', hospitals_1.default);
app.use('/api/users', users_1.default);
app.use('/api/patients', patients_1.default);
app.use('/api/studies', studies_1.default);
app.use('/api/sites', sites_1.default);
app.use('/api/radiologists', radiologists_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend is running!' });
});
// Start server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
