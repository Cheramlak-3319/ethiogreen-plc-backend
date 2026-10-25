const { spawn } = require("child_process");

module.exports = async (req, res) => {
    const phpProcess = spawn("php", ["artisan", "serve"]); // Or custom route handler

    // Handle request routing manually...
};
