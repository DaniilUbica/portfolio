#pragma once

#include <string>
#include <any>
#include <unordered_map>

namespace config {

namespace {
    template<typename T>
    struct ConfigKey {
        std::string name;
        T defaultValue;
    };
}

inline static const ConfigKey c_githubToken       { "githubToken", std::string("") };
inline static const ConfigKey c_githubUsername    { "githubUsername", std::string("") };
inline static const ConfigKey c_serverPort        { "serverPort", 6767 };
inline static const ConfigKey c_staticContentPath { "staticContentPath", std::string("./staticConfig.json") };
inline static const ConfigKey c_frontendDirPath   { "frontendDirPath", std::string("./frontend") };

class Config final {
public:
    Config(const Config&) = delete;
    Config(Config&&) = delete;
    void operator=(const Config&) = delete;

    static Config& instance();

    template<typename T>
    [[nodiscard]] T readValue(const ConfigKey<T>& value);

private:
    Config() = default;

    std::unordered_map<std::string, std::any> m_cache;
};

}

#include "config.ipp"