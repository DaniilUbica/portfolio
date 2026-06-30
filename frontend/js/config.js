// ════════════════════════════════════════════════════════════
//  CONFIG — fallback/default data, used until api.js overwrites it
//  with the response from the backend's REST endpoint
// ════════════════════════════════════════════════════════════
export const CONFIG = {
  name:     "Daniil Volkov",
  role:     "Software Developer",
  location: "Moscow, Russia",
  github:   "daniilubica",
  email:    "acveloff@gmail.com",
  telegram: "@daniil_ubica",
  bio: [
    "Systems programmer focused on performance-critical applications.",
    "Passionate about low-level optimization, memory management,",
    "and building reliable cross-platform software in C++.",
  ],
  skillThreads: [
    {
      id: "dev",
      name: "development",
      state: "RUNNING",
      joins: [],
      frames: [
        { name: "Systems programming", lvl: "MAIN" },
        { name: "Performance-critical apps", lvl: "" },
        { name: "Cross-platform software", lvl: "" },
      ],
    },
    {
      id: "cpp",
      name: "cpp",
      state: "RUNNING",
      joins: ["dev"],
      frames: [
        { name: "C++17 / C++20", lvl: "MAIN" },
        { name: "STL / templates", lvl: "" },
        { name: "RAII / smart pointers", lvl: "" },
        { name: "Multithreading", lvl: "" },
        { name: "CMake", lvl: "" },
      ],
    },
    {
      id: "qt",
      name: "qt",
      state: "RUNNING",
      joins: ["cpp"],
      frames: [
        { name: "QtWidgets", lvl: "MAIN" },
        { name: "Signals / slots", lvl: "" },
        { name: "QML", lvl: "" },
      ],
    },
    {
      id: "git",
      name: "git",
      state: "RUNNING",
      joins: ["cpp"],
      frames: [
        { name: "Git / GitHub", lvl: "MAIN" },
        { name: "Branching workflows", lvl: "" },
        { name: "Code review", lvl: "" },
      ],
    },
    {
      id: "algo",
      name: "algorithms",
      state: "RUNNING",
      joins: ["cpp"],
      frames: [
        { name: "Algorithms / DS", lvl: "MAIN" },
        { name: "Complexity analysis", lvl: "" },
      ],
    },
    {
      id: "python",
      name: "python",
      state: "IDLE",
      joins: ["dev"],
      frames: [
        { name: "Python", lvl: "MAIN" },
        { name: "Scripting / tooling", lvl: "" },
      ],
    },
    {
      id: "ci",
      name: "CI/CD",
      state: "IDLE",
      joins: ["dev"],
      frames: [
        { name: "conan", lvl: "MAIN" },
        { name: "GitLab/Github CI", lvl: "" },
        { name: "Docker", lvl: "" }
      ],
    }
  ],
  experience: [
    {
      func:  "C++ Developer",
      file:  "reverselab.cpp",
      args:  "system security, siem, backend",
      date:  "2026 — present",
    },
    {
      func:  "Junior C++ Developer",
      file:  "TrueConf.cpp",
      args:  "embedded systems, Qt GUI applications",
      date:  "2023 — 2026",
    },
    {
      func:  "CS Student",
      file:  "msut_stankin.cpp",
      args:  "algorithms, data structures, OS internals",
      date:  "2021 — 2025",
    },
  ],
  contact: [
    { key: "github",   val: "github.com/daniilubica",      href: "https://github.com/daniilubica" },
    { key: "email",    val: "acveloff@gmail.com",           href: "mailto:acveloff@gmail.com" },
    { key: "telegram", val: "@daniil_ubica",                 href: "https://t.me/daniil_ubica" },
  ],
  // shape matches the GitHub repos API so renderRepos() doesn't care
  // whether this came from GitHub directly or from our own backend
  repos: [
    {
      name: "qsiesta",
      description: "Lightweight C++ task scheduler with priority queues",
      language: "C++",
      stargazers_count: 1,
      fork: false,
      updated_at: "2026-06-29T08:00:00Z",
      html_url: "https://github.com/daniilubica/qsiesta",
      topics: ["cpp", "scheduler", "concurrency"],
    },
    {
      name: "DaniilUbica",
      description: "Profile README",
      language: null,
      stargazers_count: 1,
      fork: false,
      updated_at: "2026-04-09T08:00:00Z",
      html_url: "https://github.com/daniilubica/DaniilUbica",
      topics: [],
    },
    {
      name: "reports_generator",
      description: "CLI tool for generating PDF/CSV reports from CSV input",
      language: "C++",
      stargazers_count: 4,
      fork: false,
      updated_at: "2026-05-12T08:00:00Z",
      html_url: "https://github.com/daniilubica/reports_generator",
      topics: ["cpp", "cli", "pdf"],
    },
    {
      name: "tetris",
      description: "Classic Tetris implemented with Qt/QtWidgets",
      language: "C++",
      stargazers_count: 9,
      fork: false,
      updated_at: "2026-03-01T08:00:00Z",
      html_url: "https://github.com/daniilubica/tetris",
      topics: ["cpp", "qt", "game"],
    },
  ],
};
