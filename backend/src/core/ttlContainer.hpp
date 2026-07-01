#pragma once

#include <chrono>
#include <optional>

namespace core {

template<typename T, const unsigned int TTLSeconds>
class TTLContainer final {
public:
    TTLContainer() : m_data(std::nullopt), m_expiresAt() {}

    void set(T&& value) {
        if (m_data) {
            m_data.reset();
        }

        m_data = std::move(value);
        m_expiresAt = std::chrono::steady_clock::now() + std::chrono::seconds(TTLSeconds);
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

    const T& operator*() const {
        return value();
    }

    TTLContainer& operator=(T value) {
        set(std::move(value));
        return *this;
    }

private:
    std::optional<T> m_data;
    std::chrono::steady_clock::time_point m_expiresAt;
};

}