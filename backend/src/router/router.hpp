#pragma once

#include <functional>

#include "server/server.hpp"

namespace content { class ContentLoader; }

namespace router {

class Router final {
public:
    Router(server::Server& server, const content::ContentLoader& contentLoader);

private:
    void getHealthHandler(const httplib::Request& req, httplib::Response& res) const;
    void getContentHandler(const httplib::Request& req, httplib::Response& res) const;

    std::reference_wrapper<server::Server> m_server;
    std::reference_wrapper<const content::ContentLoader> m_contentLoader;
};

}