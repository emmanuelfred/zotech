const router = require('express').Router();
const { User } = require("../models/user");
const Joi = require("joi");
const bcrypt = require('bcryptjs');

const validate = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required().label("Email"),
        password: Joi.string().required().label("Password")
    });
    return schema.validate(data);
};

router.post("/", async (req, res) => {
    try {
        const { error } = validate(req.body);
        if (error) return res.status(400).send({ message: error.details[0].message });

        const user = await User.findOne({ email: req.body.email });
        console.log("User found:", user);
        if (!user) return res.status(401).send({ message: "Invalid Email or Password" });
        console.log("Entered Password:", req.body.password);
        console.log("Stored Hashed Password:", user.password);


        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).send({ message: "Invalid Email or Password" });

        const token = user.generateAuthToken(); // Ensure this function exists in the User model

        // ✅ Return user role & token
        res.status(200).send({
            token,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role, // Ensure 'role' exists in your User schema
            },
            message: "Logged in successfully"
        });

    } catch (error) {
        res.status(500).send({ message: "Internal server error" });
    }
});



module.exports = router;
