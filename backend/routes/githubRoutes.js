const express = require("express");
const router = express.Router();



const githubController =
    require("../controllers/githubController");

router.post(
    "/analyze",
    githubController.analyzeRepository
);

router.get(
  "/readme/:owner/:repo",
  githubController.getReadme
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
  "/commits/:owner/:repo",
  githubController.getCommits
);

router.get(
    "/languages/:owner/:repo",
    githubController.getLanguages
);  

router.get(
  "/tree/:owner/:repo",
  githubController.getRepoTree
);

router.get(
  "/file/:owner/:repo",
  githubController.getFileContent
);

router.get(
    "/repositories",
    githubController.getAllRepositories
);

router.get(
  "/profile/:username",
  githubController.getUserProfile
);

router.get(
  "/compare/:owner1/:repo1/:owner2/:repo2",
  githubController.compareRepositories
);

router.get(
  "/branches/:owner/:repo",
  githubController.getBranches
);  

router.get(
  "/search/:owner/:repo",
  githubController.searchFiles
);

module.exports = router;