import { useState } from "react";
import axios from "axios";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repository, setRepository] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [issues, setIssues] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const analyzeRepository = async () => {
    try {
      setError("");
      setLoading(true);

      const response = await axios.post(
        "http://localhost:5000/api/github/analyze",
        {
          repoUrl,
        }
      );

      setRepository(response.data);

      const contributorsResponse = await axios.get(
        `http://localhost:5000/api/github/contributors/${response.data.owner}/${response.data.name}`
      );

      setContributors(contributorsResponse.data);

      const issuesResponse = await axios.get(
        `http://localhost:5000/api/github/issues/${response.data.owner}/${response.data.name}`
      );

      setIssues(issuesResponse.data);

      const historyResponse = await axios.get(
        "http://localhost:5000/api/github/repositories"
      );

      setHistory(historyResponse.data);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setError("Failed to analyze repository");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-6 text-center">
          CodeAtlas
        </h1>

        <input
          type="text"
          placeholder="Enter GitHub Repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className="w-full p-3 border rounded-lg mb-4"
        />

        <button
          onClick={analyzeRepository}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg w-full disabled:bg-gray-400"
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        {repository && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-3xl font-bold">
                {repository.name}
              </h2>
              <p className="text-gray-600 mt-2">
</p>

              <a
                href={repository.repo_url}
                target="_blank"
                rel="noreferrer"
                className="text-blue-500 hover:underline"
              >
                Open GitHub →
              </a>
            </div>

            {repository.description && (
  <div className="mb-4 bg-gray-100 p-4 rounded-lg">
    <p>{repository.description}</p>
  </div>
)}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-bold">{repository.owner}</p>
              </div>

              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Language</p>
                <p className="font-bold">{repository.language}</p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Stars</p>
                <p className="font-bold">{repository.stars}</p>
              </div>

              <div className="bg-purple-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Forks</p>
                <p className="font-bold">{repository.forks}</p>
              </div>

              <div className="bg-red-100 p-4 rounded-lg">
  <p className="text-sm text-gray-600">Issues</p>
  <p className="font-bold">{repository.openIssues}</p>
</div>

<div className="bg-indigo-100 p-4 rounded-lg">
  <p className="text-sm text-gray-600">Watchers</p>
  <p className="font-bold">{repository.watchers}</p>
</div>
            </div>
          </div>
        )}

        {(contributors.length > 0 || issues.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            <div>
              <h3 className="text-xl font-bold mb-3">
                Top Contributors
              </h3>

              {contributors.map((contributor) => (
                <div
                  key={contributor.login}
                  className="bg-gray-100 p-3 rounded-lg mb-3"
                >
                  <p className="font-semibold">
                    {contributor.login}
                  </p>

                  <p>
                    Contributions: {contributor.contributions}
                  </p>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-xl font-bold mb-3">
                Open Issues
              </h3>

              {issues.map((issue, index) => (
                <div
                  key={index}
                  className="bg-red-50 p-3 rounded-lg mb-3"
                >
                  <p className="font-semibold">
                    {issue.title}
                  </p>

                  <p>
                    Status: {issue.state}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-4">
              Search History
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {history.map((repo) => (
                <div
                  key={repo.id}
                  className="bg-gray-100 p-4 rounded-lg"
                >
                  <p
                    className="font-semibold text-blue-500 cursor-pointer"
                    onClick={async () => {
  setRepoUrl(repo.repo_url);

  try {
    setLoading(true);

    const response = await axios.post(
      "http://localhost:5000/api/github/analyze",
      {
        repoUrl: repo.repo_url,
      }
    );

    setRepository(response.data);

    const contributorsResponse = await axios.get(
      `http://localhost:5000/api/github/contributors/${response.data.owner}/${response.data.name}`
    );

    setContributors(contributorsResponse.data);

    const issuesResponse = await axios.get(
      `http://localhost:5000/api/github/issues/${response.data.owner}/${response.data.name}`
    );

    setIssues(issuesResponse.data);

    setLoading(false);
  } catch (error) {
    console.error(error);
    setLoading(false);
  }
}}
                  >
                    {repo.name}
                  </p>

                  <p className="text-gray-600">
                    {repo.owner}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;