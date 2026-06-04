const express = require("express");
const router = express.Router();

const githubController =
    require("../controllers/githubController");

router.post(
    "/analyze",
    githubController.analyzeRepository
);

router.get(
    "/contributors/:owner/:repo",
    githubController.getContributors
);

router.get(
    "/repository/:owner/:repo",
    githubController.getRepositoryDetails
);

router.get(
    "/issues/:owner/:repo",
    githubController.getIssues
);

router.get(
    "/repositories",
    githubController.getAllRepositories
);

module.exports = router;