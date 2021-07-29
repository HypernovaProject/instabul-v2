const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const userSchema = new mongoose.Schema({
    _userId: {
        type: ObjectId,
        required: true,
    },
    _username: {
        type: String,
        required: true,
        min: 6,
        max: 255,
    },
    title: {
        type: String,
        required: true,
        min: 1,
        max: 60,
    },
    description: {
        type: String,
        required: true,
        min: 6,
        max: 1024,
    },
    price: {
        type: Number,
        required: true,
    },
    tags: {
        type: Array,
        required: true,
        min: 1,
        max: 255,
    },
    lastEdit: {
        type: Date,
        default: Date.now,
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("Post", userSchema);
