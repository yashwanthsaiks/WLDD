"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const brand_routes_1 = __importDefault(require("./routes/brand.routes"));
const creator_routes_1 = __importDefault(require("./routes/creator.routes"));
const submission_routes_1 = __importDefault(require("./routes/submission.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Register API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/brand', brand_routes_1.default);
app.use('/api/brand', submission_routes_1.default);
app.use('/api/creator', creator_routes_1.default);
app.use('/api/submissions', submission_routes_1.default);
app.get('/', (req, res) => {
    res.json({ status: 'success', message: 'Meme’d Backend API is running successfully' });
});
exports.default = app;
//# sourceMappingURL=app.js.map