#include "config.hpp"

using namespace config;

Config& Config::instance() {
    static Config s_config;
    return s_config;
}