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