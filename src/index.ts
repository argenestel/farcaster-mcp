#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import axios from "axios";
import { Buffer } from 'buffer';
import * as process from 'process';

// Warpcast API base URL
const WARPCAST_API_BASE = "https://client.warpcast.com/v2";

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

// Types for Warpcast API responses

interface WarpcastUserResponse {
  result: {
    user: {
      fid: number;
      displayName: string;
      username: string;
      profile: {
        bio: {
          text: string;
          mentions: any[];
          channelMentions: any[];
        };
        location: {
          placeId: string;
          description: string;
        };
        earlyWalletAdopter: boolean;
      };
      followerCount: number;
      followingCount: number;
      pfp: {
        url: string;
        verified: boolean;
      };
      connectedAccounts: any[];
      viewerContext: any;
    };
    collectionsOwned: any[];
    extras: {
      fid: number;
      custodyAddress: string;
      ethWallets: string[];
      solanaWallets: string[];
      walletLabels: any[];
      v2: boolean;
    };
  };
}

interface WarpcastCast {
  hash: string;
  threadHash: string;
  author: {
    fid: number;
    displayName: string;
    username: string;
    profile: {
      bio: {
        text: string;
        mentions: any[];
        channelMentions: any[];
      };
      location: {
        placeId: string;
        description: string;
      };
      earlyWalletAdopter?: boolean;
    };
    followerCount: number;
    followingCount: number;
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
  parentAuthor?: any;
  embeds?: {
    images: any[];
    urls: any[];
    unknowns: any[];
    videos: any[];
    processedCastText: string;
    groupInvites: any[];
  };
  tags?: any[];
  mentions?: any[];
  channel?: any;
  recast?: boolean;
  quoteCount: number;
  combinedRecastCount: number;
}

interface WarpcastCastsResponse {
  result: {
    casts: WarpcastCast[];
  };
}

// Helper function to make API requests to Warpcast API
async function fetchFromWarpcast(endpoint: string, params: Record<string, any> = {}) {
  try {
    console.error(`Fetching from ${WARPCAST_API_BASE}${endpoint} with params:`, params);
    const response = await axios.get(`${WARPCAST_API_BASE}${endpoint}`, {
      params
    });
    console.error(`Response status: ${response.status}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching from Warpcast API:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(`Warpcast API error: ${error.response.status} - ${error.response.data?.details || error.message}`);
    }
    throw new Error(`Failed to fetch from Warpcast: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Helper function to get casts by FID from Warpcast API
async function getCastsByFid(fid: number, limit: number = 10): Promise<WarpcastCast[]> {
  try {
    console.error(`Fetching casts for FID ${fid} with limit ${limit}`);
    
    const response = await axios.get(`${WARPCAST_API_BASE}/casts`, {
      params: { fid, limit }
    });
    
    if (response.data && response.data.result && response.data.result.casts) {
      console.error(`Got ${response.data.result.casts.length} casts`);
      return response.data.result.casts;
    }
    
    console.error(`No casts found for FID ${fid}`);
    return [];
  } catch (error) {
    console.error(`Error fetching casts for FID ${fid}:`, error);
    return [];
  }
}

// Helper function to format Warpcast casts
function formatWarpcastCasts(casts: WarpcastCast[], limit: number = 10): string {
  if (!casts || casts.length === 0) {
    return "No casts found.";
  }
  
  console.error(`Formatting ${casts.length} casts`);
  
  // Limit the number of casts
  const limitedCasts = casts.slice(0, limit);
  
  const formattedCasts = limitedCasts.map((cast, index) => {
    try {
      const author = cast.author;
      const displayName = author.displayName || author.username || `User ${author.fid}`;
      
      // Convert timestamp to readable date (Warpcast timestamps are in milliseconds)
      const date = new Date(cast.timestamp).toLocaleString();
      
      // Check if this is a reply
      let replyInfo = "";
      if (cast.parentHash && cast.parentAuthor) {
        replyInfo = `   Reply to: ${cast.parentAuthor.displayName || cast.parentAuthor.username} (${cast.parentHash})\n`;
      }
      
      // Check if there are embeds
      let embedsInfo = "";
      if (cast.embeds && (cast.embeds.images.length > 0 || cast.embeds.urls.length > 0)) {
        const embedParts: string[] = [];
        if (cast.embeds.images.length > 0) {
          embedParts.push(`${cast.embeds.images.length} image(s)`);
        }
        if (cast.embeds.urls.length > 0) {
          embedParts.push(`${cast.embeds.urls.length} URL(s)`);
        }
        embedsInfo = `   Embeds: ${embedParts.join(", ")}\n`;
      }
      
      // Check for mentions
      let mentionsInfo = "";
      if (cast.mentions && cast.mentions.length > 0) {
        mentionsInfo = `   Mentions: ${cast.mentions.map((m: any) => `@${m.username}`).join(", ")}\n`;
      }
      
      // Check for channel
      let channelInfo = "";
      if (cast.channel) {
        channelInfo = `   Channel: /${cast.channel.key}\n`;
      }
      
      // Check if this is a recast
      let recastInfo = "";
      if (cast.recast) {
        recastInfo = `   [RECAST]\n`;
      }
      
      return `
${index + 1}. ${displayName} (@${author.username})
   FID: ${author.fid}
   Time: ${date}
   Text: ${cast.text}
${replyInfo}${embedsInfo}${mentionsInfo}${channelInfo}${recastInfo}   Reactions: ${cast.reactions.count} | Recasts: ${cast.recasts.count} | Replies: ${cast.replies.count}
   Cast Hash: ${cast.hash}
   `;
    } catch (error) {
      console.error(`Error formatting cast at index ${index}:`, error);
      return `${index + 1}. [Error formatting cast]`;
    }
  });
  
  return formattedCasts.join("\n---\n");
}

// Helper function to get user data by username from Warpcast API
async function getUserByUsername(username: string): Promise<{ fid: number; displayName: string } | null> {
  try {
    console.error(`Looking up user data for username: ${username}`);
    
    const response = await axios.get(`${WARPCAST_API_BASE}/user-by-username`, {
      params: { username }
    });
    
    if (response.data && response.data.result && response.data.result.user) {
      const user = response.data.result.user;
      console.error(`Found user: FID ${user.fid}, displayName: ${user.displayName}`);
      return {
        fid: user.fid,
        displayName: user.displayName
      };
    }
    
    console.error(`No user found for username ${username}`);
    return null;
  } catch (error) {
    console.error(`Error finding user by username ${username}:`, error);
    return null;
  }
}

// Helper function to find FID by username (wrapper for backward compatibility)
async function getFidByUsername(username: string): Promise<number | null> {
  const user = await getUserByUsername(username);
  return user ? user.fid : null;
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
          console.error(`Fetching casts for FID ${fid} with limit ${limit}`);
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
          
          const castsText = formatWarpcastCasts(casts, limit);
          
          return {
            content: [
              {
                type: "text",
                text: `# Casts from FID ${fid}\n\n${castsText}`
              }
            ]
          };
        } catch (error) {
          console.error("Error in get-user-casts:", error);
          return {
            content: [
              {
                type: "text",
                text: `Error fetching casts: ${error instanceof Error ? error.message : String(error)}`
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
          console.error(`Looking up casts for username: ${username}`);
          
          // Get user data directly from Warpcast API
          const user = await getUserByUsername(username);
          
          if (!user) {
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
          
          console.error(`Found user: FID ${user.fid}, displayName: ${user.displayName}`);
          
          // Now get the casts for this FID
          const casts = await getCastsByFid(user.fid, limit);
          
          if (!casts || casts.length === 0) {
            return {
              content: [
                {
                  type: "text",
                  text: `No casts found for ${user.displayName} (FID: ${user.fid})`
                }
              ]
            };
          }
          
          const castsText = formatWarpcastCasts(casts, limit);
          
          return {
            content: [
              {
                type: "text",
                text: `# Casts from ${user.displayName}\n\n${castsText}`
              }
            ]
          };
        } catch (error) {
          console.error("Error in get-username-casts:", error);
          return {
            content: [
              {
                type: "text",
                text: `Error fetching casts by username: ${error instanceof Error ? error.message : String(error)}`
              }
            ],
            isError: true
          };
        }
      }
    );

    // Register tool for getting user info by username
    server.tool(
      "get-user-info",
      "Get user information by Farcaster username",
      {
        username: z.string().describe("Farcaster username")
      },
      async ({ username }: { username: string }) => {
        try {
          console.error(`Looking up user info for username: ${username}`);
          
          const user = await getUserByUsername(username);
          
          if (!user) {
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

          // Get full user data from Warpcast API
          const response = await axios.get(`${WARPCAST_API_BASE}/user-by-username`, {
            params: { username }
          });

          if (response.data && response.data.result && response.data.result.user) {
            const userData = response.data.result.user;
            
            return {
              content: [
                {
                  type: "text",
                  text: `# User Information for @${username}

**Display Name:** ${userData.displayName}
**FID:** ${userData.fid}
**Username:** @${userData.username}
**Bio:** ${userData.profile.bio.text}
**Followers:** ${userData.followerCount}
**Following:** ${userData.followingCount}
**Profile Picture:** ${userData.pfp.url}
**Verified:** ${userData.pfp.verified ? 'Yes' : 'No'}
**Early Wallet Adopter:** ${userData.profile.earlyWalletAdopter ? 'Yes' : 'No'}
${userData.profile.location.description ? `**Location:** ${userData.profile.location.description}` : ''}`
                }
              ]
            };
          }

          return {
            content: [
              {
                type: "text",
                text: `Found user but couldn't get detailed information for ${username}`
              }
            ]
          };
        } catch (error) {
          console.error("Error in get-user-info:", error);
          return {
            content: [
              {
                type: "text",
                text: `Error fetching user info: ${error instanceof Error ? error.message : String(error)}`
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