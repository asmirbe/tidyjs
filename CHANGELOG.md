# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.7] - 2025-01-29

### 🔧 Changed

#### Configuration Improvements
- **Updated default group name** from "Misc" to "Other" in example configuration and documentation
- **More professional naming** for the default fallback group that catches unmatched imports

### 🐛 Fixed

#### Priority System Correction
- **Fixed group priority system** that was incorrectly prioritizing by order instead of priority value
- **Priority now correctly overrides order** when multiple groups match the same import
- **Enhanced GroupMatcher algorithm** to collect all matching groups and select by highest priority
- **Added tie-breaking by order** when priorities are equal (lower order wins)
- **Comprehensive test coverage** for priority scenarios and edge cases
- **Debug logging improvements** to show priority resolution decisions

## [1.5.6] - 2025-01-25

### ✨ Added

#### New Create Configuration Command
- **New command `tidyjs.createConfigFile`** to easily create a `.tidyjsrc` configuration file
- **Interactive folder picker** that lets users choose where to save the configuration
- **Auto-generated minimal config** with sensible defaults (indent: 4, bracketSpacing: true)
- **Automatic file opening** after creation for immediate editing

#### Enhanced JSON Schema Support
- **Schema validation for `.tidyjsrc` files** - previously only `tidyjs.json` had schema support
- **IntelliSense and validation** for both `.tidyjsrc` and `tidyjs.json` configuration files

### 🔧 Changed

#### Command Improvements
- **Renamed command ID** from `extension.format` to `tidyjs.forceFormatDocument` for better clarity
- **Removed default keybinding** - users can now set their own preferred keyboard shortcut through VS Code's keybinding settings

## [1.5.5] - 2025-01-24

### 🐛 Fixed

