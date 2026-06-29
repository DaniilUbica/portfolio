#pragma once

#include <sstream>
#include <cstdlib>
#include <stdexcept>

namespace {

template <typename T>
inline std::optional<T> parseString(const std::string& str) {
    std::stringstream ss(str);
    T value;
    if (ss >> value) {
        return value;
    }

    return std::nullopt;
}

template <>
inline std::optional<bool> parseString<bool>(const std::string& str) {
    std::string lower = str;
    std::transform(lower.begin(), lower.end(), lower.begin(), ::tolower);

    if (lower == "true" || lower == "1" || lower == "yes" || lower == "on") {
        return true;
    }
    if (lower == "false" || lower == "0" || lower == "no" || lower == "off") {
        return false;
    }

    return std::nullopt;
}

template <>
inline std::optional<std::string> parseString<std::string>(const std::string& str) {
    return str;
}

}

namespace config {

template<typename T>
T Config::readValue(const ConfigKey<T>& value) {
    try {
        if (const auto it = m_cache.find(value.name); it != m_cache.end()) {
            return std::any_cast<T>(it->second);
        }

        if (const auto envValue = std::getenv(value.name.data())) {
            const auto envValueOpt = parseString<T>(std::string(envValue));
            if (envValueOpt.has_value()) {
                m_cache.emplace(value.name, envValueOpt.value());
                return envValueOpt.value();
            }

            return value.defaultValue;
        }
        else {
            return value.defaultValue;
        }
    }
    catch (std::bad_any_cast& err) {
        throw std::runtime_error(std::string("Can't get env of passed type with name: ") + value.name);
    }
}

}