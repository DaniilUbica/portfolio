#pragma once

#include <memory>
#include <functional>
#include <string>
#include <unordered_set>

#include "core/ttlContainer.hpp"

namespace httplib {
    class Server;
    class Request;
    class Response;
}

namespace server {

enum class Method {
    Get = 0,
    Post,
};

using route_handler_t = std::function<void(const httplib::Request&, httplib::Response& res)>;

class Server final {
public:
    Server(const std::string& frontendDirPath, int port);
    ~Server();

    void run();
    void registerRoute(Method method, const std::string& route, route_handler_t&& handler);
    void registerInternalRoute(Method method, const std::string& route, route_handler_t&& handler);
    void registerSessionRoute(Method method, const std::string& route, route_handler_t&& handler);

    std::string createSession();

private:
    void setupStaticFiles();
    static std::string generateToken();

    std::unique_ptr<httplib::Server> m_server;
    std::string m_frontendDirPath;
    int m_port = 0;

    using SessionSet = std::unordered_set<
        core::TTLContainer<std::string, 3600>,
        core::TTLContainer<std::string, 3600>::Hash,
        core::TTLContainer<std::string, 3600>::Equal
    >;
    SessionSet m_sessions;
};

}