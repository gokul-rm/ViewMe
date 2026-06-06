const githubService = require("../services/githubService");

const analyzeRepository = async (req, res) => {

    const { repoUrl } = req.body;

    const parts = repoUrl.split("/");

    const owner = parts[3];
    const repo = parts[4].replace(".git", "");

    try {

        const data = await githubService.getRepositoryInfo(
            owner,
            repo
        );




        const repositoryData = {
            name: data.name,
            owner: data.owner.login,
            avatar: data.owner.avatar_url,
            repo_url: repoUrl,
            stars: data.stargazers_count,
            language: data.language,
            description: data.description,
            license: data.license?.name || "No License",
            topics: data.topics,
            createdAt: data.created_at,
updatedAt: data.updated_at,
            forks: data.forks_count,
            watchers: data.watchers_count,
            openIssues: data.open_issues_count
        };


        githubService.findRepositoryByUrl(
            repoUrl,
            (err, results) => {

                if (err) {
                    return res.status(500).json({
                        message: "Database error"
                    });
                }

                if (results.length > 0) {
    return res.json({
    ...results[0],
    description: data.description,
    license: data.license?.name || "No License",
    topics: data.topics,
    createdAt: data.created_at,
updatedAt: data.updated_at,
    forks: data.forks_count,
    watchers: data.watchers_count,
    openIssues: data.open_issues_count
});
}

                githubService.saveRepository(
                    repositoryData
                );

                res.json(repositoryData);
            }
        );

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Failed to fetch repository"
        });

    }
};

const getContributors = async (req, res) => {

    const { owner, repo } = req.params;

    try {

        const contributors =
    await githubService.getContributors(
        owner,
        repo
    );

const simplifiedContributors =
    contributors.map((contributor) => ({
        login: contributor.login,
        contributions: contributor.contributions
    }));

res.json(simplifiedContributors.slice(0,10));

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch contributors"
        });

    }
};

const getIssues = async (req, res) => {

    const { owner, repo } = req.params;

    try {

        const issues =
            await githubService.getIssues(
                owner,
                repo
            );

        const simplifiedIssues =
            issues.slice(0, 10).map((issue) => ({
                title: issue.title,
                state: issue.state
            }));

        res.json(simplifiedIssues);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch issues"
        });

    }
};

const getCommits = async (req, res) => {

    const { owner, repo } = req.params;

    try {

        const commits =
            await githubService.getCommits(
                owner,
                repo
            );

        const simplifiedCommits =
            commits.slice(0, 10).map((commit) => ({
                message: commit.commit.message,
                author: commit.commit.author.name,
                date: commit.commit.author.date
            }));

        res.json(simplifiedCommits);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch commits"
        });

    }
};

const getLanguages = async (req, res) => {

    const { owner, repo } = req.params;

    try {

        const languages =
            await githubService.getLanguages(
                owner,
                repo
            );

        res.json(languages);

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch languages"
        });

    }
};

const getAllRepositories = (req, res) => {

    githubService.getAllRepositories(
        (err, results) => {

            if (err) {
                return res.status(500).json({
                    message: "Database error"
                });
            }

            res.json(results);
        }
    );
};

const getRepositoryDetails = async (req, res) => {

    const { owner, repo } = req.params;

    try {

        const data =
            await githubService.getRepositoryInfo(
                owner,
                repo
            );

        res.json({
            name: data.name,
            owner: data.owner.login,
            stars: data.stargazers_count,
            forks: data.forks_count,
            openIssues: data.open_issues_count,
            language: data.language
        });

    } catch (error) {

        res.status(500).json({
            message: "Failed to fetch repository details"
        });

    }
};

const getReadme = async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const readme = await githubService.getReadme(
      owner,
      repo
    );

    res.json({ readme });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch README"
    });
  }
};

module.exports = {
    analyzeRepository,
    getContributors,
    getRepositoryDetails,
    getIssues,
    getAllRepositories,
    getLanguages,
    getReadme,
    getCommits
};  