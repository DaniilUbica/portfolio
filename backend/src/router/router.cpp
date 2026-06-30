#include "router.hpp"

#include "contentLoader/contentLoader.hpp"

#include <httplib.h>

using namespace router;

Router::Router(server::Server& server, content::ContentLoader& contentLoader) :
    m_server(server), m_contentLoader(contentLoader)
{
    m_server.get().registerRoute(server::Method::Get, "/api/content", std::move([this](const auto& req, auto& res) {
        getContentHandler(req, res);
    }));
    m_server.get().registerRoute(server::Method::Post, "/api/content/reload", std::move([this](const auto& req, auto& res) {
        postContentReload(req, res);
    }));
}

void Router::getContentHandler(const httplib::Request& req, httplib::Response& res) const {
    res.set_content(m_contentLoader.get().load(), "application/json");
}

void Router::postContentReload(const httplib::Request& req, httplib::Response& res) const {
    try {
        m_contentLoader.get().reloadContent();
        res.set_content(R"({"status":"ok"})", "application/json");
    }
    catch (std::runtime_error& err) {
        res.status = 500;
        res.set_content(R"({"error":"can't reload content"})", "application/json");
    }
}
