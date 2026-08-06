import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { mediaProviderEnum, mediaTypeEnum } from "@/db/schema/enums";

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mediaType: mediaTypeEnum("media_type").notNull(),
    storageProvider: mediaProviderEnum("storage_provider").notNull(),
    url: text("url").notNull(),
    thumbnailUrl: text("thumbnail_url"),
    sourceUrl: text("source_url"),
    creatorName: text("creator_name"),
    creatorUrl: text("creator_url"),
    licenseName: text("license_name"),
    licenseUrl: text("license_url"),
    attributionText: text("attribution_text"),
    externalId: text("external_id"),
    isApproved: boolean("is_approved").default(false).notNull(),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("media_assets_provider_external_unique").on(
      table.storageProvider,
      table.externalId,
    ),
    index("media_assets_type_approved_idx").on(
      table.mediaType,
      table.isApproved,
    ),
  ],
);
