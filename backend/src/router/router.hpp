#pragma once

#include <functional>

#include "server/server.hpp"

namespace content { class ContentLoader; }
namespace github { class GithubClient; }

namespace router {

struct RouterConfig {
    std::string frontendDirPath;
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
    server::route_handler_t errorHandler() const;
    server::route_handler_t githubReposHandler() const;

    /// post
    server::route_handler_t contentReloadHandler() const;

    void loadHtmlPageToResponse(const std::string& pagePath, httplib::Response& res) const;

    std::string m_frontendDirPath;
    std::reference_wrapper<server::Server> m_server;
    std::reference_wrapper<content::ContentLoader> m_contentLoader;
    std::reference_wrapper<github::GithubClient> m_githubClient;
};

}