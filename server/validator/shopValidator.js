const { body } = require("express-validator");

exports.createShopValidation = [
    body("name")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Shop name is required")
        .isLength({ min: 3, max: 100 })
        .withMessage("Shop name must be between 3 and 100 characters"),
    
    body("address")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Address is required")
        .isLength({ min: 5, max: 200 })
        .withMessage("Address must be between 5 and 200 characters"),
    
    body("contactNumber")
        .isString()
        .trim()
        .notEmpty()
        .withMessage("Contact number is required")
        .isMobilePhone('ne-NP')
        .withMessage("Please enter a valid Nepali mobile number (e.g., 98XXXXXXXX)")
];

exports.updateShopValidation = [
    body("name")
        .optional()
        .isString()
        .trim()
        .isLength({ min: 3, max: 100 })
        .withMessage("Shop name must be between 3 and 100 characters"),
    
    body("address")
        .optional()
        .isString()
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage("Address must be between 5 and 200 characters"),
    
    body("contactNumber")
        .optional()
        .isString()
        .trim()
        .isMobilePhone('ne-NP')
        .withMessage("Please enter a valid Nepali mobile number (e.g., 98XXXXXXXX)")
];
