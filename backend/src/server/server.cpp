#include "server.hpp"

#include <httplib.h>

using namespace server;


Server::Server(int port) :
    m_port(port),
    m_server(std::make_unique<httplib::Server>())
{
    setupStaticFiles();
}

Server::~Server() {}

void Server::run() {
    m_server->listen("127.0.0.1", m_port);
}

void Server::registerRoute(Method method, const std::string& route, route_handler_t&& handler) {
    if (method == Method::Get) {
        m_server->Get(route, std::move(handler));
    }
    else if (method == Method::Post) {
        m_server->Post(route, std::move(handler));
    }
    else {
        throw std::logic_error("trying to register unimplemented http method");
    }
}

void Server::setupStaticFiles() {
    m_server->set_mount_point("/", "./frontend"); // todo: add this to cmake
}