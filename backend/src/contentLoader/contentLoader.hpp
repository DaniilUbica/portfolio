#pragma once

#include <nlohmann/json.hpp>
#include <string>

namespace content {

class ContentLoader final {
public:
    ContentLoader(const std::string& jsonConfigPath);

    [[nodiscard]] std::string load() const;

private:

    nlohmann::json m_config;
};

}
