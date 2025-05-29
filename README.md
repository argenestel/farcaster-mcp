# Farcaster MCP Server

[![smithery badge](https://smithery.ai/badge/@manimohans/farcaster-mcp)](https://smithery.ai/server/@manimohans/farcaster-mcp)

A Model Context Protocol (MCP) server for interacting with Farcaster, enabling you to fetch casts and post new casts to the network.

<a href="https://glama.ai/mcp/servers/koo5epnlc7">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/koo5epnlc7/badge" alt="Farcaster Server MCP server" />
</a>

## Features

- **Fetch casts by FID**: Get casts from a specific Farcaster user using their FID
- **Fetch casts by username**: Get casts from a specific Farcaster user using their username
- **Post casts**: Create and post new casts to Farcaster (requires authentication)

## Environment Variables

### Required for Posting Casts

- `FARCASTER_BEARER_TOKEN`: Your Farcaster API Bearer token
  - This is only required if you want to use the posting functionality
  - The server will work for read-only operations without this token
  - You can obtain this token from the Farcaster Client API

### Example

```bash
export FARCASTER_BEARER_TOKEN="your_bearer_token_here"
```

Or create a `.env` file:

```
FARCASTER_BEARER_TOKEN=your_bearer_token_here
```

## Available Tools

### `get-user-casts`
Get casts from a specific Farcaster user by FID.

**Parameters:**
- `fid` (number): Farcaster user ID (FID)
- `limit` (number, optional): Maximum number of casts to return (default: 10)

### `get-username-casts`
Get casts from a specific Farcaster username.

**Parameters:**
- `username` (string): Farcaster username
- `limit` (number, optional): Maximum number of casts to return (default: 10)

### `post-cast`
Post a new cast to Farcaster.

**Parameters:**
- `cast` (string): The text content of the cast to be posted
- `embeds` (string[], optional): Optional array of URLs to embed in the cast

**Note:** Requires `FARCASTER_BEARER_TOKEN` environment variable to be set.

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Set up environment variables (if using posting functionality)

## Usage

### Running the Server

```bash
npm start
```

The server will start and listen for MCP connections on stdio.

### Integration with MCP Clients

This server follows the Model Context Protocol specification and can be used with any MCP-compatible client.

## API Endpoints Used

This server interacts with the Farcaster Client API:
- Base URL: `https://client.farcaster.xyz`
- User lookup: `/v2/user-by-username`
- Casts retrieval: `/v2/casts`
- Cast posting: `/v2/casts`

## Error Handling

- The server provides detailed error messages for debugging
- Rate limiting and API errors are handled gracefully
- Missing environment variables are clearly reported

## Security

- Bearer tokens are handled securely through environment variables
- No sensitive information is logged or exposed
- API calls are made over HTTPS

## Contributing

Follow DRY, SOLID, and KISS principles when contributing to this project.

## License

[Add your license information here]

## Smithery Configuration

This repository includes the necessary configuration files for Smithery:

- `smithery.yaml`: YAML configuration for Smithery deployment
- `smithery.json`: JSON configuration for Smithery capabilities
- `Dockerfile`: Container configuration for Smithery deployment

## API Details

This implementation uses the Farcaster Hubble API to fetch data.

## Development

```bash
# Run in development mode
npm run dev
```