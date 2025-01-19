const { RankTracker } = require("../models/rankIncome.model");
const { PackageRoi } = require("../models/topup.model");
const User = require("../models/auth.model");
const cron = require("node-cron");

const scriptToTrackTheRankEligibility = () => {
  cron.schedule(
    "00 00 00 * * *", // This function will run Every Night 12 AM IST
    async () => {
      const createRankDocument = async (
        user,
        rank,
        date,
        rankStatus,
        directActiveTeamCount,
        directActiveTeamTotalBusiness,
        allActiveTeamTotalBusiness
      ) => {
        await RankTracker.create({
          userId: user.userId,
          fullName: user.fullName,
          sponsorId: user.sponsorId,
          sponsorName: user.sponsorName,
          rank: rank,
          rankStatus: rankStatus,
          currentRank: user.rank ? user.rank : "",
          rankAchieveDate: date,
          directActiveTeamCount: directActiveTeamCount,
          directActiveTeamTotalBusiness: directActiveTeamTotalBusiness,
          allActiveTeamTotalBusiness: allActiveTeamTotalBusiness,
        });
      };

      const calculateTotalBusinessOfIndividualUser = async (userId) => {
        const [result] = await PackageRoi.aggregate([
          {
            $match: { userId: userId },
          },
          {
            $project: {
              userId: 1,
              totalAmount: { $sum: "$currentPackage" },
            },
          },
        ]);

        return result?.totalAmount || 0;
      };

      const calculateTeamBusinesses = async (user) => {
        let directActiveTeamTotalBusiness = 0;
        let allActiveTeamTotalBusiness = 0;

        for (const teamUser of user.team) {
          const activeUser = await User.findOne({
            userId: teamUser.userId,
            isActive: true,
          });

          if (activeUser) {
            if (teamUser.level === "1") {
              const totalBusiness =
                await calculateTotalBusinessOfIndividualUser(teamUser.userId);

              directActiveTeamTotalBusiness += totalBusiness;
            }
            const totalBusiness = await calculateTotalBusinessOfIndividualUser(
              teamUser.userId
            );

            allActiveTeamTotalBusiness += totalBusiness;
          }
        }

        return {
          directActiveTeamTotalBusiness: directActiveTeamTotalBusiness,
          allActiveTeamTotalBusiness: allActiveTeamTotalBusiness,
        };
      };

      const runTheScript = async () => {
        const allUsersExcludingAdmin = await User.find({
          userId: {
            $ne: "admin",
          },
        });

        // const check = [];
        for (const user of allUsersExcludingAdmin) {
          console.log(
            user.userId,
            " From scriptToTrackTheRankEligibility function. Line: 87"
          );
          const directActiveTeamCount = await User.countDocuments({
            sponsorId: user.userId,
            isActive: true,
          });

          const { directActiveTeamTotalBusiness, allActiveTeamTotalBusiness } =
            await calculateTeamBusinesses(user);

          // const userRankIncomes = await RankIncome.find({
          //   userId: user.userId,
          // }).sort({ createdAt: -1 });

          // check.push({
          //   userId: user.userId,
          //   directActiveTeamCount: directActiveTeamCount,
          //   directActiveTeamTotalBusiness: directActiveTeamTotalBusiness,
          //   allActiveTeamTotalBusiness: allActiveTeamTotalBusiness,
          //   theLastRank: userRankIncomes[0].rank,
          //   theLastRankAchievementDate: userRankIncomes[0].date,
          // });

          // console.log(
          //   user.userId,
          //   directActiveTeamCount,
          //   directActiveTeamTotalBusiness,
          //   allActiveTeamTotalBusiness
          // );

          if (
            directActiveTeamTotalBusiness >= 70000 &&
            allActiveTeamTotalBusiness >= 1900000
          ) {
            await createRankDocument(
              user,
              "legend-diamond",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamTotalBusiness >= 60000 &&
            allActiveTeamTotalBusiness >= 1300000
          ) {
            await createRankDocument(
              user,
              "double-crown-diamond",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamTotalBusiness >= 50000 &&
            allActiveTeamTotalBusiness >= 800000
          ) {
            await createRankDocument(
              user,
              "crown-diamond",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamTotalBusiness >= 40000 &&
            allActiveTeamTotalBusiness >= 400000
          ) {
            await createRankDocument(
              user,
              "double-platinum-diamond",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamTotalBusiness >= 30000 &&
            allActiveTeamTotalBusiness >= 200000
          ) {
            await createRankDocument(
              user,
              "platinum-diamond",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamCount >= 25 &&
            directActiveTeamTotalBusiness >= 16000 &&
            allActiveTeamTotalBusiness >= 100000
          ) {
            await createRankDocument(
              user,
              "double-diamond",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamCount >= 20 &&
            directActiveTeamTotalBusiness >= 8000 &&
            allActiveTeamTotalBusiness >= 50000
          ) {
            await createRankDocument(
              user,
              "diamond",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamCount >= 15 &&
            directActiveTeamTotalBusiness >= 4000 &&
            allActiveTeamTotalBusiness >= 20000
          ) {
            await createRankDocument(
              user,
              "ruby",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamCount >= 10 &&
            directActiveTeamTotalBusiness >= 2000 &&
            allActiveTeamTotalBusiness >= 10000
          ) {
            await createRankDocument(
              user,
              "gold",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else if (
            directActiveTeamCount >= 5 &&
            directActiveTeamTotalBusiness >= 1000 &&
            allActiveTeamTotalBusiness >= 5000
          ) {
            await createRankDocument(
              user,
              "silver",
              new Date().toDateString(),
              true,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          } else {
            await createRankDocument(
              user,
              "",
              "",
              false,
              directActiveTeamCount,
              directActiveTeamTotalBusiness,
              allActiveTeamTotalBusiness
            );
          }

          // console.log(directActiveTeamCount);
          // console.log(directActiveTeamTotalBusiness);
          // console.log(allActiveTeamTotalBusiness);
        }
      };

      runTheScript();
    },
    { scheduled: true, timezone: "Asia/Kolkata" }
  );

  // const createRankDocument = async (
  //   user,
  //   rank,
  //   date,
  //   rankStatus,
  //   directActiveTeamCount,
  //   directActiveTeamTotalBusiness,
  //   allActiveTeamTotalBusiness
  // ) => {
  //   await RankTracker.create({
  //     userId: user.userId,
  //     fullName: user.fullName,
  //     sponsorId: user.sponsorId,
  //     sponsorName: user.sponsorName,
  //     rank: rank,
  //     rankStatus: rankStatus,
  //     currentRank: user.rank ? user.rank : "",
  //     rankAchieveDate: date,
  //     directActiveTeamCount: directActiveTeamCount,
  //     directActiveTeamTotalBusiness: directActiveTeamTotalBusiness,
  //     allActiveTeamTotalBusiness: allActiveTeamTotalBusiness,
  //   });
  // };

  // const calculateTotalBusinessOfIndividualUser = async (userId) => {
  //   const [result] = await PackageRoi.aggregate([
  //     {
  //       $match: { userId: userId },
  //     },
  //     {
  //       $project: {
  //         userId: 1,
  //         totalAmount: { $sum: "$currentPackage" },
  //       },
  //     },
  //   ]);

  //   return result?.totalAmount || 0;
  // };

  // const calculateTeamBusinesses = async (user) => {
  //   let directActiveTeamTotalBusiness = 0;
  //   let allActiveTeamTotalBusiness = 0;

  //   for (const teamUser of user.team) {
  //     const activeUser = await User.findOne({
  //       userId: teamUser.userId,
  //       isActive: true,
  //     });

  //     if (activeUser) {
  //       if (teamUser.level === "1") {
  //         const totalBusiness = await calculateTotalBusinessOfIndividualUser(
  //           teamUser.userId
  //         );

  //         directActiveTeamTotalBusiness += totalBusiness;
  //       }
  //       const totalBusiness = await calculateTotalBusinessOfIndividualUser(
  //         teamUser.userId
  //       );

  //       allActiveTeamTotalBusiness += totalBusiness;
  //     }
  //   }

  //   return {
  //     directActiveTeamTotalBusiness: directActiveTeamTotalBusiness,
  //     allActiveTeamTotalBusiness: allActiveTeamTotalBusiness,
  //   };
  // };

  // const runTheScript = async () => {
  //   const allUsersExcludingAdmin = await User.find({
  //     userId: {
  //       $ne: "admin",
  //     },
  //   });

  //   // const check = [];
  //   for (const user of allUsersExcludingAdmin) {
  //     console.log(
  //       user.userId,
  //       " From scriptToTrackTheRankEligibility function. Line: 87"
  //     );
  //     const directActiveTeamCount = await User.countDocuments({
  //       sponsorId: user.userId,
  //       isActive: true,
  //     });

  //     const { directActiveTeamTotalBusiness, allActiveTeamTotalBusiness } =
  //       await calculateTeamBusinesses(user);

  //     // const userRankIncomes = await RankIncome.find({
  //     //   userId: user.userId,
  //     // }).sort({ createdAt: -1 });

  //     // check.push({
  //     //   userId: user.userId,
  //     //   directActiveTeamCount: directActiveTeamCount,
  //     //   directActiveTeamTotalBusiness: directActiveTeamTotalBusiness,
  //     //   allActiveTeamTotalBusiness: allActiveTeamTotalBusiness,
  //     //   theLastRank: userRankIncomes[0].rank,
  //     //   theLastRankAchievementDate: userRankIncomes[0].date,
  //     // });

  //     // console.log(
  //     //   user.userId,
  //     //   directActiveTeamCount,
  //     //   directActiveTeamTotalBusiness,
  //     //   allActiveTeamTotalBusiness
  //     // );

  //     if (
  //       directActiveTeamTotalBusiness >= 70000 &&
  //       allActiveTeamTotalBusiness >= 1900000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "legend-diamond",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamTotalBusiness >= 60000 &&
  //       allActiveTeamTotalBusiness >= 1300000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "double-crown-diamond",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamTotalBusiness >= 50000 &&
  //       allActiveTeamTotalBusiness >= 800000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "crown-diamond",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamTotalBusiness >= 40000 &&
  //       allActiveTeamTotalBusiness >= 400000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "double-platinum-diamond",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamTotalBusiness >= 30000 &&
  //       allActiveTeamTotalBusiness >= 200000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "platinum-diamond",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamCount >= 25 &&
  //       directActiveTeamTotalBusiness >= 16000 &&
  //       allActiveTeamTotalBusiness >= 100000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "double-diamond",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamCount >= 20 &&
  //       directActiveTeamTotalBusiness >= 8000 &&
  //       allActiveTeamTotalBusiness >= 50000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "diamond",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamCount >= 15 &&
  //       directActiveTeamTotalBusiness >= 4000 &&
  //       allActiveTeamTotalBusiness >= 20000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "ruby",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamCount >= 10 &&
  //       directActiveTeamTotalBusiness >= 2000 &&
  //       allActiveTeamTotalBusiness >= 10000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "gold",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else if (
  //       directActiveTeamCount >= 5 &&
  //       directActiveTeamTotalBusiness >= 1000 &&
  //       allActiveTeamTotalBusiness >= 5000
  //     ) {
  //       await createRankDocument(
  //         user,
  //         "silver",
  //         new Date().toDateString(),
  //         true,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     } else {
  //       await createRankDocument(
  //         user,
  //         "",
  //         "",
  //         false,
  //         directActiveTeamCount,
  //         directActiveTeamTotalBusiness,
  //         allActiveTeamTotalBusiness
  //       );
  //     }

  //     // console.log(directActiveTeamCount);
  //     // console.log(directActiveTeamTotalBusiness);
  //     // console.log(allActiveTeamTotalBusiness);
  //   }
  // };

  // runTheScript();

  // const rankIncomes = await RankIncome.find({});
  // const uniqueIds = [];
  // for (const income of rankIncomes) {
  //   if (!uniqueIds.includes(income.userId)) {
  //     uniqueIds.push(income.userId);
  //   }
  // }

  // const ex = [];
  // const nex = [];
  // for (const id of uniqueIds) {
  //   const is = await RankTracker.findOne({
  //     userId: id,
  //     rankStatus: true,
  //   });
  //   if (is) {
  //     ex.push(id);
  //   } else {
  //     nex.push(id);
  //   }
  // }
  // console.log(ex);
  // console.log(nex);
};

module.exports = scriptToTrackTheRankEligibility;
