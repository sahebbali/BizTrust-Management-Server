const { Web3 } = require("web3");
const Tx = require("ethereumjs-tx");
const Withdraw = require("../../models/withdraw.model");
const sendEmailNotification = require("../../config/mailNotification");
const User = require("../../models/auth.model");
const { PackageBuyInfo } = require("../../models/topup.model");
const getIstTime = require("../../config/getTime");
const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";

const erc20_abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "spender",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "nonpayable",
    type: "function",
  },
];

// const web3 = new Web3(
//   new Web3.providers.HttpProvider("https://rpc.ankr.com/bsc")
// );

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.bnbchain.org")
);

// console.log(USDT_ADDRESS);
const contractInstance = new web3.eth.Contract(erc20_abi, USDT_ADDRESS);

// Get Admin all balance
const getAdminbalance = async (_req, res) => {
  try {
    const MY_WalletAddress = process.env.ADMIN_WALLET_ADDRESS;
    const balance1 = await web3.eth.getBalance(MY_WalletAddress);
    const balanceInReal1 = web3.utils.fromWei(balance1, "ether");

    const balance2 = await contractInstance.methods
      .balanceOf(process.env.ADMIN_WALLET_ADDRESS)
      .call();
    const balanceInReal2 = web3.utils.fromWei(balance2, "ether");

    return res
      .status(200)
      .json({ usdtBalance: balanceInReal2, bnbBalance: balanceInReal1 });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Getting admin's BNB balance
const getAdminBNBBalance = async (req, res) => {
  try {
    const MY_WalletAddress = process.env.ADMIN_WALLET_ADDRESS;
    const balance = await web3.eth.getBalance(MY_WalletAddress);
    const balanceInReal = web3.utils.fromWei(balance, "ether");

    return res.status(200).json({ data: balanceInReal });
  } catch (error) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Getting admin's USDT balance
const getAdminUSDTBalance = async (req, res) => {
  try {
    const MY_WalletAddress = process.env.ADMIN_WALLET_ADDRESS;
    console.log("1");
    const balance = await contractInstance.methods
      .balanceOf(process.env.ADMIN_WALLET_ADDRESS)
      .call();
    console.log("2");
    const balanceInReal = web3.utils.fromWei(balance, "ether");
    return res.status(200).json({ data: balanceInReal });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

const SendMail = async (userId, requestAmount) => {
  console.log("my id", userId);
  const currentUser = await User.findOne({ userId });
  // Send mail notification to user email with request status
  sendEmailNotification(
    currentUser?.userId,
    currentUser?.fullName,
    currentUser?.email,
    "Withdrawal Request Status Update",
    requestAmount,
    "Your withdrawal request has been successfully processed, and the funds have been transferred to your designated account.",
    "withdrawal"
  );
};

const PackageInfoHistory = async (userId, requestAmount) => {
  console.log("hello");
  const currentUser = await User.findOne({ userId });
  await PackageBuyInfo.create({
    userId: currentUser.userId,
    userFullName: currentUser.userFullName,
    sponsorId: currentUser.sponsorId,
    sponsorName: currentUser.sponsorName,
    packageInfo: {
      amount: requestAmount,
      date: new Date(getIstTime().date).toDateString(),
      time: getIstTime().time,
    },
    packageType: "Withdraw IA",
  });
};
// const sendToken = async (req, res) => {
//   let { transaction_id, receiverAddress, value = 1.0, userId } = req.body;
//   // console.log(receiverAddress, value, userId);
//   const alreadySucceed = await Withdraw.findOne({
//     transactionId: transaction_id,
//   });
//   if (
//     alreadySucceed?.status === "success" ||
//     alreadySucceed?.status === "rejected"
//   ) {
//     return res.status(400).json({ message: "Fund transfered already" });
//   }
//   try {
//     const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
//     const MY_WalletAddress = "0xF5d32f902F93a77E183Bec40da12Dc90308555f9";
//     const PRIVATE_KEY = process.env.PRIVATE_KEY;

//     console.log("receiverAddress", receiverAddress);
//     console.log(
//       `trx address = ${receiverAddress} && value = ${typeof value}  ${value} && userId = ${userId}`
//     );
//     console.log("receiverAddress", receiverAddress);
//     await web3.eth.getTransactionCount(MY_WalletAddress);
//     // console.log("##1@1", MY_WalletAddress, value);
//     const amount = web3.utils.numberToHex(web3.utils.toWei(value, "ether"));
//     const gasLimit = await contractInstance.methods
//       .transfer(receiverAddress, amount)
//       .estimateGas({ from: MY_WalletAddress });
//     const bufferedGasLimit = Math.round(
//       Number(gasLimit) + Number(gasLimit) * Number(0.2)
//     );
//     const gasPrice = await web3.eth.getGasPrice();
//     const tx = {
//       from: MY_WalletAddress,
//       gasPrice: gasPrice,
//       gasLimit: bufferedGasLimit,
//       to: USDT_ADDRESS,
//       value: "0x0",
//       data: contractInstance.methods
//         .transfer(receiverAddress, amount)
//         .encodeABI(),
//     };
//     const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
//     const x = signedTx.rawTransaction || "";
//     const transaction = await web3.eth.sendSignedTransaction(x);

//     // create history in database

//     await Withdraw.findOneAndUpdate(
//       {
//         transactionId: transaction_id,
//       },
//       {
//         $set: {
//           transactionHash: transaction.transactionHash,
//           status: "success",
//         },
//       }
//     );
//      // Send mail notification to user email with request status
//      sendEmailNotification(
//       alreadySucceed?.userId,
//       currentUser?.fullName,
//       currentUser?.email,
//       "Withdrawal Request Status Update",
//       currentWithdraw.requestAmount,
//       "Your withdrawal request has been successfully processed, and the funds have been transferred to your designated account.",
//       "withdrawal"
//     );

//     // ...........///
//     return res.status(200).json({
//       status: true,
//       message: "Success",
//       txnHash: transaction.transactionHash,
//       explorerLink: `https://bscscan.com/tx/${transaction.transactionHash}`,
//     });
//   } catch (error) {
//     console.log(error);

//     return res.status(200).json({
//       status: false,
//       message: "Withdraw did not succeed",
//       data: error.message,
//     });
//   }
// };
// edit
const sendToken = async (req, res) => {
  let { transaction_id, receiverAddress, value = 1.0, userId } = req.body;
  // need delect line
  console.log(req.body);
  // need delect line
  // console.log(receiverAddress, value, userId);
  const alreadySucceed = await Withdraw.findOne({
    transactionId: transaction_id,
  });
  if (
    alreadySucceed?.status === "success" ||
    alreadySucceed?.status === "reject"
  ) {
    return res.status(400).json({ message: "Fund transfered already" });
  }
  try {
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    // const MY_WalletAddress = "0xF5d32f902F93a77E183Bec40da12Dc90308555f9";
    const MY_WalletAddress = process.env.ADMIN_WALLET_ADDRESS;

    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    console.log("receiverAddress", receiverAddress);
    console.log(
      `trx address = ${receiverAddress} && value = ${typeof value}  ${value} && userId = ${userId}`
    );
    console.log("receiverAddress", receiverAddress);
    await web3.eth.getTransactionCount(MY_WalletAddress);
    // console.log("##1@1", MY_WalletAddress, value);
    const amount = web3.utils.numberToHex(web3.utils.toWei(value, "ether"));
    const gasLimit = await contractInstance.methods
      .transfer(receiverAddress, amount)
      .estimateGas({ from: MY_WalletAddress });
    const bufferedGasLimit = Math.round(
      Number(gasLimit) + Number(gasLimit) * Number(0.3)
    );
    const gasPrice = await web3.eth.getGasPrice();
    const tx = {
      from: MY_WalletAddress,
      gasPrice: gasPrice,
      gasLimit: bufferedGasLimit,
      to: USDT_ADDRESS,
      value: "0x0",
      data: contractInstance.methods
        .transfer(receiverAddress, amount)
        .encodeABI(),
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    const x = signedTx.rawTransaction || "";
    const transaction = await web3.eth.sendSignedTransaction(x);

    // create history in database

    await Withdraw.findOneAndUpdate(
      {
        transactionId: transaction_id,
      },
      {
        $set: {
          transactionHash: transaction.transactionHash,
          status: "success",
        },
      }
    );
    // if Withdraw request will investment type the insert data in packagebuyinfos
    if (alreadySucceed.withdrawType === "investment") {
      PackageInfoHistory(alreadySucceed.userId, alreadySucceed.requestAmount);
    }
    // Email Function On Successful transition
    console.log({ userId });
    console.log("Amount", alreadySucceed.requestAmount);
    SendMail(alreadySucceed.userId, alreadySucceed.requestAmount);

    // ...........///
    return res.status(200).json({
      status: true,
      message: "Success",
      txnHash: transaction.transactionHash,
      explorerLink: `https://bscscan.com/tx/${transaction.transactionHash}`,
    });
  } catch (error) {
    console.log(error);

    return res.status(200).json({
      status: false,
      message: "Withdraw did not succeed",
      data: error.message,
    });
  }
};
const sendToken1 = async (
  transaction_id,
  receiverAddress,
  value = 1.0,
  userId
) => {
  // let { receiverAddress, value = 1.0, userId } = req.body;
  // console.log(receiverAddress, value, userId);
  try {
    const USDT_ADDRESS = "0x55d398326f99059fF775485246999027B3197955";
    const MY_WalletAddress = process.env.ADMIN_WALLET_ADDRESS; // Prev= 0x42F884973FcdA45461dba1680792105FaEdFfaAC
    // const MY_WalletAddress = "0xF5d32f902F93a77E183Bec40da12Dc90308555f9"; // Prev= 0x42F884973FcdA45461dba1680792105FaEdFfaAC
    const PRIVATE_KEY = process.env.PRIVATE_KEY;

    console.log("receiverAddress", receiverAddress);
    console.log(
      `trx address = ${receiverAddress} && value = ${typeof value}  ${value} && userId = ${userId}`
    );
    console.log("receiverAddress", receiverAddress);
    await web3.eth.getTransactionCount(MY_WalletAddress);
    // console.log("##1@1", MY_WalletAddress, value);
    const amount = web3.utils.numberToHex(web3.utils.toWei(value, "ether"));
    const gasLimit = await contractInstance.methods
      .transfer(receiverAddress, amount)
      .estimateGas({ from: MY_WalletAddress });
    const bufferedGasLimit = Math.round(
      Number(gasLimit) + Number(gasLimit) * Number(0.4)
    );
    const gasPrice = await web3.eth.getGasPrice();
    const tx = {
      from: MY_WalletAddress,
      gasPrice: gasPrice,
      gasLimit: bufferedGasLimit,
      to: USDT_ADDRESS,
      value: "0x0",
      data: contractInstance.methods
        .transfer(receiverAddress, amount)
        .encodeABI(),
    };
    const signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY);
    const x = signedTx.rawTransaction || "";
    const transaction = await web3.eth.sendSignedTransaction(x);

    // find transactionId to do AUtoWithdrawPaymet in database
    // const findTxnID = await Withdraw.findOne({
    //   transactionId: transaction_id,
    // });

    // Update transactionId to do AUtoWithdrawPaymet in database

    await Withdraw.findOneAndUpdate(
      {
        transactionId: transaction_id,
      },
      {
        $set: {
          transactionHash: transaction.transactionHash,
        },
      }
    );

    // ...........///
    return {
      status: true,
      message: "Success",
      txnHash: transaction.transactionHash,
      explorerLink: `https://bscscan.com/tx/${transaction.transactionHash}`,
    };
  } catch (error) {
    console.log(error);

    return {
      status: false,
      message: "Withdraw did not succeed",
      data: error.message,
    };
  }
};

module.exports = {
  getAdminBNBBalance,
  getAdminUSDTBalance,
  getAdminbalance,
  sendToken,
  sendToken1,
};
