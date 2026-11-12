
import {
  pgTable,
  serial,
  varchar,
  timestamp,
  boolean,
  pgEnum,
  date,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Approval status
export const approvalStatusEnum = pgEnum("approval_status", [
  "pending",
  "approved",
  "rejected",
]);

// Roles table
export const roles = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 50 }).notNull(),
    description: varchar("description", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("roles_name_unique").on(table.name),
  ]
);

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    fullName: varchar("full_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    roleId: integer("role_id")
      .notNull()
      .references(() => roles.id),

    requestedRoleId: integer("requested_role_id")
      .references(() => roles.id),

    approvalStatus: approvalStatusEnum("approval_status")
      .default("pending")
      .notNull(),

    isActive: boolean("is_active").default(true).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),

    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
  ]
);

// Sessions table
export const sessions = pgTable(
  "sessions",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    tokenHash: varchar("token_hash", { length: 64 })
      .notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }).notNull(),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("sessions_token_hash_unique").on(table.tokenHash),
  ]
);
export const projectStatusEnum = pgEnum("project_status", [
  "planning",
  "active",
  "on_hold",
  "completed",
  "cancelled",
]);

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),

  name: varchar("name", { length: 150 }).notNull(),

  description: varchar("description", { length: 1000 }),

  status: projectStatusEnum("status")
    .default("planning")
    .notNull(),

  startDate: date("start_date", { mode: "string" }),

  dueDate: date("due_date", { mode: "string" }),

  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Task status
export const taskStatusEnum = pgEnum("task_status", [
  "todo",
  "in_progress",
  "in_review",
  "completed",
]);

// Task priority
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// Tasks table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),

  title: varchar("title", { length: 150 }).notNull(),
  description: varchar("description", { length: 1000 }),

  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),

  assignedTo: integer("assigned_to")
    .notNull()
    .references(() => users.id),

  createdBy: integer("created_by")
    .notNull()
    .references(() => users.id),

  status: taskStatusEnum("status").default("todo").notNull(),

  priority: taskPriorityEnum("priority").default("medium").notNull(),

  dueDate: date("due_date", { mode: "string" }),

  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});


// Notifications table
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),

    userId: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    type: varchar("type", { length: 50 })
      .default("general")
      .notNull(),

    title: varchar("title", { length: 150 }).notNull(),

    message: varchar("message", { length: 500 }).notNull(),

    link: varchar("link", { length: 255 }),

    isRead: boolean("is_read").default(false).notNull(),

    readAt: timestamp("read_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);


export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),

  senderId: integer("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  message: varchar("message", { length: 2000 }).notNull(),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});

