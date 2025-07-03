// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "NotificationsControl",
    platforms: [
        .macOS(.v10_15)
    ],
    targets: [
        .executableTarget(
            name: "NotificationsControl",
            path: ".",
            exclude: ["README.md", "notifications_control"],
            sources: ["notifications_control.swift"]
        )
    ]
) 