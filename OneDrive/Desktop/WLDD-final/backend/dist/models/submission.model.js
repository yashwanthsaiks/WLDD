"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Submission = void 0;
const mongoose_1 = require("mongoose");
const SubmissionSchema = new mongoose_1.Schema({
    campaignId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    creatorId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    postLink: { type: String, required: true },
    views: { type: Number, default: 0, min: 0 },
    currentPayout: { type: Number, default: 0, min: 0 },
    flagged: { type: Boolean, default: false }
}, { timestamps: true });
exports.Submission = (0, mongoose_1.model)('Submission', SubmissionSchema);
//# sourceMappingURL=submission.model.js.map