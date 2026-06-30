#pragma once

#include <functional>

#include "server/server.hpp"

namespace content { class ContentLoader; }

namespace router {

class Router final {
public:
    Router(const std::string& frontendDirPath, server::Server& server, content::ContentLoader& contentLoader);

private:
    void getMainPageHandler(const httplib::Request& req, httplib::Response& res) const;
    void getContentHandler(const httplib::Request& req, httplib::Response& res) const;
    void postContentReloadHandler(const httplib::Request& req, httplib::Response& res) const;
    void getErrorHandler(const httplib::Request& req, httplib::Response& res) const;

    void loadHtmlPageToResponse(const std::string& pagePath, httplib::Response& res) const;

    std::string m_frontendDirPath;
    std::reference_wrapper<server::Server> m_server;
    std::reference_wrapper<content::ContentLoader> m_contentLoader;
};

}