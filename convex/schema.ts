import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  challenges: defineTable({
    name: v.string(),
    placeId: v.string(),
    lat: v.string(),
    lng: v.string(),
    description: v.string(),
    prize: v.string()
  })
})
