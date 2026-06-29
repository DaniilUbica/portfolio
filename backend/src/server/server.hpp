#pragma once

#include <memory>

namespace httplib { class Server; }

namespace server {

class Server final {
public:
    Server(int port);
    ~Server();

    void run();

private:
    void setupStaticFiles();
    void setupRoutes();

    std::unique_ptr<httplib::Server> m_server;
    int m_port = 0;
};

}