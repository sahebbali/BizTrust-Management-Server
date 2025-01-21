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

const corsOptions = {
  origin: [
    "http://localhost:3000", // localhost
    "http://localhost:3001", // localhost
    "https://sast2.netlify.app", // For testing on production (Netlify)
    "https://safesecure.netlify.app", // For testing on production (Netlify)
    "https://safeandsecuretrade.com", // this for only production
    "https://safeandsecuretrade-backend.vercel.app",
    "https://6587bf257e948ffdaad02fe7--poetic-cheesecake-782870.netlify.app",
    "https://admin.safeandsecuretrade.com",
    "https://adminsafe.netlify.app",
    "https://development.admin.safeandsecuretrade.com",
    "https://development.safeandsecuretrade.com",
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
runRankIncomeDistribution();

// Here will be custom routes
app.use("/api/v1/public", publicRoutes);
app.use("/api/v1/common", commonRoutes);
app.use("/api/v1/private", privateRoutes);
app.use("/api/v1/secure", secureRoutes);
app.use("/payment/api", paymentRoutes);

app.get("/", (req, res) => {
  return res.send("Hello BizTrust Management Production !");
});
app.get("/run", (req, res) => {
  const datas = levelIncome("108569", 4000);
  const data = profitSharingIncome("108569", 4000);
  return res.send("Hello Run !");
});

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
  console.log("Server is running at port ", port);
});