#### ESLint Diagnostics Parsing for Unused Imports
- **Fixed unused import detection** that was failing for multiline imports ([#1](https://github.com/asmirbe/tidyjs/issues/1))
- **Added diagnostic code helper** to handle different ESLint code formats (numeric and string)
- **Updated regex pattern** to match both "declared" and "defined" unused variable messages
- **Extended severity checks** to include Error severity in addition to Warning
- **Fixed duplicate detection** in default import name extraction

## [1.5.4] - 2025-01-23

### 🔧 Changed

#### Performance Optimizations
- **Reduced bundle size** by optimizing dependencies and build configuration
- **Improved startup time** with lazy loading of non-critical modules
- **Enhanced memory usage** during large file processing

### 🐛 Fixed

#### Minor Bug Fixes
- **Fixed edge case** in multiline import parsing with complex nesting
- **Improved error messages** for configuration validation failures
- **Enhanced regex pattern validation** to prevent runtime errors

## [1.5.3] - 2025-01-22

### 🔧 Changed

#### Build Optimizations
- **Optimized esbuild configuration** for smaller bundle size
- **Tree-shaking improvements** to eliminate unused code paths
- **Dependency updates** for better compatibility and security

### 🐛 Fixed

#### Micro-fixes
- **Fixed rare cache invalidation** issue with configuration changes
- **Improved TypeScript compilation** for better error detection
- **Enhanced file watching** for configuration file changes

## [1.5.2] - 2025-01-21

### 🔧 Changed

#### Performance Enhancements
- **Faster import parsing** with optimized AST traversal
- **Reduced memory footprint** for configuration caching
- **Improved regex compilation** and caching strategies

### 🐛 Fixed

#### Stability Improvements
- **Fixed intermittent parsing errors** with complex import structures
- **Enhanced error recovery** during malformed import detection
- **Improved handling** of edge cases in import consolidation

## [1.5.1] - 2025-01-20

### 🔧 Changed

#### Code Quality and Performance
- **Refactored core parsing logic** for better maintainability
- **Optimized group matching algorithm** for improved performance
- **Enhanced type safety** throughout the codebase

### 🐛 Fixed

#### Minor Issues
- **Fixed configuration merge logic** for complex scenarios
- **Improved path resolution** accuracy in edge cases
- **Enhanced validation** for custom sort order patterns

## [1.5.0] - 2025-01-19

### ✨ Added

#### Automatic Path Resolution
- **New path resolution feature** to automatically convert between relative and absolute (aliased) imports
- **Support for multiple build tools**: TypeScript (`tsconfig.json`), Vite (`vite.config.js/ts`), and Webpack (`webpack.config.js/ts`)
- **Bidirectional conversion modes**:
  - `mode: "relative"` - Converts absolute/aliased imports to relative paths
  - `mode: "absolute"` - Converts relative imports to absolute paths with aliases
- **Smart alias detection** that automatically finds and uses path mappings from your build configuration
- **Configuration options**:
  - `tidyjs.pathResolution.enabled` - Enable/disable the feature (default: false)
  - `tidyjs.pathResolution.mode` - Choose conversion mode (default: "relative")
  - `tidyjs.pathResolution.preferredAliases` - Control which aliases to use when multiple options exist. For example, if your config has `@/*`, `@app/*`, and `@shared/*` all pointing to the same file, you can specify `["@shared", "@app", "@"]` to prefer the most specific alias. The first matching alias in the array will be used

#### Enhanced Vite Support
- **Improved Vite config parser** that detects aliases even when imported from external files
- **Support for complex Vite configurations** with spread operators and dynamic imports
- **Fallback detection** for common monorepo patterns (@app, @core, @library)

### 🔧 Changed

#### Auto-Order Resolution System
- **Intelligent group order management** that automatically resolves order conflicts
- **Auto-assignment of missing orders** for groups without explicit order values
- **Collision resolution** that preserves original preferences while avoiding duplicates
- **Improved configuration validation** with detailed warnings for order issues

### 🔒 Fixed

#### Configuration and Cache Improvements
- **Fixed RegExp serialization** in cache system that was causing cache invalidation issues
- **Fixed duplicate group validation** using proper array comparison with lodash
- **Non-intrusive debug logging** that no longer interrupts users with output panel pop-ups
- **JSON parsing improvements** for TypeScript configs with comments and trailing commas

#### Import Range Detection
- **Fixed multiline comment handling** at the beginning of files - file header comments (copyright notices, documentation blocks) are now correctly excluded from the import section and preserved during formatting

## [1.4.2] - 2025-06-09

### ✨ Added

#### Custom Import Sorting Within Groups
- **Added `sortOrder` configuration field** to group definitions for customizable import ordering
- **Support for two sorting modes**:
  - `sortOrder: "alphabetic"` - Standard alphabetical sorting
  - `sortOrder: ["react", "react-*", "lodash"]` - Custom pattern-based ordering with wildcards
- **Wildcard pattern support** with intelligent matching:
  - `"react-*"` matches `react-dom`, `react-router`, etc.
  - `"@app/*"` matches all internal app modules  
  - `"*test*"` matches testing-related packages
- **Fallback to alphabetic sorting** for imports not matching custom patterns
- **VS Code IntelliSense support** with comprehensive configuration schema and auto-completion

#### Enhanced Configuration Schema
- **New `sortOrder` field** added to group definitions with full type safety
- **Validation for custom patterns** with RegExp safety checks and detailed error messages
- **Auto-completion and documentation** in VS Code settings UI

#### Comprehensive Testing Coverage
- **New unit tests** for custom sorting logic and wildcard pattern matching (327/327 passing)
- **Configuration validation tests** with edge case handling and error scenarios
- **E2E tests** for sort order functionality and VS Code integration (81/81 passing)
- **Performance tests** ensuring sorting efficiency with minimal overhead

### 🔧 Changed

#### Core Parser Enhancements
- **Enhanced `sortImportsByCustomOrder()` method** in parser for custom pattern matching
- **Improved import consolidation** with custom ordering support
- **Optimized pattern matching** with efficient RegExp conversion

#### Configuration System Updates
- **Extended `validateSortOrders()` validation** with comprehensive error handling
- **Enhanced type definitions** for better IntelliSense and type safety

### 🔒 Fixed

#### Robust Error Handling
- **RegExp safety validation** prevents invalid wildcard patterns from causing crashes
- **Configuration conflict detection** with detailed error messages for debugging
- **Graceful fallback** to alphabetic sorting when custom patterns fail

### 📚 Documentation

#### Updated Examples and Schema
- **Real-world configuration examples** in package.json schema with common patterns
- **Wildcard pattern documentation** with practical use cases
- **Migration guidance** for existing configurations (zero breaking changes)

### 🔄 Backward Compatibility

#### Zero Breaking Changes
- **Existing configurations continue to work** without any modification required
- **Optional `sortOrder` field** - groups without it maintain current behavior
- **Maintains current import organization** when `sortOrder` is not specified

#### Performance Impact
- **Minimal overhead**: Custom sorting adds ~0.01ms per import group
- **Memory efficient**: Negligible memory overhead with pattern caching
- **Maintains fast formatting** even with complex custom sort orders

    ## [1.4.0] - 2025-01-06

    ### Added
    - **Auto-Order Resolution System**: Intelligent automatic ordering that resolves group order collisions and assigns missing orders (#e667e07)
      - Automatically resolves duplicate order values by pushing to next available slot
      - Auto-assigns sequential order numbers to groups without explicit orders
      - Validates order values and warns about high numbers (>1000)
      - Zero breaking changes - existing configurations continue to work
    - **Memory Management**: Added proper resource disposal and cleanup in parser (#120e667)
      - Implements dispose() method to free AST and TypeScript resources
      - Prevents memory leaks during long VS Code sessions
      - Automatic cleanup when parser instances are replaced

    ### Changed
    - **Order Configuration**: Groups without explicit `order` now get auto-assigned values starting from 0
    - **Collision Handling**: Groups with duplicate orders are automatically adjusted to next available slot
    - **Debug Logging**: Enhanced logging for order resolution process to aid debugging

    ### Fixed
    - **Configuration Conflicts**: Duplicate order values no longer cause validation failures
    - **Memory Leaks**: Parser now properly releases resources when disposed
    - **Order Management**: Eliminated need for manual order calculation when adding new groups

### Added

-   **Import Type Enum**: Introduced `ImportType` enum replacing string literals for better type safety and maintainability (#afed51b)
-   **Unused Imports Detection**: New `removeUnusedImports` configuration option to automatically remove unused imports (#680c3c1)
-   **Missing Modules Detection**: New `removeMissingModules` configuration option to remove imports from non-existent modules (#680c3c1)
-   **Excluded Folders**: Added `excludedFolders` configuration to skip formatting in specific directories (#51fdd17)
-   **Context Menu Integration**: Added "Format Imports" to the editor context menu for TypeScript/JavaScript files
-   **CLAUDE.md**: Added AI assistant guidance file for better development experience
-   **Comprehensive Test Suite**: New test structure in `test/parser/` with specialized test categories

### Changed

-   **Parser Migration**: Replaced external `tidyjs-parser` with internal parser using `@typescript-eslint/parser` for better AST analysis (#08fb65d)
-   **Configuration System**: Complete rewrite of `ConfigManager` with automatic validation and repair mechanisms (#1cf1f21)
-   **Import Formatting**: Added blank lines between import groups for better readability (#6f94516)
-   **Build System**: Migrated from `esbuild.js` to `scripts/build.js` with improved build process
-   **ESLint Configuration**: Migrated from `eslint.config.js` to `eslint.config.mjs` (#b715a60)
-   **Import Consolidation**: Imports from the same source are now properly merged (#54de8d2)
-   **Empty Imports Handling**: Empty imports are now treated as side-effect imports (#0e184f0)
-   **Error Recovery**: Enhanced error handling with automatic extension disabling on configuration errors (#baf3663)
-   **Test Structure**: Complete reorganization from `test/unit/` to `test/parser/` with more focused tests

### Deprecated

-   Legacy import type strings in favor of the new `ImportType` enum

### Removed

-   External `tidyjs-parser` dependency - replaced with internal implementation
-   `test-runner.sh` script - using standard Jest commands instead
-   Old test structure in `test/unit/` directory
-   Legacy test fixtures in `test/fixtures/input/` and `test/fixtures/expected/`

### Fixed

-   **Configuration Errors**: Extension now properly disables itself when configuration is invalid (#baf3663)
-   **Type Import Detection**: Improved detection using AST instead of string parsing (#59cc990)
-   **Mixed Import Sorting**: Better handling of imports combining default and named exports (#6d8172f)
-   **Import Parsing**: More robust error detection and recovery (#5b6ba1c)
-   **Multiline Import Alignment**: Fixed alignment issues with multiline imports

### Security

-   Added stricter TypeScript configuration with `strict: true` for better type safety (#bd38494)
-   Improved validation of user-provided regex patterns in configuration
