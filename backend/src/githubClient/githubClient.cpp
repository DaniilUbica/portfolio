#include "githubClient.hpp"

#include <httplib.h>

using namespace github;

GithubClient::GithubClient(const std::string& username, const std::string& token) :
    m_username(username), m_token(token) {}

nlohmann::json GithubClient::fetchRepositories() {
    httplib::SSLClient client("api.github.com");
    client.set_default_headers({
        { "User-Agent", "portfolio-backend" },
        { "Accept", "application/vnd.github+json" },
        { "Authorization", "Bearer " + m_token },
    });

    if (m_cachedRepos.valid()) {
        return m_cachedRepos.value();
    }

    const auto res = client.Post("/graphql", buildGraphQLQuery(), "application/json");
    if (!res) {
        throw std::runtime_error("GitHub API: no response");
    }
    if (res->status != 200) {
        throw std::runtime_error("GitHub API: HTTP " + std::to_string(res->status));
    }

    m_cachedRepos = nlohmann::json::parse(res->body)["data"]["user"]["pinnedItems"]["nodes"];
    return m_cachedRepos.value();
}

std::string GithubClient::buildGraphQLQuery() const {
    static const std::string query =
        "{\"query\":\"{ user(login: \\\"" + m_username + "\\\") {"
        "  pinnedItems(first: 6, types: REPOSITORY) {"
        "    nodes {"
        "      ... on Repository {"
        "        name"
        "        description"
        "        url"
        "        stargazerCount"
        "        primaryLanguage { name color }"
        "        languages(first: 5) { nodes { name color } }"
        "        repositoryTopics(first: 10) { nodes { topic { name } } }"
        "      }"
        "    }"
        "  }"
        "} }\"}";

    return query;
}
