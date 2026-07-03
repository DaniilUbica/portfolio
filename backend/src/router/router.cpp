#include "router.hpp"

#include "contentLoader/contentLoader.hpp"
#include "githubClient/githubClient.hpp"

#include <httplib.h>
#include <nlohmann/json.hpp>
#include <fstream>
#include <sstream>

using namespace router;

Router::Router(RouterConfig&& config) :
    m_config(std::move(config))
{
    m_config.server.get().registerInternalRoute(server::Method::Get, "/api/content", contentHandler());
    m_config.server.get().registerInternalRoute(server::Method::Get, "/api/repos", githubReposHandler());
    m_config.server.get().registerRoute(server::Method::Get, "/api/cv", cvHandler());

    m_config.server.get().registerRoute(server::Method::Get, "/error", errorPageHandler());
    m_config.server.get().registerRoute(server::Method::Get, "/", mainPageHandler());
    m_config.server.get().registerRoute(server::Method::Get, "/admin", adminPageHandler());

    m_config.server.get().registerInternalRoute(server::Method::Post, "/api/content/reload", contentReloadHandler());

    m_config.server.get().registerRoute(server::Method::Post, "/admin/auth", adminAuthHandler());
    m_config.server.get().registerSessionRoute(server::Method::Post, "/api/admin/save", adminContentSaveHandler());
    m_config.server.get().registerSessionRoute(server::Method::Post, "/api/admin/cv", adminCVUploadHandler());
}

server::route_handler_t Router::mainPageHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        loadHtmlPageToResponse(m_config.frontendDirPath + "/index.html", res);
    };
}

server::route_handler_t Router::contentHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        res.set_content(m_config.contentLoader.get().load(), "application/json");
    };
}

server::route_handler_t Router::errorPageHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        loadHtmlPageToResponse(m_config.frontendDirPath + "/error.html", res);
    };
}

server::route_handler_t Router::githubReposHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        const auto content = m_config.githubClient.get().fetchRepositories().dump();
        res.set_content(content, "application/json");
    };
}

server::route_handler_t Router::cvHandler() const {
    return [this](const httplib::Request&, httplib::Response& res) {
        std::ifstream file(m_config.cvPath, std::ios::binary);
        if (!file.is_open()) {
            res.status = 404;
            res.set_content(R"({"error":"cv not found"})", "application/json");
            return;
        }
        std::ostringstream ss;
        ss << file.rdbuf();
        res.set_header("Content-Disposition", "attachment; filename=\"cv.pdf\"");
        res.set_content(ss.str(), "application/pdf");
    };
}

server::route_handler_t Router::adminPageHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        loadHtmlPageToResponse(m_config.frontendDirPath + "/admin.html", res);
    };
}

server::route_handler_t Router::contentReloadHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        try {
            m_config.contentLoader.get().reloadContent();
            res.set_content(R"({"status":"ok"})", "application/json");
        }
        catch (std::runtime_error& err) {
            res.status = 500;
            res.set_content(R"({"error":"can't reload content"})", "application/json");
        }
    };
}

server::route_handler_t Router::adminAuthHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        const auto pwd = req.get_header_value("X-Admin-Password");
        if (pwd != m_config.adminPassword) {
            res.status = 401;
            res.set_content(R"({"error":"unauthorized"})", "application/json");
            return;
        }
        const auto token = m_config.server.get().createSession();
        res.set_content("{\"token\":\"" + token + "\"}", "application/json");
    };
}

server::route_handler_t Router::adminContentSaveHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        try {
            const auto json = nlohmann::json::parse(req.body);
            m_config.contentLoader.get().saveContent(json);
            res.set_content(R"({"status":"ok"})", "application/json");
        }
        catch (const nlohmann::json::exception&) {
            res.status = 400;
            res.set_content(R"({"error":"invalid json"})", "application/json");
        }
        catch (const std::exception&) {
            res.status = 500;
            res.set_content(R"({"error":"failed to save"})", "application/json");
        }
    };
}

server::route_handler_t Router::adminCVUploadHandler() const {
    return [this](const httplib::Request& req, httplib::Response& res) {
        auto it = req.files.find("cv");
        if (it == req.files.end()) {
            res.status = 400;
            res.set_content(R"({"error":"no file provided"})", "application/json");
            return;
        }

        const auto& file = it->second;
        const std::string cvPath = m_config.cvPath;

        std::ofstream out(cvPath, std::ios::binary);
        if (!out.is_open()) {
            res.status = 500;
            res.set_content(R"({"error":"cannot write file"})", "application/json");
            return;
        }

        out.write(file.content.data(), static_cast<std::streamsize>(file.content.size()));
        res.set_content(R"({"status":"ok"})", "application/json");
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