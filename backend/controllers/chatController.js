const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY
);

const askRepository = async (req, res) => {
  const { question } = req.body;

  res.json({
    answer: `Repository Assistant: ${question}`
  });
};

module.exports = {
  askRepository,
};