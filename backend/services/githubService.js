const axios = require("axios");
const db = require("../config/db");

const getRepositoryInfo = async (owner, repo) => {

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`
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

const getContributors = async (owner, repo) => {

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/contributors`
    );

    return response.data;
};

const getIssues = async (owner, repo) => {

    const response = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/issues`
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

module.exports = {
    getRepositoryInfo,
    saveRepository,
    findRepositoryByUrl,
    getContributors,
    getIssues,
    getAllRepositories,
    getDashboardData
};