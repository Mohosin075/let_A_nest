"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stats = void 0;
const mongoose_1 = require("mongoose");
const statsSchema = new mongoose_1.Schema({
    likes: { type: Number },
    comments: { type: Number },
}, {
    timestamps: true,
});
exports.Stats = (0, mongoose_1.model)('Stats', statsSchema);
