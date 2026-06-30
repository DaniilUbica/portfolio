#include "router.hpp"

#include "contentLoader/contentLoader.hpp"

#include <httplib.h>

using namespace router;

Router::Router(server::Server& server, const content::ContentLoader& contentLoader) :
    m_server(server), m_contentLoader(contentLoader)
{
    m_server.get().registerRoute(server::Method::Get, "/api/health", std::move([this](const auto& req, auto& res) {
        getHealthHandler(req, res);
    }));
    m_server.get().registerRoute(server::Method::Get, "/api/content", std::move([this](const auto& req, auto& res) {
        getContentHandler(req, res);
    }));
}

void Router::getHealthHandler(const httplib::Request& req, httplib::Response& res) const {
    res.set_content(R"({"status":"ok"})", "application/json");
}

void Router::getContentHandler(const httplib::Request& req, httplib::Response& res) const {
    res.set_content(m_contentLoader.get().load(), "application/json");
}
