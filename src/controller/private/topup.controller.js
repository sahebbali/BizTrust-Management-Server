const getDatesInRange = require("../../config/getDatesInRange");
const { PackageBuyInfo } = require("../../models/topup.model");

const getTopupHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchById = req.query.searchById || null;
    const startDate = new Date(req?.query?.startDate).toDateString();
    const endDate = new Date(req?.query?.endDate).toDateString();
    const downloadCSV = req.query.csv || "";

    const queryFilter = {
      packageType: { $ne: "Withdraw IA" },
    };

    if (searchById) {
      queryFilter.userId = searchById;
    }

    if (!startDate.includes("Invalid") && !endDate.includes("Invalid")) {
      queryFilter["packageInfo.date"] = {
        $in: getDatesInRange(startDate, endDate),
      };
    }

    const options = {
      page: page,
      limit: limit,
      sort: { createdAt: -1 },
    };

    const total = await PackageBuyInfo.aggregate([
      {
        $match: queryFilter,
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$upgradedAmount" },
        },
      },
    ]);

    const packageInfos = await PackageBuyInfo.paginate(queryFilter, options);
    packageInfos.totalAmount = total[0]?.totalAmount || 0;

    if (downloadCSV) {
      const csvData = await PackageBuyInfo.find(queryFilter);
      return res.status(200).json({ csv: csvData, data: packageInfos });
    }

    return res.status(200).json({ data: packageInfos });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

module.exports = { getTopupHistory };
