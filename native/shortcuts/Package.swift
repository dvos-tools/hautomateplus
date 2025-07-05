// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "ShortcutControl",
    platforms: [
        .macOS(.v10_15)
    ],
    targets: [
        .executableTarget(
            name: "ShortcutControl",
            path: ".",
            exclude: ["README.md", "shortcut_control"],
            sources: ["shortcut_control.swift"]
        )
    ]
) 