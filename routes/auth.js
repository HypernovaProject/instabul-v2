const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = require("express").Router();

const User = require("../models/users");

const Validation = require("../utility/validation");

const verify = require("../middleware/verifyToken");

/*
Verb: GET
Function: Fetch data for user specified by _id
Authorization: None
*/

router.get("/data/:id", async (req, res) => {
    const id = req.params.id;

    try {
        const userData = await User.findOne({ _id: id }).select({
            _id: 1,
            username: 1,
            name: 1,
            bio: 1,
            avatarURL: 1,
        });

        if (userData) {
            res.status(200).json({
                message: "User fetched",
                userData: userData,
            });
        } else {
            res.status(404).json({
                message: "Could not find user",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Invalid id",
        });
    }
});


/*
Verb: GET
Function: Fetch data for the logged in user
Authorization: User
*/

router.get("/data", verify, async (req, res) => {
    const id = req.user._id;

    try {
        const userData = await User.findOne({ _id: id });

        if (userData) {
            res.status(200).json({
                message: "User fetched",
                userData: userData,
            });
        } else {
            res.status(404).json({
                message: "Could not find user",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Invalid id",
        });
    }
});

/*
Verb: PATCH
Function: Updates data for the logged in user
Authorization: User
*/

router.patch("/data", verify, async (req, res) => {
    const id = req.user._id;

    const validate = await Validation.editDataSchema.isValid(req.body);
    if (!validate)
        return res.status(400).json({
            message: "Invalid input",
        });

    let newSettings = {};

    if (req.body.username) {
        try {
            const userExists = await User.findOne({
                username: req.body.username,
            });

            if (userExists) {
                return res.status(409).json({
                    message: "Username is taken",
                });
            } else {
                newSettings.username = req.body.username;
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Could not update settings",
            });
        }
    }

    if (req.body.email) {
        try {
            const emailExists = await User.findOne({ email: req.body.email });

            if (emailExists) {
                newSettings.email = req.body.email;
            } else {
                return res.status(409).json({
                    message: "E-mail is taken",
                });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: "Could not update settings",
            });
        }
    }

    if (req.body.password) {
        const salt = await bcrypt.genSaltSync(10);
        const hashed = await bcrypt.hashSync(req.body.password, salt);
        newSettings.password = hashed;
    }

    if (Object.keys(newSettings).length <= 0)
        return res.status(400).json({
            message: "Invalid input",
        });

    try {
        await User.updateOne({ _id: id }, newSettings);

        res.status(200).json({
            message: "Settings updated",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Could not update settings",
        });
    }
});

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
