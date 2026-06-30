#include <iostream>

#include "src/config/config.hpp"
#include "src/server/server.hpp"
#include "src/contentLoader/contentLoader.hpp"
#include "src/router/router.hpp"

int main() {
    try {
        auto& cfg = config::Config::instance();
        server::Server server(cfg.readValue(config::c_serverPort));

        content::ContentLoader loader(cfg.readValue(config::c_staticContentPath));

        const router::Router router(server, loader);

        server.run();
    }
    catch (const std::exception& err) {
        std::cerr << "Fatal error: " << err.what() << "\n";
        return 1;
    }

    return 0;
}