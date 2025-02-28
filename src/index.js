"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
var zod_1 = require("zod");
var axios_1 = require("axios");
var buffer_1 = require("buffer");
var process = require("process");
// Farcaster Hubble API base URL
var HUBBLE_API_BASE = "https://nemes.farcaster.xyz:2281/v1";
// No API key needed for direct Hubble API
// Create MCP server with all capabilities
var server = new mcp_js_1.McpServer({
    name: "farcaster-mcp",
    version: "1.0.0",
    capabilities: {
        tools: {},
        resources: {},
        prompts: {}
    }
});
// Helper function to make API requests to Farcaster Hubble
function fetchFromHubble(endpoint_1) {
    return __awaiter(this, arguments, void 0, function (endpoint, params) {
        var response, error_1;
        var _a;
        if (params === void 0) { params = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    console.error("Fetching from ".concat(HUBBLE_API_BASE).concat(endpoint, " with params:"), params);
                    return [4 /*yield*/, axios_1.default.get("".concat(HUBBLE_API_BASE).concat(endpoint), {
                            params: params
                        })];
                case 1:
                    response = _b.sent();
                    console.error("Response status: ".concat(response.status));
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _b.sent();
                    console.error("Error fetching from Hubble API:", error_1);
                    if (axios_1.default.isAxiosError(error_1) && error_1.response) {
                        throw new Error("Hubble API error: ".concat(error_1.response.status, " - ").concat(((_a = error_1.response.data) === null || _a === void 0 ? void 0 : _a.details) || error_1.message));
                    }
                    throw new Error("Failed to fetch from Hubble: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Helper function to get user data (username, display name)
function getUserData(fid) {
    return __awaiter(this, void 0, void 0, function () {
        var usernameResponse, displayNameResponse, pfpResponse, bioResponse, userData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, fetchFromHubble("/userDataByFid", {
                            fid: fid,
                            user_data_type: 1 // USERNAME
                        })];
                case 1:
                    usernameResponse = _a.sent();
                    return [4 /*yield*/, fetchFromHubble("/userDataByFid", {
                            fid: fid,
                            user_data_type: 2 // DISPLAY_NAME
                        })];
                case 2:
                    displayNameResponse = _a.sent();
                    return [4 /*yield*/, fetchFromHubble("/userDataByFid", {
                            fid: fid,
                            user_data_type: 3 // PFP
                        })];
                case 3:
                    pfpResponse = _a.sent();
                    return [4 /*yield*/, fetchFromHubble("/userDataByFid", {
                            fid: fid,
                            user_data_type: 4 // BIO
                        })];
                case 4:
                    bioResponse = _a.sent();
                    userData = { fid: fid, type: 0 };
                    if (usernameResponse.messages && usernameResponse.messages.length > 0) {
                        userData.username = usernameResponse.messages[0].data.userDataBody.value;
                    }
                    if (displayNameResponse.messages && displayNameResponse.messages.length > 0) {
                        userData.displayName = displayNameResponse.messages[0].data.userDataBody.value;
                    }
                    if (pfpResponse.messages && pfpResponse.messages.length > 0) {
                        userData.pfpUrl = pfpResponse.messages[0].data.userDataBody.value;
                    }
                    if (bioResponse.messages && bioResponse.messages.length > 0) {
                        userData.bio = bioResponse.messages[0].data.userDataBody.value;
                    }
                    return [2 /*return*/, userData];
                case 5:
                    error_2 = _a.sent();
                    console.error("Error fetching user data:", error_2);
                    return [2 /*return*/, { fid: fid, type: 0 }];
                case 6: return [2 /*return*/];
            }
        });
    });
}
// Helper function to get reactions for a cast
function getReactionsForCast(castHash) {
    return __awaiter(this, void 0, void 0, function () {
        var likesResponse, recastsResponse, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, fetchFromHubble("/reactionsByCast", {
                            target_hash: castHash,
                            reaction_type: 1 // LIKE
                        })];
                case 1:
                    likesResponse = _a.sent();
                    return [4 /*yield*/, fetchFromHubble("/reactionsByCast", {
                            target_hash: castHash,
                            reaction_type: 2 // RECAST
                        })];
                case 2:
                    recastsResponse = _a.sent();
                    return [2 /*return*/, {
                            likes: likesResponse.messages ? likesResponse.messages.length : 0,
                            recasts: recastsResponse.messages ? recastsResponse.messages.length : 0
                        }];
                case 3:
                    error_3 = _a.sent();
                    console.error("Error fetching reactions:", error_3);
                    return [2 /*return*/, { likes: 0, recasts: 0 }];
                case 4: return [2 /*return*/];
            }
        });
    });
}
// Helper function to format casts
function formatCasts(casts_1) {
    return __awaiter(this, arguments, void 0, function (casts, limit) {
        var castAdds, limitedCasts, formattedCastsPromises, formattedCasts;
        var _this = this;
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!casts || casts.length === 0) {
                        return [2 /*return*/, "No casts found."];
                    }
                    console.error("Formatting ".concat(casts.length, " casts"));
                    castAdds = casts.filter(function (cast) {
                        return cast.data && cast.data.type === "MESSAGE_TYPE_CAST_ADD" && cast.data.castAddBody;
                    });
                    if (castAdds.length === 0) {
                        return [2 /*return*/, "No cast additions found."];
                    }
                    limitedCasts = castAdds.slice(0, limit);
                    formattedCastsPromises = limitedCasts.map(function (cast, index) { return __awaiter(_this, void 0, void 0, function () {
                        var fid, userData, reactions, farcasterEpoch, date, username, displayName, replyInfo, embedsInfo, error_4;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    // Check if cast and cast.data exist
                                    if (!cast || !cast.data || !cast.data.castAddBody) {
                                        console.error("Invalid cast at index ".concat(index, ":"), cast);
                                        return [2 /*return*/, "".concat(index + 1, ". [Invalid cast format]")];
                                    }
                                    fid = cast.data.fid;
                                    return [4 /*yield*/, getUserData(fid)];
                                case 1:
                                    userData = _a.sent();
                                    return [4 /*yield*/, getReactionsForCast(cast.hash)];
                                case 2:
                                    reactions = _a.sent();
                                    farcasterEpoch = new Date('2021-01-01T00:00:00Z').getTime() / 1000;
                                    date = new Date((cast.data.timestamp + farcasterEpoch) * 1000).toLocaleString();
                                    username = userData.username || 'unknown';
                                    displayName = userData.displayName || username;
                                    replyInfo = "";
                                    if (cast.data.castAddBody.parentCastId) {
                                        replyInfo = "   Reply to: ".concat(cast.data.castAddBody.parentCastId.fid, "/").concat(cast.data.castAddBody.parentCastId.hash, "\n");
                                    }
                                    embedsInfo = "";
                                    if (cast.data.castAddBody.embeds && cast.data.castAddBody.embeds.length > 0) {
                                        embedsInfo = "   Embeds: " + cast.data.castAddBody.embeds.map(function (embed) {
                                            if (embed.url)
                                                return embed.url;
                                            return "embedded content";
                                        }).join(", ") + "\n";
                                    }
                                    return [2 /*return*/, "\n".concat(index + 1, ". @").concat(username, " (").concat(displayName, ")\n   FID: ").concat(fid, "\n   Time: ").concat(date, "\n   Text: ").concat(cast.data.castAddBody.text, "\n").concat(replyInfo).concat(embedsInfo, "   Likes: ").concat(reactions.likes, " | Recasts: ").concat(reactions.recasts, "\n   Cast ID: ").concat(cast.hash, "\n   ")];
                                case 3:
                                    error_4 = _a.sent();
                                    console.error("Error formatting cast at index ".concat(index, ":"), error_4);
                                    return [2 /*return*/, "".concat(index + 1, ". [Error formatting cast]")];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(formattedCastsPromises)];
                case 1:
                    formattedCasts = _a.sent();
                    return [2 /*return*/, formattedCasts.join("\n---\n")];
            }
        });
    });
}
// Helper function to find FID by username
function getFidByUsername(username) {
    return __awaiter(this, void 0, void 0, function () {
        var response, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, fetchFromHubble("/userNameProofByName", {
                            name: username
                        })];
                case 1:
                    response = _a.sent();
                    if (response && response.proof && response.proof.fid) {
                        return [2 /*return*/, response.proof.fid];
                    }
                    return [2 /*return*/, null];
                case 2:
                    error_5 = _a.sent();
                    console.error("Error finding FID by username:", error_5);
                    return [2 /*return*/, null];
                case 3: return [2 /*return*/];
            }
        });
    });
}
// Main function to start the server
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var transport, error_6;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // Register tool for getting casts by user FID
                    server.tool("get-user-casts", "Get casts from a specific Farcaster user by FID", {
                        fid: zod_1.z.number().describe("Farcaster user ID (FID)"),
                        limit: zod_1.z.number().optional().describe("Maximum number of casts to return (default: 10)")
                    }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var response, castsText, error_7;
                        var _c;
                        var fid = _b.fid, _d = _b.limit, limit = _d === void 0 ? 10 : _d;
                        return __generator(this, function (_e) {
                            switch (_e.label) {
                                case 0:
                                    _e.trys.push([0, 3, , 4]);
                                    console.error("Fetching casts for FID ".concat(fid, " with limit ").concat(limit));
                                    return [4 /*yield*/, fetchFromHubble("/castsByFid", {
                                            fid: fid,
                                            pageSize: limit,
                                            reverse: 1 // Get newest first
                                        })];
                                case 1:
                                    response = _e.sent();
                                    console.error("Got response with ".concat(((_c = response.messages) === null || _c === void 0 ? void 0 : _c.length) || 0, " messages"));
                                    if (!response.messages || response.messages.length === 0) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "No casts found for FID ".concat(fid)
                                                    }
                                                ]
                                            }];
                                    }
                                    return [4 /*yield*/, formatCasts(response.messages, limit)];
                                case 2:
                                    castsText = _e.sent();
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "# Casts from FID ".concat(fid, "\n\n").concat(castsText)
                                                }
                                            ]
                                        }];
                                case 3:
                                    error_7 = _e.sent();
                                    console.error("Error in get-user-casts:", error_7);
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Error fetching casts: ".concat(error_7 instanceof Error ? error_7.message : String(error_7))
                                                }
                                            ],
                                            isError: true
                                        }];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Register tool for getting casts from a channel (parent URL)
                    server.tool("get-channel-casts", "Get casts from a specific Farcaster channel", {
                        channel: zod_1.z.string().describe("Channel name or parent URL"),
                        limit: zod_1.z.number().optional().describe("Maximum number of casts to return (default: 10)")
                    }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var channelHash, response, castsText, error_8;
                        var channel = _b.channel, _c = _b.limit, limit = _c === void 0 ? 10 : _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 3, , 4]);
                                    channelHash = channel.startsWith("0x") ? channel : "0x".concat(buffer_1.Buffer.from(channel).toString("hex"));
                                    return [4 /*yield*/, fetchFromHubble("/castsByParent", {
                                            parent_url: channelHash,
                                            pageSize: limit,
                                            reverse: 1 // Get newest first
                                        })];
                                case 1:
                                    response = _d.sent();
                                    if (!response.messages || response.messages.length === 0) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "No casts found for channel \"".concat(channel, "\"")
                                                    }
                                                ]
                                            }];
                                    }
                                    return [4 /*yield*/, formatCasts(response.messages, limit)];
                                case 2:
                                    castsText = _d.sent();
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "# Recent Casts in Channel \"".concat(channel, "\"\n\n").concat(castsText)
                                                }
                                            ]
                                        }];
                                case 3:
                                    error_8 = _d.sent();
                                    console.error("Error in get-channel-casts:", error_8);
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Error fetching channel casts: ".concat(error_8 instanceof Error ? error_8.message : String(error_8))
                                                }
                                            ],
                                            isError: true
                                        }];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Register tool for getting casts by username
                    server.tool("get-username-casts", "Get casts from a specific Farcaster username", {
                        username: zod_1.z.string().describe("Farcaster username"),
                        limit: zod_1.z.number().optional().describe("Maximum number of casts to return (default: 10)")
                    }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var fid, response, castsText, error_9;
                        var username = _b.username, _c = _b.limit, limit = _c === void 0 ? 10 : _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, getFidByUsername(username)];
                                case 1:
                                    fid = _d.sent();
                                    if (!fid) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "User \"".concat(username, "\" not found.")
                                                    }
                                                ],
                                                isError: true
                                            }];
                                    }
                                    return [4 /*yield*/, fetchFromHubble("/castsByFid", {
                                            fid: fid,
                                            pageSize: limit,
                                            reverse: 1 // Get newest first
                                        })];
                                case 2:
                                    response = _d.sent();
                                    if (!response.messages || response.messages.length === 0) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "No casts found for username \"".concat(username, "\" (FID: ").concat(fid, ")")
                                                    }
                                                ]
                                            }];
                                    }
                                    return [4 /*yield*/, formatCasts(response.messages, limit)];
                                case 3:
                                    castsText = _d.sent();
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "# Casts from @".concat(username, " (FID: ").concat(fid, ")\n\n").concat(castsText)
                                                }
                                            ]
                                        }];
                                case 4:
                                    error_9 = _d.sent();
                                    console.error("Error in get-username-casts:", error_9);
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Error fetching casts by username: ".concat(error_9 instanceof Error ? error_9.message : String(error_9))
                                                }
                                            ],
                                            isError: true
                                        }];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Register tool for searching casts (simplified - Hubble API doesn't have direct search)
                    server.tool("search-casts", "Search for casts by keyword (simplified implementation)", {
                        keyword: zod_1.z.string().describe("Keyword to search for in casts"),
                        limit: zod_1.z.number().optional().describe("Maximum number of casts to return (default: 10)")
                    }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                        var response, keywordLower_1, filteredCasts, castsText, error_10;
                        var keyword = _b.keyword, _c = _b.limit, limit = _c === void 0 ? 10 : _c;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    _d.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, fetchFromHubble("/casts", {
                                            pageSize: 100, // Fetch more to filter
                                            reverse: 1 // Get newest first
                                        })];
                                case 1:
                                    response = _d.sent();
                                    if (!response.messages || response.messages.length === 0) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "No casts found to search through."
                                                    }
                                                ]
                                            }];
                                    }
                                    keywordLower_1 = keyword.toLowerCase();
                                    filteredCasts = response.messages.filter(function (cast) {
                                        return cast.data &&
                                            cast.data.type === "MESSAGE_TYPE_CAST_ADD" &&
                                            cast.data.castAddBody &&
                                            cast.data.castAddBody.text.toLowerCase().includes(keywordLower_1);
                                    }).slice(0, limit);
                                    if (filteredCasts.length === 0) {
                                        return [2 /*return*/, {
                                                content: [
                                                    {
                                                        type: "text",
                                                        text: "No casts found containing \"".concat(keyword, "\".")
                                                    }
                                                ]
                                            }];
                                    }
                                    return [4 /*yield*/, formatCasts(filteredCasts, limit)];
                                case 2:
                                    castsText = _d.sent();
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "# Search Results for \"".concat(keyword, "\"\n\n").concat(castsText)
                                                }
                                            ]
                                        }];
                                case 3:
                                    error_10 = _d.sent();
                                    console.error("Error in search-casts:", error_10);
                                    return [2 /*return*/, {
                                            content: [
                                                {
                                                    type: "text",
                                                    text: "Error searching casts: ".concat(error_10 instanceof Error ? error_10.message : String(error_10))
                                                }
                                            ],
                                            isError: true
                                        }];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Register resource for trending casts (simplified)
                    server.resource("trending-casts", "trending://casts", function (uri) { return __awaiter(_this, void 0, void 0, function () {
                        var response, castsText, error_11;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 3, , 4]);
                                    return [4 /*yield*/, fetchFromHubble("/casts", {
                                            pageSize: 10,
                                            reverse: 1 // Get newest first
                                        })];
                                case 1:
                                    response = _a.sent();
                                    if (!response.messages || response.messages.length === 0) {
                                        return [2 /*return*/, {
                                                contents: [{
                                                        uri: uri.href,
                                                        text: "# Recent Casts on Farcaster\n\nNo casts found."
                                                    }]
                                            }];
                                    }
                                    return [4 /*yield*/, formatCasts(response.messages, 10)];
                                case 2:
                                    castsText = _a.sent();
                                    return [2 /*return*/, {
                                            contents: [{
                                                    uri: uri.href,
                                                    text: "# Recent Casts on Farcaster\n\n".concat(castsText)
                                                }]
                                        }];
                                case 3:
                                    error_11 = _a.sent();
                                    console.error("Error fetching recent casts:", error_11);
                                    throw new Error("Failed to fetch recent casts: ".concat(error_11 instanceof Error ? error_11.message : String(error_11)));
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    // Register prompt for cast analysis
                    server.prompt("analyze-cast", "Analyze a Farcaster cast", {
                        cast_hash: zod_1.z.string().describe("Hash of the cast to analyze")
                    }, function (args) { return __awaiter(_this, void 0, void 0, function () {
                        var response, cast, userData, reactions, farcasterEpoch, date, error_12;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 4, , 5]);
                                    return [4 /*yield*/, fetchFromHubble("/castById", {
                                            hash: args.cast_hash
                                        })];
                                case 1:
                                    response = _a.sent();
                                    if (!response.message) {
                                        throw new Error("Cast not found");
                                    }
                                    cast = response.message;
                                    // Check if this is a cast add message
                                    if (cast.data.type !== "MESSAGE_TYPE_CAST_ADD" || !cast.data.castAddBody) {
                                        throw new Error("This is not a cast addition message");
                                    }
                                    return [4 /*yield*/, getUserData(cast.data.fid)];
                                case 2:
                                    userData = _a.sent();
                                    return [4 /*yield*/, getReactionsForCast(cast.hash)];
                                case 3:
                                    reactions = _a.sent();
                                    farcasterEpoch = new Date('2021-01-01T00:00:00Z').getTime() / 1000;
                                    date = new Date((cast.data.timestamp + farcasterEpoch) * 1000).toLocaleString();
                                    return [2 /*return*/, {
                                            messages: [{
                                                    role: "user",
                                                    content: {
                                                        type: "text",
                                                        text: "Please analyze this Farcaster cast:\n                \nAuthor: @".concat(userData.username || 'unknown', " (").concat(userData.displayName || 'Unknown', ")\nFID: ").concat(cast.data.fid, "\nTime: ").concat(date, "\nText: ").concat(cast.data.castAddBody.text, "\nLikes: ").concat(reactions.likes, " | Recasts: ").concat(reactions.recasts, "\n\nPlease provide insights on:\n1. The main topic or themes of this cast\n2. The sentiment (positive, negative, neutral)\n3. Any notable context or references\n4. The engagement level compared to typical Farcaster casts")
                                                    }
                                                }]
                                        }];
                                case 4:
                                    error_12 = _a.sent();
                                    console.error("Error in analyze-cast prompt:", error_12);
                                    return [2 /*return*/, {
                                            messages: [{
                                                    role: "user",
                                                    content: {
                                                        type: "text",
                                                        text: "Error fetching cast: ".concat(error_12 instanceof Error ? error_12.message : String(error_12))
                                                    }
                                                }]
                                        }];
                                case 5: return [2 /*return*/];
                            }
                        });
                    }); });
                    transport = new stdio_js_1.StdioServerTransport();
                    return [4 /*yield*/, server.connect(transport)];
                case 1:
                    _a.sent();
                    console.error("Farcaster MCP Server running on stdio");
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _a.sent();
                    console.error("Fatal error in main():", error_6);
                    process.exit(1);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    });
}
main().catch(function (error) {
    console.error("Unhandled error:", error);
    process.exit(1);
});
