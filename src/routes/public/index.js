const router = require("express").Router();
const authRouter = require("./auth.routes");

// Auth Router
router.use(authRouter)

module.exports = router