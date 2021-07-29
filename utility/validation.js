const yup = require("yup");

exports.registerSchema = yup.object().shape({
    username: yup.string().min(6).required(),
    name: yup.string().min(6).required(),
    email: yup.string().email().required(),
});

exports.loginSchema = yup.object().shape({
    username: yup.string().required(),
    password: yup.string().required(),
});

exports.createPostSchema = yup.object().shape({
    _userId: yup.string().required(),
    _username: yup.string().required(),
    title: yup.string().max(60).required(),
    description: yup.string().max(1024).required(),
    price: yup.number().required(),
    tags: yup.string().max(255).required(),
});

exports.editPostSchema = yup.object().shape({
    title: yup.string().max(60),
    description: yup.string().max(1024),
    price: yup.number(),
    tags: yup.string().max(255),
});

exports.editDataSchema = yup.object().shape({
    username: yup.string().min(6),
    email: yup.string().email(),
    password: yup.string(),
});