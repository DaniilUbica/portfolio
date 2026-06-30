#include "server.hpp"

#include <httplib.h>
#include <iostream>

using namespace server;


Server::Server(int port) :
    m_port(port),
    m_server(std::make_unique<httplib::Server>())
{
    m_server->set_exception_handler([](const httplib::Request&, httplib::Response& res, std::exception_ptr ep) {
        try {
            std::rethrow_exception(ep);
        }
        catch (const std::exception& e) {
            std::cerr << "[ERROR] Unhandled exception in handler: " << e.what() << "\n";
            res.status = 500;
            res.set_content(std::string(R"({"error":")") + e.what() + "\"}", "application/json");
        }
    });

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