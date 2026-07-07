#pragma once

#include <nlohmann/json.hpp>
#include <string>

namespace content {

class ContentLoader final {
public:
    ContentLoader(const std::string& jsonContentPath);

    [[nodiscard]] std::string load() const;

    void reloadContent();
    void saveContent(const nlohmann::json& content);

private:
    void loadContentFromFile();

    std::string m_contentPath;
    nlohmann::json m_content;
};

}
