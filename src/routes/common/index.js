const router = require("express").Router();
const userRouter = require("./user.routes");

// Auth Router
router.use(userRouter)

module.exports = router