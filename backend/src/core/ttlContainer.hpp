#pragma once

#include <chrono>
#include <functional>
#include <optional>
#include <stdexcept>

namespace core {

template<typename T, const unsigned int TTLSeconds>
class TTLContainer final {
public:
    TTLContainer() : m_data(std::nullopt), m_expiresAt() {}
    explicit TTLContainer(T value) { set(std::move(value)); }

    void set(T value) const {
        m_data = std::move(value);
        m_expiresAt = std::chrono::steady_clock::now() + std::chrono::seconds(TTLSeconds);
    }

    void refresh() const {
        if (m_data.has_value()) {
            m_expiresAt = std::chrono::steady_clock::now() + std::chrono::seconds(TTLSeconds);
        }
    }

    bool valid() const {
        return m_data.has_value() && std::chrono::steady_clock::now() < m_expiresAt;
    }

    const T& value() const {
        if (!m_data.has_value()) {
            throw std::runtime_error("TTLContainer: no value");
        }
        if (std::chrono::steady_clock::now() >= m_expiresAt) {
            throw std::runtime_error("TTLContainer: value expired");
        }

        return m_data.value();
    }

    const T* operator->() const {
        return value();
    }

    const T& operator*()  const { return value(); }
    TTLContainer& operator=(T value) {
        set(std::move(value));
        return *this;
    }

    struct Hash {
        using is_transparent = void;
        size_t operator()(const TTLContainer& c) const {
            return std::hash<T>{}(*c);
        }

        size_t operator()(const T& v) const {
            return std::hash<T>{}(v);
        }
    };

    struct Equal {
        using is_transparent = void;
        bool operator()(const TTLContainer& a, const TTLContainer& b) const {
            return *a == *b;
        }
        bool operator()(const T& a, const TTLContainer& b) const {
            return a == *b;
        }
        bool operator()(const TTLContainer& a, const T& b) const {
            return *a == b;
        }
    };

private:
    mutable std::optional<T> m_data;
    mutable std::chrono::steady_clock::time_point m_expiresAt;
};

}