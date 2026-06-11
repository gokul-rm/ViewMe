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

const getUserProfile = async (req, res) => {
  const { username } = req.params;

  try {
    const profile =
      await githubService.getUserProfile(
        username
      );

    res.json({
      name: profile.name,
      bio: profile.bio,
      followers: profile.followers,
      following: profile.following,
      publicRepos: profile.public_repos,
      location: profile.location,
      avatar: profile.avatar_url,
      profileUrl: profile.html_url
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile"
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

const getRecommendations = async (req, res) => {
  const { language } = req.params;

  const recommendations = {
    JavaScript: [
      "vercel/next.js",
      "vuejs/vue",
      "expressjs/express",
      "sveltejs/svelte",
      "preactjs/preact"
    ],

    TypeScript: [
      "nestjs/nest",
      "microsoft/vscode",
      "angular/angular",
      "supabase/supabase",
      "remix-run/remix"
    ],

    Python: [
      "django/django",
      "pallets/flask",
      "tensorflow/tensorflow",
      "fastapi/fastapi",
      "pytorch/pytorch"
    ],

    Java: [
      "spring-projects/spring-boot",
      "elastic/elasticsearch",
      "apache/kafka",
      "quarkusio/quarkus",
      "hibernate/hibernate-orm"
    ]
  };

  res.json(
    recommendations[language] || []
  );
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

const getBranches = async (req, res) => {
  const { owner, repo } = req.params;

  try {
    const branches =
      await githubService.getBranches(
        owner,
        repo
      );

    const simplifiedBranches =
      branches.map((branch) => ({
        name: branch.name
      }));

    res.json(simplifiedBranches);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch branches"
    });
  }
};

module.exports = {
  analyzeRepository,
  getContributors,
  getRepositoryDetails,
  getIssues,
  getAllRepositories,
  getUserProfile,
  getLanguages,
  getReadme,
  getCommits,
  getBranches,
  compareRepositories
};