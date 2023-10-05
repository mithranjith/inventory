require("dotenv").config();

let CONFIG = {};

CONFIG.port = process.env.PORT || "3200";
CONFIG.db_uri = process.env.MONGODB_URI;

CONFIG.jwt_expiration = process.env.JWT_EXPIRATION || "10000";
CONFIG.jwt_encryption = process.env.JWT_ENCRYPTION || "jwt_please_change";

CONFIG.user_roles = ["user", "manager", "admin"];
CONFIG.user_permissions = ["create-product", "edit-product", "delete-product"];

CONFIG.units = ["Qty", "Ltr", "KG", "Meter"];

module.exports = CONFIG;
