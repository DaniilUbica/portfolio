#pragma once

#include <functional>
#include <string>

#include "server/server.hpp"

namespace content { class ContentLoader; }
namespace github { class GithubClient; }

namespace router {

struct RouterConfig {
    std::string frontendDirPath;
    std::string adminPassword;
    std::string cvPath;
    std::reference_wrapper<server::Server> server;
    std::reference_wrapper<content::ContentLoader> contentLoader;
    std::reference_wrapper<github::GithubClient> githubClient;
};

class Router final {
public:
    Router(RouterConfig&& config);

private:
    /// get
    server::route_handler_t mainPageHandler() const;
    server::route_handler_t contentHandler() const;
    server::route_handler_t errorPageHandler() const;
    server::route_handler_t githubReposHandler() const;
    server::route_handler_t adminPageHandler() const;
    server::route_handler_t cvHandler() const;

    /// post
    server::route_handler_t contentReloadHandler() const;
    server::route_handler_t adminAuthHandler() const;
    server::route_handler_t adminContentSaveHandler() const;
    server::route_handler_t adminCVUploadHandler() const;

    void loadHtmlPageToResponse(const std::string& pagePath, httplib::Response& res) const;

    RouterConfig m_config;
};

}