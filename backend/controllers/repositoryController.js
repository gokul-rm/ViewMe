const db = require("../config/db");

const getAllRepositories = (req, res) => {

    db.query(
        "SELECT * FROM repositories",
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json(results);
        }
    );
};

const getRepositoryById = (req, res) => {

    const id = req.params.id;

    db.query(
        "SELECT * FROM repositories WHERE id = ?",
        [id],
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: "Repository not found"
                });
            }

            res.json(results[0]);
        }
    );
};

const createRepository = (req, res) => {

    const { name, owner, repo_url } = req.body;

    const sql =
        "INSERT INTO repositories (name, owner, repo_url) VALUES (?, ?, ?)";

    db.query(
        sql,
        [name, owner, repo_url],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                id: result.insertId
            });
        }
    );
};

const updateRepository = (req, res) => {

    const id = req.params.id;
    const { name, owner, repo_url } = req.body;

    const sql = `
        UPDATE repositories
        SET name = ?, owner = ?, repo_url = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [name, owner, repo_url, id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Repository updated"
            });
        }
    );
};

const deleteRepository = (req, res) => {

    const id = req.params.id;

    db.query(
        "DELETE FROM repositories WHERE id = ?",
        [id],
        (err, result) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                success: true,
                message: "Repository deleted"
            });
        }
    );
};



module.exports = {
    getAllRepositories,
    getRepositoryById,
    createRepository,
    updateRepository,
    deleteRepository
};