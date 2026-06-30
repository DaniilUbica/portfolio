#include "router.hpp"

#include "contentLoader/contentLoader.hpp"

#include <httplib.h>
#include <fstream>
#include <sstream>

using namespace router;

Router::Router(const std::string& frontendDirPath, server::Server& server, content::ContentLoader& contentLoader) :
    m_frontendDirPath(frontendDirPath), m_server(server), m_contentLoader(contentLoader)
{
    m_server.get().registerRoute(server::Method::Get, "/api/content", std::move([this](const auto& req, auto& res) {
        getContentHandler(req, res);
    }));
    m_server.get().registerRoute(server::Method::Post, "/api/content/reload", std::move([this](const auto& req, auto& res) {
        postContentReloadHandler(req, res);
    }));
    m_server.get().registerRoute(server::Method::Get, "/error", std::move([this](const auto& req, auto& res) {
        getErrorHandler(req, res);
    }));
    m_server.get().registerRoute(server::Method::Get, "/", std::move([this](const auto& req, auto& res) {
        getMainPageHandler(req, res);
    }));
}

void Router::getMainPageHandler(const httplib::Request& req, httplib::Response& res) const {
    loadHtmlPageToResponse(m_frontendDirPath + "/index.html", res);
}

void Router::getContentHandler(const httplib::Request& req, httplib::Response& res) const {
    res.set_content(m_contentLoader.get().load(), "application/json");
}

void Router::getErrorHandler(const httplib::Request& req, httplib::Response& res) const {
    loadHtmlPageToResponse(m_frontendDirPath + "/error.html", res);
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

void Router::postContentReloadHandler(const httplib::Request& req, httplib::Response& res) const {
    try {
        m_contentLoader.get().reloadContent();
        res.set_content(R"({"status":"ok"})", "application/json");
    }
    catch (std::runtime_error& err) {
        res.status = 500;
        res.set_content(R"({"error":"can't reload content"})", "application/json");
    }
}
