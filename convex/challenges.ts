import { query, mutation } from "./_generated/server"
import { v } from "convex/values"

export const get = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("challenges").collect();
  }
})

// create a new challenge with info provided
export const createChallenge = mutation({
  args: {
    name: v.string(),
    placeId: v.string(),
    lat: v.string(),
    lng: v.string(),
    description: v.string(),
    prize: v.string()
  },
  handler: async (ctx, args) => {
    const newChallengeId = await ctx.db.insert("challenges", {
      name: args.name,
      placeId: args.placeId,
      lat: args.lat,
      lng: args.lng,
      description: args.description,
      prize: args.description
    })
  }
})
