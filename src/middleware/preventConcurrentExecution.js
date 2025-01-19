// Middleware to prevent concurrent execution
let isProcessing = false;

const preventConcurrentExecution = async (req, res, next) => {
  if (isProcessing) {
    // If already processing, return a 429 Too Many Requests response
    // console.log("isProcessing",isProcessing)
    return res
      .status(429)
      .json({ message: "API is currently busy. Please try again later." });

  }

  // Mark as processing
  isProcessing = true;
  // console.log("isProcessing",isProcessing)
  // await new Promise(resolve => setTimeout(resolve, 100)); // Simulate a delay


  try {
    // Proceed to the next middleware/handler
    await next();
  } catch (err) {
    // In case of an error, ensure we reset the processing status
    isProcessing = false;
    return next(err); // Pass the error to the error handling middleware
  }

  // After request processing is complete, reset the processing status
  isProcessing = false;
};

// console.log("isProcessing", isProcessing);
module.exports = { preventConcurrentExecution };
