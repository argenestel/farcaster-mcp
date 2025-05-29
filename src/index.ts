#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import { Buffer } from 'buffer';
import * as process from 'process';
// Farcaster Client API base URL
const CLIENT_API_BASE = "https://client.farcaster.xyz";

// Environment variable handling
const FARCASTER_BEARER_TOKEN = process.env.FARCASTER_BEARER_TOKEN;

// Create MCP server with all capabilities
const server = new McpServer({
  name: "farcaster-mcp",
  version: "1.0.0",
  capabilities: {
    tools: {},
    resources: {},
    prompts: {}
  }
});

// Types for Farcaster Client API responses
interface ClientUserResponse {
  result: {
    user: {
      fid: number;
      displayName: string;
      profile: {
        bio: {
          text: string;
          mentions: string[];
          channelMentions: string[];
        };
        location: {
          placeId: string;
          description: string;
        };
      };
      followerCount: number;
      followingCount: number;
      username: string;
      pfp: {
        url: string;
        verified: boolean;
      };
    };
  };
}

interface ClientCastResponse {
  result: {
    casts: ClientCast[];
  };
}

interface ClientCast {
  hash: string;
  threadHash: string;
  author: {
    fid: number;
    displayName: string;
    username: string;
    pfp: {
      url: string;
      verified: boolean;
    };
  };
  text: string;
  timestamp: number;
  replies: {
    count: number;
  };
  reactions: {
    count: number;
  };
  recasts: {
    count: number;
    recasters: any[];
  };
  watches: {
    count: number;
  };
  parentHash?: string;
  parentAuthor?: {
    fid: number;
    username: string;
  };
}

interface ClientCastResponse {
  result: {
    casts: ClientCast[];
  };
}

