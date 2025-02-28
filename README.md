# Farcaster MCP

A Model Context Protocol (MCP) implementation for Farcaster, allowing AI models to interact with the Farcaster social network.

## Features

- **Get User Casts**: Retrieve casts from a specific Farcaster user by FID
- **Get Username Casts**: Retrieve casts from a specific Farcaster user by username
- **Get Channel Casts**: Retrieve casts from a specific Farcaster channel
- **Analyze Cast**: Generate an analysis prompt for a specific cast

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Usage

This package is designed to be used with the MCP Inspector or integrated into AI applications that support the Model Context Protocol.

### Using with MCP Inspector

```bash
npx @modelcontextprotocol/inspector node ./build/index.js
```

### Example Commands

Get casts from a user by FID:
```
get-user-casts({"fid": 6846, "limit": 10})
```

Get casts from a user by username:
```
get-username-casts({"username": "mani", "limit": 10})
```

Get casts from a channel:
```
get-channel-casts({"channel": "aichannel", "limit": 10})
```

Analyze a cast:
```
analyze-cast({"cast_hash": "0x1234567890abcdef"})
```

## API Details

This implementation uses the Farcaster Hubble API to fetch data. No API key is required for basic functionality.

## License

MIT 