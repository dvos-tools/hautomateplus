// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "VolumeControl",
    platforms: [
        .macOS(.v10_15)
    ],
    targets: [
        .executableTarget(
            name: "VolumeControl",
            path: ".",
            exclude: ["README.md", "volume_control"],
            sources: ["volume_control.swift"]
        )
    ]
) 