#pragma once

#include <string>

#include <nlohmann/json.hpp>

#include "core/ttlContainer.hpp"

const unsigned int c_ttlSeconds = 300;

namespace github {

class GithubClient final {
public:
    GithubClient(const std::string& username, const std::string& token);

    [[nodiscard]] nlohmann::json fetchRepositories();

private:
    std::string buildGraphQLQuery() const;

    std::string m_username;
    std::string m_token;

    core::TTLContainer<nlohmann::json, c_ttlSeconds> m_cachedRepos;
};

}