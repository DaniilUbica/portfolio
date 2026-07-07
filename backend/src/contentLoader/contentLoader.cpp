#include "contentLoader.hpp"

#include <fstream>
#include <stdexcept>

using namespace content;

ContentLoader::ContentLoader(const std::string& jsonContentPath) : m_contentPath(jsonContentPath) {
    loadContentFromFile();
}

std::string ContentLoader::load() const {
    return m_content.dump();
}

void ContentLoader::reloadContent() {
    m_content.clear();
    loadContentFromFile();
}

void ContentLoader::saveContent(const nlohmann::json& content) {
    std::ofstream file(m_contentPath);
    if (!file.is_open()) {
        throw std::runtime_error("cannot write config: " + m_contentPath);
    }

    file << content.dump(4);
    m_content = content;
}

void ContentLoader::loadContentFromFile() {
    std::ifstream file(m_contentPath);
    if (!file.is_open()) {
        throw std::runtime_error("ContentBuilder: cannot open config: " + m_contentPath);
    }

    try {
        m_content = nlohmann::json::parse(file);
    }
    catch (std::runtime_error& err) {
        throw std::runtime_error("ContentBuilder: cannot parse config: " + m_contentPath);
    }
}