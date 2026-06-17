const axios = require("axios");
const headers = {
  Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
};
const db = require("../config/db");

const getRepositoryInfo = async (owner, repo) => {

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`, { headers }
    );

    return response.data;
};

const getUserProfile = async (username) => {
  const response = await axios.get(
    `https://api.github.com/users/${username}`, { headers }
  );

  return response.data;
};

const saveRepository = (repoData) => {
    

    const sql = `
    INSERT INTO repositories
    (name, owner, repo_url, stars, language, forks)
    VALUES (?, ?, ?, ?, ?, ?)
`;
console.log(repoData);

    db.query(
        sql,
        [
            repoData.name,
            repoData.owner,
            repoData.repo_url,
            repoData.stars,
            repoData.language,
            repoData.forks
        ]
    );
};

const findRepositoryByUrl = (repoUrl, callback) => {

    db.query(
        "SELECT * FROM repositories WHERE repo_url = ?",
        [repoUrl],
        callback
    );
};

const getReadme = async (owner, repo) => {
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/readme`, { headers }
  );

  return Buffer.from(
    response.data.content,
    "base64"
  ).toString("utf-8");
};

const getContributors = async (owner, repo) => {

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contributors`, { headers }
    );

    return response.data;
};

const getIssues = async (owner, repo) => {

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues`,{ headers }
    );

    return response.data;
};
const getCommits = async (owner, repo) => {

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/commits`,{ headers }
    );

    return response.data;
};

const getLanguages = async (owner, repo) => {

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/languages`, { headers }
    );

    return response.data;
};

const getAllRepositories = (callback) => {

    db.query(
        "SELECT * FROM repositories ORDER BY created_at DESC",
        callback
    );
};

const getDashboardData = async (
    owner,
    repo
) => {

    const repository =
        await getRepositoryInfo(
            owner,
            repo
        );

    const contributors =
        await getContributors(
            owner,
            repo
        );

    const issues =
        await getIssues(
            owner,
            repo
        );

    return {
        repository,
        contributors,
        issues
    };
};

const getBranches = async (owner, repo) => {
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/branches`,
    { headers }
  );

  return response.data;
};

const compareRepositories = async (req, res) => {
  const { owner1, repo1, owner2, repo2 } = req.params;

  try {
    const repoA = await githubService.getRepositoryInfo(
      owner1,
      repo1
    );

    const repoB = await githubService.getRepositoryInfo(
      owner2,
      repo2
    );

    res.json({
      repoA: {
        name: repoA.name,
        stars: repoA.stargazers_count,
        forks: repoA.forks_count,
        issues: repoA.open_issues_count,
        watchers: repoA.watchers_count,
        language: repoA.language,
      },
      repoB: {
        name: repoB.name,
        stars: repoB.stargazers_count,
        forks: repoB.forks_count,
        issues: repoB.open_issues_count,
        watchers: repoB.watchers_count,
        language: repoB.language,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to compare repositories",
    });
  }
};

const getRepoTree = async (owner, repo) => {
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`,
    { headers }
  );

  return response.data.tree;
};

const getFileContent = async (owner, repo, path) => {
  const response = await axios.get(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    { headers }
  );

  return Buffer.from(
    response.data.content,
    "base64"
  ).toString("utf8");
};

const searchFiles = async (
  owner,
  repo,
  keyword
) => {
  const tree =
    await getRepoTree(
      owner,
      repo
    );

  return tree.filter(
    (file) =>
      file.type === "blob" &&
      file.path
        .toLowerCase()
        .includes(
          keyword.toLowerCase()
        )
  );
};

module.exports = {
    getRepositoryInfo,
    saveRepository,
    searchFiles,
    compareRepositories,
    getUserProfile,
    getFileContent,
    findRepositoryByUrl,
    getContributors,
    getIssues,
    getAllRepositories,
    getDashboardData,
    getLanguages,
    getBranches,
    getReadme,
    getCommits,
    getRepoTree 
};