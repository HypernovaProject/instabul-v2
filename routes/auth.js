const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

const User = require("../models/users");

const Validation = require("../utility/validation");

const verify = require("../middleware/verifyToken");

/*
Verb: POST
Function: Create new user
Authorization: None
*/

router.post("/register", async (req, res) => {
    const validate = await Validation.registerSchema.isValid(req.body);
    if (!validate)
        return res.status(400).json({
            message: "Invalid input",
        });

    const userExists = await User.find({
        $or: [
            { username: req.body.username },
            { email: req.body.email },
        ],
    });
    if (userExists && userExists.length > 0)
        return res.status(409).json({
            message: "Username or e-mail is taken",
        });

    try {
        let userData = req.body;

        const salt = await bcrypt.genSaltSync(10);
        const hashed = await bcrypt.hashSync(userData.password, salt);

        userData.password = hashed;
        userData.lastIp =
            req.header("x-forwarded-for") || req.socket.remoteAddress;
        userData.userAgent = req.useragent.source;

        const user = new User(userData);
        await user.save();

        res.status(201).json({
            message: "User created",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Could not create user",
        });
    }
});

/*
Verb: POST
Function: Generate JWT token and hand it out
Authorization: None
*/

router.post("/login", async (req, res) => {
    const validate = await Validation.loginSchema.isValid(req.body);
    if (!validate)
        return res.status(400).json({
            message: "Invalid input",
        });

    const user = await User.findOne({
        $or: [
            { username: req.body.username },
            { email: req.body.username },
        ],
    });
    if (!user || user.length < 0)
        return res.status(409).json({
            message: "User not registered",
        });

    const validPass = bcrypt.compareSync(req.body.password, user.password);
    if (!validPass)
        return res.status(401).json({
            message: "Invalid password",
        });

    const token = jwt.sign(
        {
            _id: user._id,
            username: user.username,
        },
        process.env.TOKEN_SECRET,
        {
            expiresIn: "20d",
        }
    );

    await user.updateOne({ 
        lastLogin: new Date(),
        lastIp: req.header("x-forwarded-for") || req.socket.remoteAddress,
        userAgent: req.useragent.source
    });

    res.header("Authorization", token).status(200).json({
        message: "Logged in",
        token: token,
    });
});

module.exports = router;
