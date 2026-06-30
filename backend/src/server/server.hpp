#pragma once

#include <memory>
#include <functional>

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

private:
    void setupStaticFiles();

    std::unique_ptr<httplib::Server> m_server;
    std::string m_frontendDirPath;
    int m_port = 0;
};

}