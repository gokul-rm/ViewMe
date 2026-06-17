import { useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
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
  const [files, setFiles] = useState([]);
const [selectedFile, setSelectedFile] = useState("");
const [fileContent, setFileContent] = useState("");
  const [readme, setReadme] = useState("");
  const [history, setHistory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [repo1, setRepo1] = useState("");
  const [question, setQuestion] = useState("");
const [answer, setAnswer] = useState("");
  const [repo2, setRepo2] = useState("");
  const [comparison, setComparison] = useState(null);

  const calculateHealthScore = () => {
    if (!repository) return 0;

    let score = 0;

    score += Math.min(repository.stars / 1000, 40);
    score += Math.min(repository.forks / 100, 20);
    score += Math.min(contributors.length * 2, 20);

    if (repository.openIssues < 50) {
      score += 20;
    }

    return Math.min(Math.round(score), 100);
  };

  const loadRepository = async (url) => {
    setError("");

    const response = await axios.post(
      "http://localhost:5000/api/github/analyze",
      {
        repoUrl: url,
      }
    );

    setRepository(response.data);

    await loadRepositoryTree(
  response.data.owner,
  response.data.name
);

    const contributorsResponse = await axios.get(
      `http://localhost:5000/api/github/contributors/${response.data.owner}/${response.data.name}`
    );

    setContributors(contributorsResponse.data.slice(0, 5));

    const profileResponse = await axios.get(
      `http://localhost:5000/api/github/profile/${response.data.owner}`
    );

    setProfile(profileResponse.data);

    const issuesResponse = await axios.get(
      `http://localhost:5000/api/github/issues/${response.data.owner}/${response.data.name}`
    );

    setIssues(issuesResponse.data);
    
    const commitsResponse = await axios.get(
      `http://localhost:5000/api/github/commits/${response.data.owner}/${response.data.name}`
    );

    setCommits(commitsResponse.data);

    const branchesResponse = await axios.get(
      `http://localhost:5000/api/github/branches/${response.data.owner}/${response.data.name}`
    );

    setBranches(branchesResponse.data);

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

  const exportPDF = () => {
    if (!repository) return;

    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text("ViewMe Repository Report", 20, 20);

    doc.setFontSize(12);
    doc.text(`Repository: ${repository.name}`, 20, 40);
    doc.text(`Owner: ${repository.owner}`, 20, 50);
    doc.text(`Language: ${repository.language}`, 20, 60);
    doc.text(`Stars: ${repository.stars}`, 20, 70);
    doc.text(`Forks: ${repository.forks}`, 20, 80);
    doc.text(`Issues: ${repository.openIssues}`, 20, 90);
    doc.text(`Watchers: ${repository.watchers}`, 20, 100);

    doc.text(
      `Health Score: ${calculateHealthScore()}/100`,
      20,
      110
    );

    doc.save(`${repository.name}-report.pdf`);
  };

  const copyReport = async () => {
    if (!repository) return;

    const report = `
Repository: ${repository.name}
Owner: ${repository.owner}
Language: ${repository.language}
Stars: ${repository.stars}
Forks: ${repository.forks}
Issues: ${repository.openIssues}
Watchers: ${repository.watchers}
Health Score: ${calculateHealthScore()}/100
`;

    await navigator.clipboard.writeText(report);
    alert("Report copied to clipboard!");
  };

  const generateInsights = () => {
    if (!repository) return [];

    const insights = [];

    if (repository.stars > 10000) {
      insights.push("⭐ Popular open-source project");
    }

    if (repository.forks > 1000) {
      insights.push("🍴 Strong community contribution");
    }

    if (repository.openIssues < 100) {
      insights.push("✅ Well-maintained repository");
    } else {
      insights.push("⚠️ Large issue backlog");
    }

    if (repository.language) {
      insights.push(
        `💻 Primarily built with ${repository.language}`
      );
    }

    return insights;
  };

  const getRepositoryAge = () => {
    if (!repository?.createdAt) return "Unknown";

    const created = new Date(repository.createdAt);
    const now = new Date();

    const years = now.getFullYear() - created.getFullYear();

    return `${years} years`;
  };

  const calculateActivityScore = () => {
    let score = 0;

    score += Math.min(commits.length * 5, 50);
    score += Math.min(contributors.length * 3, 30);

    if (repository?.openIssues < 100) {
      score += 20;
    }

    return Math.min(score, 100);
  };

  const getActivityStatus = () => {
    if (!repository?.updatedAt) return "Unknown";

    const updated = new Date(repository.updatedAt);
    const now = new Date();

    const diffDays = Math.floor(
      (now - updated) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 7) {
      return "🟢 Very Active";
    }

    if (diffDays <= 30) {
      return "🟡 Active";
    }

    return "🔴 Inactive";
  };

  const compareRepos = async () => {
    try {
      const [owner1, repoName1] = repo1.split("/");
      const [owner2, repoName2] = repo2.split("/");

      const response = await axios.get(
        `http://localhost:5000/api/github/compare/${owner1}/${repoName1}/${owner2}/${repoName2}`
      );

      setComparison(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const askAI = async () => {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/chat/ask",
      {
        question,
        owner: repository.owner,
    repo: repository.name
      }
    );

    setAnswer(response.data.answer);
  } catch (error) {
    console.error(error);

    setAnswer(
      "Failed to get AI response"
    );
  }
};



const loadRepositoryTree = async (
  owner,
  repo
) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/github/tree/${owner}/${repo}`
    );

    setFiles(response.data);
  } catch (error) {
    console.error(error);
  }
};

const loadFileContent = async (
  owner,
  repo,
  path
) => {
  try {
    const response = await axios.get(
      `http://localhost:5000/api/github/file/${owner}/${repo}`,
      {
        params: { path }
      }
    );

    setSelectedFile(path);
    setFileContent(
      response.data.content
    );

  } catch (error) {
    console.error(error);
  }
};      

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4", "#EC4899", "#14B8A6"];

  // Custom tooltip to show percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`p-3 border rounded-lg shadow-lg ${darkMode ? "bg-gray-700 border-gray-600" : "bg-white"}`}>
          <p className={`font-semibold ${darkMode ? "text-white" : "text-black"}`}>{payload[0].name}</p>
          <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
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
    <div
      className={`min-h-screen py-10 ${
        darkMode
          ? "bg-gray-900 text-white"
          : "bg-gray-100 text-black"
      }`}
    >
      <div
        className={`p-8 rounded-xl shadow-lg w-full max-w-6xl mx-auto ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex justify-end mb-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>

        <h1 className="text-4xl font-bold mb-2 text-center">
          CodeAtlas
        </h1>

        <p className={`text-center mb-6 ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
          GitHub Repository Analytics Dashboard
        </p>

        <input
          type="text"
          placeholder="Enter GitHub Repository URL"
          value={repoUrl}
          onChange={(e) => setRepoUrl(e.target.value)}
          className={`w-full p-3 border rounded-lg mb-4 ${
            darkMode 
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
              : "bg-white border-gray-300 text-black"
          }`}
        />

        <input
          type="text"
          placeholder="First Repo (owner/repo)"
          value={repo1}
          onChange={(e) => setRepo1(e.target.value)}
          className={`w-full p-3 border rounded-lg mb-2 ${
            darkMode 
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
              : "bg-white border-gray-300 text-black"
          }`}
        />

        <input
          type="text"
          placeholder="Second Repo (owner/repo)"
          value={repo2}
          onChange={(e) => setRepo2(e.target.value)}
          className={`w-full p-3 border rounded-lg mb-4 ${
            darkMode 
              ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400" 
              : "bg-white border-gray-300 text-black"
          }`}
        />

        <button
          onClick={analyzeRepository}
          disabled={loading}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg w-full disabled:bg-gray-400 hover:bg-blue-600 transition"
        >
          {loading ? "🔄 Analyzing..." : "Analyze"}
        </button>

        <button
          onClick={exportPDF}
          disabled={!repository}
          className="bg-red-500 text-white px-6 py-3 rounded-lg w-full mt-2 disabled:bg-gray-400"
        >
          Export PDF Report
        </button>

        <button
          onClick={copyReport}
          disabled={!repository}
          className="bg-green-600 text-white px-6 py-3 rounded-lg w-full mt-2 disabled:bg-gray-400"
        >
          Copy Report
        </button>

        <button
          onClick={compareRepos}
          className="bg-green-500 text-white px-6 py-3 rounded-lg w-full mt-2"
        >
          Compare Repositories
        </button>

        {error && (
          <div className="mt-4 bg-red-100 text-red-700 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* REPOSITORY DETAILS SECTION */}
        {repository && (
          <div className="mt-6">
            {/* Repository Summary Card */}
            <div className={`rounded-lg p-6 mb-6 ${darkMode ? "bg-gradient-to-r from-blue-900 to-purple-900" : "bg-gradient-to-r from-blue-50 to-purple-50"}`}>
              <h2 className="text-2xl font-bold mb-4">Repository Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm opacity-75">Repository Name</p>
                  <p className="text-xl font-semibold">{repository.name}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Owner</p>
                  <p className="text-xl font-semibold">{repository.owner}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Description</p>
                  <p className="text-md">{repository.description || "No description available"}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Primary Language</p>
                  <p className="text-xl font-semibold">{repository.language || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm opacity-75">Repository Age</p>
                  <p className="text-xl font-semibold">{getRepositoryAge()}</p>
                </div>
                <div className="flex gap-4">
                  <div>
                    <p className="text-sm opacity-75">⭐ Stars</p>
                    <p className="text-xl font-semibold">{repository.stars.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm opacity-75">🍴 Forks</p>
                    <p className="text-xl font-semibold">{repository.forks.toLocaleString()}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm opacity-75">Health Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{calculateHealthScore()}/100</p>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div 
                        className="bg-green-500 rounded-full h-2 transition-all duration-500"
                        style={{ width: `${calculateHealthScore()}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm opacity-75">Activity Score</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{calculateActivityScore()}/100</p>
                    <div className="flex-1 bg-gray-300 rounded-full h-2">
                      <div
                        className="bg-blue-500 rounded-full h-2"
                        style={{ width: `${calculateActivityScore()}%` }}
                      />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="text-sm opacity-75">Activity Status</p>
                  <p className="text-xl font-semibold">{getActivityStatus()}</p>
                </div>
              </div>
              
              {/* Profile Card */}
              {profile && (
                <div className="mt-6 pt-6 border-t border-gray-300 flex items-center gap-4">
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.login}
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-lg">{profile.name || profile.login}</p>
                    <p className="text-sm opacity-75">@{profile.login}</p>
                    <p className="text-sm mt-1">{profile.bio}</p>
                    <div className="flex gap-4 mt-2">
                      <span>👥 {profile.followers} followers</span>
                      <span>📁 {profile.public_repos} repos</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Insights Card */}
            {generateInsights().length > 0 && (
              <div className={`mt-6 p-4 rounded-lg ${darkMode ? "bg-blue-900" : "bg-blue-50"}`}>
                <h3 className="text-xl font-bold mb-3">
                  🎯 Repository Insights
                </h3>
                {generateInsights().map((insight, index) => (
                  <p key={index} className="mb-2">
                    {insight}
                  </p>
                ))}
              </div>
            )}
          </div>
        )}

        {(contributors.length > 0 || issues.length > 0) && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
            {/* LEFT COLUMN */}
            <div>
              <h3 className="text-xl font-bold mb-3 mt-8">
                Repository Metrics
              </h3>

              <div className="h-72 rounded-lg mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: "Stars", value: repository?.stars || 0 },
                      { name: "Forks", value: repository?.forks || 0 },
                      { name: "Issues", value: repository?.openIssues || 0 },
                      { name: "Watchers", value: repository?.watchers || 0 },
                    ]}
                  >
                    <XAxis dataKey="name" stroke={darkMode ? "#9CA3AF" : undefined} />
                    <YAxis stroke={darkMode ? "#9CA3AF" : undefined} />
                    <Tooltip contentStyle={darkMode ? { backgroundColor: "#1F2937", border: "none", color: "white" } : {}} />
                    <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <h3 className="text-xl font-bold mb-3">
                Language Distribution
              </h3>

              <div className="h-96 rounded-lg mb-6">
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

              <div className="h-80 rounded-lg mb-4">
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
                      stroke={darkMode ? "#9CA3AF" : undefined}
                    />
                    <YAxis stroke={darkMode ? "#9CA3AF" : undefined} />
                    <Tooltip
                      formatter={(value) => [`${value} contributions`, "Contributions"]}
                      contentStyle={darkMode ? { backgroundColor: "#1F2937", border: "none", color: "white" } : {}}
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
              <h3 className="text-xl font-bold mb-3 mt-8">
                Branches
              </h3>

              <div className="flex flex-wrap gap-2 mb-6">
                {branches.slice(0, 10).map((branch, index) => (
                  <span
                    key={index}
                    className={`px-3 py-1 rounded-full text-sm ${
                      darkMode 
                        ? "bg-purple-900 text-purple-200" 
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {branch.name}
                  </span>
                ))}
              </div>
              
              <h3 className="text-xl font-bold mb-3">
                Recent Commits
              </h3>

              {commits.length > 0 ? (
                commits.slice(0, 5).map((commit, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg mb-3 ${darkMode ? "bg-green-900" : "bg-green-50"}`}
                  >
                    <p className="font-semibold line-clamp-3">
                      {commit.message}
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                      {commit.author}
                    </p>
                    <p className={`text-xs ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
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
                    className={`p-3 rounded-lg mb-3 ${darkMode ? "bg-red-900" : "bg-red-50"}`}
                  >
                    <p className="font-semibold">
                      {issue.title}
                    </p>
                    <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
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

        <div className="mt-10">
  <h3 className="text-xl font-bold mb-3">
    Repository Files
  </h3>

  <div
    className={`p-4 rounded-lg max-h-80 overflow-auto ${
      darkMode ? "bg-gray-700" : "bg-gray-100"
    }`}
  >
    {files.slice(0, 100).map((file, index) => (
      <div
        key={index}
        onClick={() =>
          loadFileContent(
            repository.owner,
            repository.name,
            file.path
          )
        }
        className="cursor-pointer p-2 border-b hover:bg-blue-200 text-sm"
      >
        {file.path}
      </div>
    ))}
  </div>
</div>

{selectedFile && (
  <div className="mt-6">
    <h3 className="text-xl font-bold mb-3">
      {selectedFile}
    </h3>

    <div
      className={`p-4 rounded-lg max-h-96 overflow-auto ${
        darkMode ? "bg-gray-700" : "bg-gray-100"
      }`}
    >
      <pre className="whitespace-pre-wrap text-sm">
        {fileContent}
      </pre>
    </div>
  </div>
)}

        {/* README Preview Section */}
        {readme && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-3">
              README Preview
            </h3>
            <div className={`p-4 rounded-lg max-h-96 overflow-auto ${darkMode ? "bg-gray-700" : "bg-gray-100"}`}>
              <pre className={`whitespace-pre-wrap font-sans text-sm ${darkMode ? "text-gray-300" : "text-black"}`}>
                {readme}
              </pre>
            </div>
          </div>
        )}

        {comparison && (
          <div className="mt-10">
            <h3 className="text-2xl font-bold mb-4">
              Repository Comparison
            </h3>

            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Metric</th>
                  <th className="border p-2">
                    {comparison.repoA.name}
                  </th>
                  <th className="border p-2">
                    {comparison.repoB.name}
                  </th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td className="border p-2">Stars</td>
                  <td className="border p-2">{comparison.repoA.stars}</td>
                  <td className="border p-2">{comparison.repoB.stars}</td>
                </tr>

                <tr>
                  <td className="border p-2">Forks</td>
                  <td className="border p-2">{comparison.repoA.forks}</td>
                  <td className="border p-2">{comparison.repoB.forks}</td>
                </tr>

                <tr>
                  <td className="border p-2">Issues</td>
                  <td className="border p-2">{comparison.repoA.issues}</td>
                  <td className="border p-2">{comparison.repoB.issues}</td>
                </tr>

                <tr>
                  <td className="border p-2">Watchers</td>
                  <td className="border p-2">{comparison.repoA.watchers}</td>
                  <td className="border p-2">{comparison.repoB.watchers}</td>
                </tr>

                <tr>
                  <td className="border p-2">Language</td>
                  <td className="border p-2">{comparison.repoA.language}</td>
                  <td className="border p-2">{comparison.repoB.language}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-10">
  <h3 className="text-2xl font-bold mb-4">
    🤖 AI Repository Assistant
  </h3>

  <input
    type="text"
    placeholder="Ask about this repository..."
    value={question}
    onChange={(e) =>
      setQuestion(e.target.value)
    }
    className={`w-full p-3 border rounded-lg mb-3 ${
      darkMode
        ? "bg-gray-700 border-gray-600 text-white"
        : "bg-white border-gray-300"
    }`}
  />

  <button
    onClick={askAI}
    className="bg-indigo-600 text-white px-6 py-3 rounded-lg"
  >
    Ask AI
  </button>

  {answer && (
    <div
      className={`mt-4 p-4 rounded-lg ${
        darkMode
          ? "bg-gray-700"
          : "bg-gray-100"
      }`}
    >
      <p>{answer}</p>
    </div>
  )}
</div>

        {history.length > 0 && (
          <div className="mt-10">
            <h3 className="text-xl font-bold mb-4">
              Search History
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {history.map((repo) => (
                <div
                  key={repo.id}
                  className={`p-4 rounded-lg cursor-pointer transition ${
                    darkMode 
                      ? "bg-gray-700 hover:bg-gray-600" 
                      : "bg-gray-100 hover:bg-gray-200"
                  }`}
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
                  <p className={darkMode ? "text-gray-400" : "text-gray-600"}>
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