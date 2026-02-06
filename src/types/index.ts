// Agent types
export type AgentLevel = "lead" | "specialist" | "intern";
export type AgentStatus = "idle" | "working" | "blocked";

export interface Agent {
  _id: string;
  agentId: string;
  name: string;
  role: string;
  level: AgentLevel;
  status: AgentStatus;
  currentTaskId?: string;
  sessionKey: string;
  lastHeartbeat: number;
  emoji: string;
}

// Task types
export type TaskStatus =
  | "inbox"
  | "assigned"
  | "in_progress"
  | "review"
  | "done"
  | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeIds: string[];
  subscriberIds: string[];
  createdBy: string;
  tags: string[];
  createdAt: number;
  updatedAt: number;
}

// Message types
export interface Message {
  _id: string;
  taskId: string;
  fromAgentId: string;
  content: string;
  attachmentIds?: string[];
  mentions?: string[];
  createdAt: number;
}

// Document types
export type DocumentType =
  | "deliverable"
  | "research"
  | "protocol"
  | "analysis"
  | "draft";

export interface Document {
  _id: string;
  title: string;
  content: string;
  type: DocumentType;
  taskId?: string;
  createdBy: string;
  createdAt: number;
  updatedAt: number;
}

// Activity types
export interface Activity {
  _id: string;
  type: string;
  agentId: string;
  message: string;
  taskId?: string;
  documentId?: string;
  createdAt: number;
}

// Notification types
export interface Notification {
  _id: string;
  mentionedAgentId: string;
  fromAgentId: string;
  content: string;
  taskId?: string;
  delivered: boolean;
  createdAt: number;
}
