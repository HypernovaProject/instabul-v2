const router = require("express").Router();

const verify = require("../middleware/verifyToken");

const Posts = require("../models/posts");

const Validation = require("../utility/validation");

/*
Verb: GET
Function: Fetch data for all posts
Authorization: User
*/

router.get("/all", verify, async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const postData = await Posts.find({})
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();

    const count = await Posts.countDocuments({});

    if (postData && postData.length > 0) {
        res.status(200).json({
            postData,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
        });
    } else {
        res.status(404).json({
            message: "Could not find any posts",
        });
    }
});

/*
Verb: POST
Function: Create new post
Authorization: User
*/

router.post("/create", verify, async (req, res) => {
    let postData = req.body;
    postData._userId = req.user._id;
    postData._username = req.user.username;

    const validate = await Validation.createPostSchema.isValid(postData);
    if (!validate)
        return res.status(400).json({
            message: "Invalid input",
        });

    try {
        const post = new Posts(postData);
        await post.save();

        res.status(201).json({
            message: "Post created",
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Could not create post",
        });
    }
});

/*
Verb: PATCH
Function: Update a post specified by _id
Authorization: User
*/

router.patch("/update/:id", verify, async (req, res) => {
    const postData = req.body;
    const id = req.params.id;
    const userId = req.user._id;

    const validate = await Validation.editPostSchema.isValid(postData);
    if (!validate)
        return res.status(400).json({
            message: "Invalid input",
        });

    try {
        const existPost = await Posts.findOne({
            $and: [{ _id: id }, { _userId: userId }],
        });
        if (!existPost)
            return res.status(404).json({
                message: "Post not found",
            });

        try {
            postData.LastEdit = new Date();

            await Posts.updateOne(
                {
                    $and: [{ _id: id }, { _userId: userId }],
                },
                postData
            );
            
            res.status(200).json({
                message: "Post updated",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Could not update post",
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
Verb: DELETE
Function: Delete a post specified by _id
Authorization: User
*/

router.delete("/delete/:id", verify, async (req, res) => {
    const id = req.params.id;
    const userId = req.user._id;

    try {
        const postData = await Posts.findOne({
            $and: [{ _id: id }, { _userId: userId }],
        });
        if (!postData)
            return res.status(404).json({
                message: "Post not found",
            });

        try {
            await Posts.deleteOne({
                $and: [{ _id: id }, { _userId: userId }],
            });

            res.status(200).json({
                message: "Post deleted",
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "Could not delete post",
            });
        }
    } catch (error) {
        console.log(error);
        res.status(400).json({
            message: "Invalid id",
        });
    }
});

module.exports = router;
