cmake_minimum_required(VERSION 3.20)
project(portfolio_backend VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

find_package(httplib REQUIRED)
find_package(nlohmann_json REQUIRED)

set(SOURCES
    ${PROJECT_SOURCE_DIR}/src/server/server.cpp
    ${PROJECT_SOURCE_DIR}/src/config/config.cpp
)

set(INCLUDES
    ${PROJECT_SOURCE_DIR}/src/server/server.hpp
    
    ${PROJECT_SOURCE_DIR}/src/config/config.hpp
    ${PROJECT_SOURCE_DIR}/src/config/config.ipp
)

add_executable(${CMAKE_PROJECT_NAME} main.cpp
    ${SOURCES}
    ${INCLUDES}
)

target_include_directories(${CMAKE_PROJECT_NAME} PRIVATE backend/include)

target_link_libraries(${CMAKE_PROJECT_NAME} PRIVATE
    httplib::httplib
    nlohmann_json::nlohmann_json
)

# add_custom_target(copy_frontend ALL
#     COMMAND ${CMAKE_COMMAND} -E copy_directory
#         ${CMAKE_SOURCE_DIR}/frontend
#         ${CMAKE_BINARY_DIR}/frontend
#     COMMENT "Copying frontend to build directory"
# )
# add_dependencies(${CMAKE_PROJECT_NAME} copy_frontend)
