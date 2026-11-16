# Changelog

All notable changes to this project are documented here.
Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

## [1.0.0] - 2026-11-16

### Added
- Next.js (App Router) and TypeScript migration of the original single-file page
- Three.js scene with bronze horse model, sparks, wave shader and camera orbit
- Per-letter title reveal, editorial image wipe, grid overlay, custom cursor
- Preloader with progress and error state
- Responsive layout and `prefers-reduced-motion` support
- CI build workflow, Dependabot, issue and PR templates

### Fixed
- Background shader resolution on high-DPI screens
- Frame-rate dependent smoothing replaced with delta-time damping
- Animation loop cleanup on unmount