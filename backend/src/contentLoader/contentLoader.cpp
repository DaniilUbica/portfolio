#include "contentLoader.hpp"

#include <fstream>
#include <stdexcept>

using namespace content;

ContentLoader::ContentLoader(const std::string& jsonConfigPath) {
    std::ifstream file(jsonConfigPath);
    if (!file.is_open()) {
        throw std::runtime_error("ContentBuilder: cannot open config: " + jsonConfigPath);
    }

    m_config = nlohmann::json::parse(file);
}

nlohmann::json ContentLoader::load(bool compat) const {
    if (compat) {
        return { m_config.dump() };
    }

    return m_config;
}