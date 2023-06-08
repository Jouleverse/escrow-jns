# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

<!-- EXAMPLE

## [1.0.0]

### Added

- I've added feature XY (#1000)

### Changed

- I've cleaned up XY (#1000)

### Deprecated

- I've deprecated XY (#1000)

### Removed

- I've removed XY (#1000)

### Fixed

- I've fixed XY (#1000)

### Security

- I've improved the security in XY (#1000)

-->

## [4.0.1-alpha.1]

### Changed

-   `signTransaction` and `privateKeyToAccount` will throw `TransactionSigningError` instead of `SignerError` now (#5462)

## [4.0.1-alpha.2]

### Removed

-   These types were moved to `web3-types` package: Cipher, CipherOptions, ScryptParams, PBKDF2SHA256Params, KeyStore (#5581)

## [4.0.1-alpha.3]

### Changed

-   Updated dependencies (#5725)

## [4.0.1-alpha.4]

### Changed

-   `tsc` compiled files moved to `lib/` directory from `dist/` (#5739)

## [4.0.1-alpha.5]

### Changed

-   web3.js dependencies (#5757)

## [4.0.1-rc.0]

### Changed

-   Updated dependencies (#5912)

## [4.0.1-rc.1]

### Added

-   Added source files (#5956)
-   Added hybrid build (ESM and CJS) of library (#5904)

### Changed

-   Moved @ethereumjs/tx, @ethereumjs/common code to our source code (#5963)
-   The method `signTransaction` returned by `privateKeyToAccount` is now accepting the type `Transaction` for its argument. (#5993)

## [4.0.1-rc.2]

### Fixed

-   Fixed ESM import bugs reported in (#6032) and (#6034)

### Changed

-   Replaced `Buffer` for `Uint8Array` (#6004)
-   The methods `recover`, `encrypt`, `privateKeyToAddress` does not support type `Buffer` but supports type `Uint8Array` (#6004)
-   The method `parseAndValidatePrivateKey` returns a type `Uint8Array` instead of type `Buffer` (#6004)

## [4.0.1]

Release Notes:

Detailed List of change logs are mentioned under previous 4.x alpha and RC releases.

Documentation:
[Web3.js documentation](https://docs.web3js.org/)
[Web3 API](https://docs.web3js.org/api)
[Migration Guide from 1.x](https://docs.web3js.org/guides/web3_upgrade_guide/x/)

## [Unreleased]
