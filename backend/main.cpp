#include <iostream>

#include "src/config/config.hpp"
#include "src/server/server.hpp"
#include "src/contentLoader/contentLoader.hpp"
#include "src/router/router.hpp"
#include "src/githubClient/githubClient.hpp"

int main() {
    try {
        auto& cfg = config::Config::instance();
        server::Server server(cfg.readValue(config::c_frontendDirPath), cfg.readValue(config::c_serverPort));

        content::ContentLoader loader(cfg.readValue(config::c_staticContentPath));

        github::GithubClient githubClient(cfg.readValue(config::c_githubUsername), cfg.readValue(config::c_githubToken));

        router::RouterConfig routerConfig { cfg.readValue(config::c_frontendDirPath), cfg.readValue(config::c_adminPassword),
            cfg.readValue(config::c_cvPath), server, loader, githubClient };
        const router::Router router(std::move(routerConfig));

        server.run();
    }
    catch (const std::exception& err) {
        std::cerr << "Fatal error: " << err.what() << "\n";
        return 1;
    }

    return 0;
}