const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    name: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    email: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    password: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
    bio: {
        type: String,
        required: false,
        max: 412,
    },
    tags: {
        type: Array,
        required: false,
        min: 1,
        max: 255,
    },
    avatarURL: {
        type: String,
        required: false,
        max: 255,
    },
    lastIp: {
        type: String,
        required: true,
        max: 255,
    },
    userAgent: {
        type: String,
        required: true,
        max: 420,
    },
    lastLogin: {
        type: Date,
        default: Date.now,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", userSchema);
