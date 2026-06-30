#pragma once

#include <functional>

#include "server/server.hpp"

namespace content { class ContentLoader; }

namespace router {

class Router final {
public:
    Router(server::Server& server, content::ContentLoader& contentLoader);

private:
    void getContentHandler(const httplib::Request& req, httplib::Response& res) const;
    void postContentReload(const httplib::Request& req, httplib::Response& res) const;

    std::reference_wrapper<server::Server> m_server;
    std::reference_wrapper<content::ContentLoader> m_contentLoader;
};

}