// Helper function to make API requests to Farcaster Client API
async function fetchFromClient(endpoint: string, params: Record<string, any> = {}) {
  try {
    console.error(`Fetching from ${CLIENT_API_BASE}${endpoint} with params:`, params);
    const response = await axios.get(`${CLIENT_API_BASE}${endpoint}`, {
      params
    });
    console.error(`Response status: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching from Client API:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Client API error: ${error.response.status} - ${error.response.data?.details || error.message}`);
    }
    throw new Error(`Failed to fetch from Client API: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function postCasts(endpoint: string, BearerToken: string, cast: string, embeds?: string[]) {
  try {
    const response = await axios.post(`${CLIENT_API_BASE}${endpoint}`, {
      text: cast,
      embeds: embeds || []
    }, {
      headers: {
        "authorization": `Bearer ${BearerToken}`,
        "content-type": "application/json"
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error posting cast:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Client API error: ${error.response.status} - ${error.response.data?.details || error.message}`);
    }
    throw new Error(`Failed to post cast: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to get user data by username
async function getUserByUsername(username: string): Promise<ClientUserResponse['result']['user'] | null> {
  try {
    console.error(`Looking up user data for username: ${username} `);
    const response = await fetchFromClient(`/v2/user-by-username`, {
      username
    }) as ClientUserResponse;

    if (response?.result?.user) {
      console.error(`Found user data for ${username}: FID = ${response.result.user.fid} `);
      return response.result.user;
    }

    return null;
  } catch (error) {
    console.error(`Error getting user data for ${username}: `, error);
    return null;
  }
}

// Helper function to get casts by FID
async function getCastsByFid(fid: number, limit: number = 10): Promise<ClientCast[]> {
  try {
    console.error(`Fetching casts for FID ${fid} with limit ${limit} `);
    const response = await fetchFromClient(`/v2/casts`, {
      fid,
      limit
    }) as ClientCastResponse;

    if (response?.result?.casts) {
      console.error(`Found ${response.result.casts.length} casts for FID ${fid}`);
      return response.result.casts;
    }

    return [];
  } catch (error) {
    console.error(`Error getting casts for FID ${fid}: `, error);
    return [];
  }
}

// Helper function to format casts from the new API
async function formatCasts(casts: ClientCast[], limit: number = 10) {
  if (!casts || casts.length === 0) {
    return "No casts found.";
  }

  console.error(`Formatting ${casts.length} casts`);

  // Limit the number of casts
  const limitedCasts = casts.slice(0, limit);

  // Format each cast
  const formattedCasts = limitedCasts.map((cast, index) => {
    try {
      const date = new Date(cast.timestamp).toLocaleString();

      // Format parent info if this is a reply
      let replyInfo = "";
      if (cast.parentHash && cast.parentAuthor) {
        replyInfo = `   Reply to: ${cast.parentAuthor.username} (FID: ${cast.parentAuthor.fid}) \n`;
      }

      return `
${index + 1}. ${cast.author.displayName} (@${cast.author.username})
    FID: ${cast.author.fid}
    Time: ${date}
    Text: ${cast.text}
${replyInfo}   Cast ID: ${cast.hash}
    Reactions: ${cast.reactions.count} | Recasts: ${cast.recasts.count} | Replies: ${cast.replies.count}
    `;
    } catch (error) {
      console.error(`Error formatting cast at index ${index}: `, error);
      return `${index + 1}.[Error formatting cast]`;
    }
  });

  return formattedCasts.join("\n---\n");
}

// Main function to start the server
async function main() {
  try {
    // Register tool for getting casts by user FID
    server.tool(
      "get-user-casts",
      "Get casts from a specific Farcaster user by FID",
      {
        fid: z.number().describe("Farcaster user ID (FID)"),
        limit: z.number().optional().describe("Maximum number of casts to return (default: 10)")
      },
      async ({ fid, limit = 10 }: { fid: number; limit?: number }) => {
        try {
          console.error(`Fetching casts for FID ${fid} with limit ${limit} `);
          const casts = await getCastsByFid(fid, limit);

          if (!casts || casts.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `No casts found for FID ${fid}`
                }
              ]
            };
          }

          const castsText = await formatCasts(casts, limit);

          return {
            content: [
              {
                type: "text",
                text: `# Casts from FID ${fid} \n\n${castsText} `
              }
            ]
          };
        } catch (error) {
          console.error("Error in get-user-casts:", error);
          return {
            content: [
              {
                type: "text",
                text: `Error fetching casts: ${error instanceof Error ? error.message : String(error)} `
              }
            ],
            isError: true
          };
        }
      }
    );

    server.tool(
      "post-cast",
      "Post a new cast to Farcaster",
      {
        cast: z.string().describe("The text content of the cast to be posted"),
        embeds: z.array(z.string()).optional().describe("Optional array of URLs to embed in the cast")
      },
      async ({ cast, embeds }: { cast: string; embeds?: string[] }) => {
        try {
          // Check if Bearer token is available
          if (!FARCASTER_BEARER_TOKEN) {
            return {
              content: [
                {
                  type: "text",
                  text: "Error: FARCASTER_BEARER_TOKEN environment variable is required for posting casts. Please set it and restart the server."
                }
              ],
              isError: true
            };
          }

          console.error(`Posting cast: "${cast}"`);

          // Post the cast using the Farcaster Client API
          const result = await postCasts("/v2/casts", FARCASTER_BEARER_TOKEN, cast, embeds);
          if (result?.result?.cast) {
            const castData = result.result.cast;
            const castHash = castData.hash || "unknown";
            const castText = castData.text || cast;
            
            return {
              content: [
                {
                  type: "text",
                  text: `# Cast Posted Successfully! 🎉\n\nYour cast has been posted to Farcaster.\n\nCast content: "${castText}"\nCast ID: ${castHash}\nTimestamp: ${new Date(castData.timestamp || Date.now()).toLocaleString()}\n\n${embeds ? `Embeds: ${embeds.join(", ")}\n` : ""}Status: Posted`
                }
              ]
            };
          } else {
            throw new Error(`Unexpected response format from Farcaster API. Response: ${JSON.stringify(result)}`);
          }
        } catch (error) {
          console.error("Error in post-cast:", error);
          return {
            content: [
              {
                type: "text",
                text: `Error posting cast: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Register tool for getting casts by username
    server.tool(
      "get-username-casts",
      "Get casts from a specific Farcaster username",
      {
        username: z.string().describe("Farcaster username"),
        limit: z.number().optional().describe("Maximum number of casts to return (default: 10)")
      },
      async ({ username, limit = 10 }: { username: string; limit?: number }) => {
        try {
          console.error(`Looking up casts for username: ${username} `);

          // First, get the user data which includes FID
          const userData = await getUserByUsername(username);

          if (!userData) {
            return {
              content: [
                {
                  type: "text",
                  text: `User "${username}" not found.`
                }
              ],
              isError: true
            };
          }

          // Now get the casts for this FID
          const casts = await getCastsByFid(userData.fid, limit);

          if (!casts || casts.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `No casts found for ${userData.displayName}(@${userData.username})`
                }
              ]
            };
          }

          const castsText = await formatCasts(casts, limit);

          return {
            content: [
              {
                type: "text",
                text: `# Casts from ${userData.displayName} (@${userData.username}) \n\n${castsText} `
              }
            ]
          };
        } catch (error) {
          console.error("Error in get-username-casts:", error);
          return {
            content: [
              {
                type: "text",
                text: `Error fetching casts by username: ${error instanceof Error ? error.message : String(error)} `
              }
            ],
            isError: true
          };
        }
      }
    );

    // Connect to transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Farcaster MCP Server running on stdio");
  } catch (error) {
    console.error("Fatal error in main():", error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Unhandled error:", error);
  process.exit(1);
}); 
