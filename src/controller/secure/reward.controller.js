const { Reward } = require("../../models/reward.model")


const getRewardController = async (_req, res) => {
    try {
        const reward = await Reward.find({});
        if (reward.length > 0) {
            return res.status(200).json({ data: reward })
        }else{
            return res.status(400).json({message: "Not found"})
        }
    } catch (error) {
        return res.status(400).json({ message: "Something went wrong" })
    }
}

module.exports = { getRewardController }