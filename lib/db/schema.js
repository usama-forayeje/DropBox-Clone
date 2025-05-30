import {
  pgTable,
  text,
  uuid,
  boolean,
  integer,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const files = pgTable("files", {
  id: uuid("id").defaultRandom().primaryKey(),

  // file name and type
  name: text("name").notNull(),
  content: text("text").notNull(),
  size: integer("size").notNull(),
  type: text("type").notNull(),

  // storage info
  fileUrl: text("file_url").notNull(),
  thumbnailUrl: text("thumbnail_url"),

  // ownership info
  userId: uuid("user_id").notNull(),
  parentId: uuid("parent_id"),

  // file/folder flags
  isFolder: boolean("is_folder").notNull().default(false),
  isStarred: boolean("is_starred").notNull().default(false),
  isTrashed: boolean("is_trashed").notNull().default(false),

  // timestamps
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const filesRelations = relations(files, ({ one, many }) => ({
  parent: one(files, {
    fields: [files.parentId],
    references: [files.id],
  }),
  children: many(files),
}));
