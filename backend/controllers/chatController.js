const OpenAI = require("openai");
const githubService =
  require("../services/githubService");

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const askRepository = async (req, res) => {
  try {
    const { question,owner,
  repo } = req.body;

  const keywords =
  question
    .toLowerCase()
    .split(" ")
    .filter(word => word.length > 3);

let matchedFiles = [];

for (const keyword of keywords) {
  const results =
    await githubService.searchFiles(
      owner,
      repo,
      keyword
    );

  matchedFiles.push(
    ...results.slice(0, 3)
  );
}

let codeContext = "";

for (const file of matchedFiles.slice(0, 3)) {
  try {
    const content =
      await githubService.getFileContent(
        owner,
        repo,
        file.path
      );

    codeContext += `
FILE: ${file.path}

${content.substring(0, 2000)}

`;
  } catch (err) {
    console.log(err);
  }
}



    const response =
      await client.chat.completions.create({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "user",
            content: `
Repository: ${owner}/${repo}

Repository code:

${codeContext}

Question:
${question}

Answer using the code above.
`,
          },
        ],
      });

    const answer =
      response.choices[0].message.content;

    res.json({ answer });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        error.message || "AI failed",
    });
  }
};

module.exports = {
  askRepository,
};