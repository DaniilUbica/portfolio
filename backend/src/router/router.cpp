#include "router.hpp"

#include "contentLoader/contentLoader.hpp"
#include "githubClient/githubClient.hpp"

#include <httplib.h>
#include <fstream>
#include <sstream>

using namespace router;

Router::Router(RouterConfig&& config) :
    m_frontendDirPath(config.frontendDirPath),
    m_server(config.server),
    m_contentLoader(config.contentLoader),
    m_githubClient(config.githubClient)
{
    m_server.get().registerRoute(server::Method::Get, "/api/content", contentHandler());
    m_server.get().registerRoute(server::Method::Get, "/api/repos", githubReposHandler());
    m_server.get().registerRoute(server::Method::Get, "/error", errorHandler());
    m_server.get().registerRoute(server::Method::Get, "/", mainPageHandler());

    m_server.get().registerRoute(server::Method::Post, "/api/content/reload", contentReloadHandler());
}

server::route_handler_t Router::mainPageHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        loadHtmlPageToResponse(m_frontendDirPath + "/index.html", res);
    };
}

server::route_handler_t Router::contentHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        res.set_content(m_contentLoader.get().load(), "application/json");
    };
}

server::route_handler_t Router::errorHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        loadHtmlPageToResponse(m_frontendDirPath + "/error.html", res);
    };
}

server::route_handler_t Router::githubReposHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        const auto content = m_githubClient.get().fetchRepositories().dump();
        res.set_content(content, "application/json");
    };
}

server::route_handler_t Router::contentReloadHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        try {
            m_contentLoader.get().reloadContent();
            res.set_content(R"({"status":"ok"})", "application/json");
        }
        catch (std::runtime_error& err) {
            res.status = 500;
            res.set_content(R"({"error":"can't reload content"})", "application/json");
        }
    };
}

void Router::loadHtmlPageToResponse(const std::string& pagePath, httplib::Response& res) const {
    std::ifstream file(pagePath);
    if (!file.is_open()) {
        res.status = 500;
        res.set_content("error page not found", "text/plain");
        return;
    }

    std::ostringstream ss;
    ss << file.rdbuf();
    res.set_content(ss.str(), "text/html");
}