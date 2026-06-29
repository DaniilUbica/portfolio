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

inline static const ConfigKey c_githubToken { "githubToken", "" };
inline static const ConfigKey c_serverPort  { "serverPort", 6767 };

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