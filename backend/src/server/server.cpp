#include "server.hpp"

#include <httplib.h>

using namespace server;


Server::Server(int port) :
    m_port(port),
    m_server(std::make_unique<httplib::Server>())
{
    setupStaticFiles();
    setupRoutes();
}

Server::~Server() {}

void Server::run() {
    m_server->listen("127.0.0.1", m_port);
}

void Server::setupStaticFiles() {
    m_server->set_mount_point("/", "./frontend"); // todo: add this to cmake
}

void Server::setupRoutes() {
    m_server->Get("/api/health", [](const httplib::Request&, httplib::Response& res) {
        res.set_content(R"({"status":"ok"})", "application/json");
    });
}
