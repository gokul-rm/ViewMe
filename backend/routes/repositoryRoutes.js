const express = require("express");
const router = express.Router();

const repositoryController =
    require("../controllers/repositoryController");

router.get("/", repositoryController.getAllRepositories);

router.get("/:id", repositoryController.getRepositoryById);

router.post("/", repositoryController.createRepository);

router.put("/:id", repositoryController.updateRepository);

router.delete("/:id", repositoryController.deleteRepository);


module.exports = router;