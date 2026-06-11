const axios = require("axios");

const askRepository = async (req, res) => {
  const { question } = req.body;

  try {
    res.json({
      answer: `AI received: ${question}`
    });
  } catch (error) {
    res.status(500).json({
      message: "AI request failed"
    });
  }
};

module.exports = {
  askRepository
};