require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const port = process.env.PORT || 3333;
const app = express();

const secureRoutes = require("./src/routes/secure/index");
const publicRoutes = require("./src/routes/public/index");
const commonRoutes = require("./src/routes/common/index");
const privateRoutes = require("./src/routes/private/index");
const paymentRoutes = require("./src/routes/paymentRoutes/index");

const { notFound, errorHandler } = require("./src/middleware/errorMiddleware");
const {
  preventConcurrentExecution,
} = require("./src/middleware/preventConcurrentExecution");
const runPackageROI = require("./src/utils/runPackageROI");

const { runRankIncomeDistribution } = require("./src/utils/rankIncome");
const levelIncome = require("./src/utils/levelIncome");
const profitSharingIncome = require("./src/utils/profitSharingIncome");
const rewardIncome = require("./src/utils/rewardIncome");
const handleFristROI = require("./src/utils/handleFirstROI");
const runPackageFirstROI = require("./src/utils/runPackageFirstROI");
const handleROI = require("./src/utils/handleROI");
const { CheckUserEarningLimit } = require("./src/utils/CheckUserEarningLimit");
const ProvideExtraEarning = require("./src/utils/ProvideExtraEarning");
const sendDMEmail = require("./src/config/sendDMEmail");

const corsOptions = {
  origin: [
    "http://localhost:3000", // localhost
    "http://localhost:3001", // localhost
    "https://biztrustmanagement.netlify.app",
    "https://grow-boo.com",
  ],
  optionsSuccessStatus: 200,
};
// Middleware
const middleware = [
  cors(corsOptions),
  express.json(),
  express.urlencoded({ extended: true }),
  preventConcurrentExecution,
];
app.use(middleware);
connectDB();

// Run Function
runPackageROI();
runPackageFirstROI();

// Here will be custom routes
app.use("/api/v1/public", publicRoutes);
app.use("/api/v1/common", commonRoutes);
app.use("/api/v1/private", privateRoutes);
app.use("/api/v1/secure", secureRoutes);
app.use("/payment/api", paymentRoutes);

app.get("/", (req, res) => {
  return res.send("Hello Grow-Boo Production !");
});
app.get("/run", (req, res) => {
  // const datas = levelIncome("709996", "mahin", 100000);
  // const data = profitSharingIncome("709996", "mahin", 4000);
  // const data = rewardIncome("582939");
  const data = handleFristROI();
  // const data = handleROI();
  // const data = ProvideExtraEarning("373056");
  // const data = CheckUserEarningLimit(
  //   "373056",
  //   "kadu",
  //   "531286",
  //   "jakir",
  //   25000,
  //   200,
  //   2,
  //   "level-income",
  //   5
  // );
  return res.send("Hello Run !");
});
app.get("/send-email", (req, res) => {
  const data = sendDMEmail("sahebbali253@gmail.com");
  return res.send("Hello Send Email !");
});
app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("Server is running at port ", port);
});
