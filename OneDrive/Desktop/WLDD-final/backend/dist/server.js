"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const app_1 = __importDefault(require("./app"));
const db_1 = require("./config/db");
const redis_config_1 = require("./config/redis.config");
const PORT = process.env.PORT || 5000;
(0, db_1.connectDB)().then(() => {
    (0, redis_config_1.connectRedis)().then(() => {
        app_1.default.listen(PORT, () => {
            console.log(`Server is listening on port ${PORT}`);
        });
    });
});
//# sourceMappingURL=server.js.map