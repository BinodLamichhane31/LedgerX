const { body } = require("express-validator");

exports.registerValidation = [
    body("fname").notEmpty().withMessage("First name is required"),
    body("lname").notEmpty().withMessage("Last name is required"),
    body("email").isEmail().withMessage("Invalid email format"),
    body("phone").isMobilePhone('ne-NP').withMessage("Invalid phone number."),
    body("password")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .withMessage("Password must be at least 8 characters with uppercase, lowercase, digit, and special character")
        .custom((value, { req }) => {
            const lowerPassword = value.toLowerCase();
            if (req.body.fname && lowerPassword.includes(req.body.fname.toLowerCase())) {
                throw new Error("Password cannot contain your first name");
            }
            if (req.body.lname && lowerPassword.includes(req.body.lname.toLowerCase())) {
                throw new Error("Password cannot contain your last name");
            }
            return true;
        }),
];

exports.loginValidation = [
    body("email").notEmpty().withMessage("Email is required"),
    body("password").notEmpty().withMessage("Password is required"),
];

exports.changePasswordValidation = [
    body("oldPassword").notEmpty().withMessage("Old password is required"),
    body("newPassword")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/)
        .withMessage("Password must be at least 8 characters with uppercase, lowercase, digit, and special character"),
];
