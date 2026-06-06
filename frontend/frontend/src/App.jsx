import { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

function App() {
  const [repoUrl, setRepoUrl] = useState("");
  const [repository, setRepository] = useState(null);
  const [contributors, setContributors] = useState([]);
  const [issues, setIssues] = useState([]);
  const [commits, setCommits] = useState([]);
  const [readme, setReadme] = useState("");
  const [history, setHistory] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRepository = async (url) => {
    setError("");

    const response = await axios.post(
      "http://localhost:5000/api/github/analyze",
      {
        repoUrl: url,
      }
    );

    setRepository(response.data);

    const contributorsResponse = await axios.get(
      `http://localhost:5000/api/github/contributors/${response.data.owner}/${response.data.name}`
    );

    setContributors(contributorsResponse.data.slice(0, 5));

    const issuesResponse = await axios.get(
      `http://localhost:5000/api/github/issues/${response.data.owner}/${response.data.name}`
    );

    setIssues(issuesResponse.data);
    
    const commitsResponse = await axios.get(
      `http://localhost:5000/api/github/commits/${response.data.owner}/${response.data.name}`
    );

    setCommits(commitsResponse.data);

    const languagesResponse = await axios.get(
      `http://localhost:5000/api/github/languages/${response.data.owner}/${response.data.name}`
    );

    const languageData = Object.entries(
      languagesResponse.data
    ).map(([name, value]) => ({
      name,
      value,
      percentage: 0
    }));

    const total = languageData.reduce(
      (sum, lang) => sum + lang.value,
      0
    );

    // Calculate percentages and filter out languages with less than 3%
    const filteredLanguages = languageData
      .map(lang => ({
        ...lang,
        percentage: (lang.value / total) * 100
      }))
      .filter((lang) => lang.percentage > 3);

    setLanguages(filteredLanguages);

    // Fetch README
    try {
      const readmeResponse = await axios.get(
        `http://localhost:5000/api/github/readme/${response.data.owner}/${response.data.name}`
      );
      setReadme(readmeResponse.data.readme || "No README content available");
    } catch (error) {
      console.error("Error fetching README:", error);
      setReadme("README not available for this repository");
    }
  };

  const analyzeRepository = async () => {
    try {
      setError("");
      setLoading(true);

      await loadRepository(repoUrl);

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

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899", "#14B8A6"];

  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{payload[0].name}</p>
          <p className="text-sm text-gray-600">
            Size: {payload[0].value.toLocaleString()} bytes
          </p>
          <p className="text-sm text-blue-600 font-semibold">
            {payload[0].payload.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-2 text-center">
          CodeAtlas
        </h1>

        <p className="text-center text-gray-500 mb-6">
          GitHub Repository Analytics Dashboard
        </p>

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
          {loading ? "🔄 Analyzing..." : "Analyze"}
        </button>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        {repository && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <img
                  src={repository.avatar}
                  alt="avatar"
                  className="w-16 h-16 rounded-full"
                  onError={(e) => {
                    e.target.src = "https://github.com/fluidicon.png";
                  }}
                />

                <div>
                  <h2 className="text-3xl font-bold">
                    {repository.name}
                  </h2>

                  <p className="text-gray-500">
                    {repository.owner}
                  </p>
                </div>
              </div>

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

            {repository.topics && repository.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {repository.topics.map((topic) => (
                  <span
                    key={topic}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Created</p>
                <p className="font-semibold">
                  {new Date(repository.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-500">Last Updated</p>
                <p className="font-semibold">
                  {new Date(repository.updatedAt).toLocaleDateString()}
                </p>
              </div>

              <div className="bg-gray-100 p-3 rounded-lg">
                <p className="text-sm text-gray-500">License</p>
                <p className="font-semibold">
                  {repository.license || "Not specified"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-blue-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-bold">{repository.owner}</p>
              </div>

              <div className="bg-green-100 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Language</p>
                <p className="font-bold">{repository.language || "N/A"}</p>
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
            {/* LEFT COLUMN */}
            <div>
              <h3 className="text-xl font-bold mb-3 mt-8">
                Repository Metrics
              </h3>

              <div className="h-72 bg-white rounded-lg mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Stars", value: repository?.stars || 0 },
                      { name: "Forks", value: repository?.forks || 0 },
                      { name: "Issues", value: repository?.openIssues || 0 },
                      { name: "Watchers", value: repository?.watchers || 0 },
                    ]}
                  >
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <h3 className="text-xl font-bold mb-3">
                Language Distribution
              </h3>

              <div className="h-96 bg-white rounded-lg mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={languages}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={100}
                      innerRadius={60}
                      paddingAngle={2}
                      labelLine={false}
                      label={false}
                    >
                      {languages.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          stroke="#fff"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry, index) => {
                        const percentage = languages[index]?.percentage || 0;
                        return `${value} (${percentage.toFixed(1)}%)`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <h3 className="text-xl font-bold mb-3">
                Top Contributors
              </h3>

              <div className="h-80 bg-white rounded-lg mb-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={contributors}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 0,
                      bottom: 10,
                    }}
                  >
                    <XAxis
                      dataKey="login"
                      angle={-35}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => [`${value} contributions`, "Contributions"]}
                    />
                    <Bar
                      dataKey="contributions"
                      fill="#10B981"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div>
              <h3 className="text-xl font-bold mb-3">
                Recent Commits
              </h3>

              {commits.length > 0 ? (
                commits.slice(0, 5).map((commit, index) => (
                  <div
                    key={index}
                    className="bg-green-50 p-3 rounded-lg mb-3"
                  >
                    <p className="font-semibold">
                      {commit.message}
                    </p>
                    <p className="text-sm text-gray-600">
                      {commit.author}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(commit.date).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No commits found</p>
              )}

              <h3 className="text-xl font-bold mb-3 mt-8">
                Open Issues
              </h3>

              {issues.length > 0 ? (
                issues.slice(0, 5).map((issue, index) => (
                  <div
                    key={index}
                    className="bg-red-50 p-3 rounded-lg mb-3"
                  >
                    <p className="font-semibold">
                      {issue.title}
                    </p>
                    <p className="text-sm text-gray-600">
                      Status: {issue.state}
                    </p>
                    <a
                      href={issue.html_url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View Issue →
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No open issues</p>
              )}
            </div>
          </div>
        )}

        {/* README Preview Section */}
        {readme && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-3">
              README Preview
            </h3>
            <div className="bg-gray-100 p-4 rounded-lg max-h-96 overflow-auto">
              <pre className="whitespace-pre-wrap font-sans text-sm">
                {readme}
              </pre>
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
                  className="bg-gray-100 p-4 rounded-lg cursor-pointer hover:bg-gray-200 transition"
                  onClick={async () => {
                    setRepoUrl(repo.repo_url);
                    try {
                      setLoading(true);
                      await loadRepository(repo.repo_url);
                      setLoading(false);
                    } catch (error) {
                      console.error(error);
                      setLoading(false);
                    }
                  }}
                >
                  <p className="font-semibold text-blue-500">
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