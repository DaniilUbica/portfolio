#pragma once

#include <nlohmann/json.hpp>
#include <string>

namespace content {

class ContentLoader final {
public:
    ContentLoader(const std::string& jsonConfigPath);

    [[nodiscard]] nlohmann::json load(bool compat = false) const;

private:

    nlohmann::json m_config;
};

}
