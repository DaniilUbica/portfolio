#include <iostream>

#include "src/config/config.hpp"
#include "src/server/server.hpp"

int main() {
    int port = 0;
    try {
        port = config::Config::instance().readValue(config::c_serverPort);
    }
    catch (std::runtime_error& err) {
        std::cerr << "Can't read value from config: " << err.what();
    }

    server::Server server(config::Config::instance().readValue(config::c_serverPort));
    server.run();
}