"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectRedis = exports.redisClient = void 0;
const redis_1 = require("redis");
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
exports.redisClient = (0, redis_1.createClient)({
    url: REDIS_URL
});
exports.redisClient.on('error', (err) => console.error('Redis Client Error:', err));
exports.redisClient.on('connect', () => console.log('Connected to Redis successfully'));
const connectRedis = async () => {
    if (!exports.redisClient.isOpen) {
        await exports.redisClient.connect();
    }
};
exports.connectRedis = connectRedis;
//# sourceMappingURL=redis.config.js.map