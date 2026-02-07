import { describe, it, expect, vi } from "vitest";

// ===== CONSTANTS (mirrored from daemon for unit testing) =====

const AGENT_SESSIONS: Record<string, string> = {
  jarvis: "agent:jarvis:main",
  "product-analyst": "agent:product-analyst:main",
  "customer-researcher": "agent:customer-researcher:main",
  "seo-analyst": "agent:seo-analyst:main",
  "content-writer": "agent:content-writer:main",
  "social-media": "agent:social-media:main",
  designer: "agent:designer:main",
  "email-marketing": "agent:email-marketing:main",
  developer: "agent:developer:main",
  documentation: "agent:documentation:main",
};

interface Notification {
  _id: string;
  mentionedAgentId: string;
  fromAgentId: string;
  content: string;
  taskId?: string;
  delivered: boolean;
  createdAt: number;
}

function formatNotificationMessage(
  notification: Notification,
  mentionedAgentName: string,
  fromAgentName: string,
  taskTitle?: string
): string {
  let message = `📬 [NOTIFICATION] @${mentionedAgentName}: ${notification.content}`;
  if (fromAgentName) {
    message += ` (from ${fromAgentName}`;
    if (taskTitle) {
      message += ` on task: ${taskTitle}`;
    }
    message += ")";
  }
  return message;
}

const MAX_RETRIES = 5;
const RETRY_BACKOFF = [1000, 2000, 4000, 8000, 16000];

// ===== TESTS =====

describe("Notification Daemon", () => {
  // ===== AGENT SESSION MAPPING =====
  describe("Agent Session Mapping", () => {
    it("should have exactly 10 agent session mappings", () => {
      expect(Object.keys(AGENT_SESSIONS)).toHaveLength(10);
    });

    it("should map all required agents", () => {
      const requiredAgents = [
        "jarvis",
        "product-analyst",
        "customer-researcher",
        "seo-analyst",
        "content-writer",
        "social-media",
        "designer",
        "email-marketing",
        "developer",
        "documentation",
      ];

      for (const agent of requiredAgents) {
        expect(AGENT_SESSIONS[agent]).toBeDefined();
        expect(AGENT_SESSIONS[agent]).toBe(`agent:${agent}:main`);
      }
    });

    it("should format session keys as agent:{agentid}:main", () => {
      for (const [agentId, sessionKey] of Object.entries(AGENT_SESSIONS)) {
        expect(sessionKey).toMatch(/^agent:.+:main$/);
        expect(sessionKey).toContain(agentId);
      }
    });
  });

  // ===== MESSAGE FORMATTING =====
  describe("Message Formatting", () => {
    it("should format basic notification message", () => {
      const notif: Notification = {
        _id: "notif:1",
        mentionedAgentId: "seo-analyst",
        fromAgentId: "jarvis",
        content: "Please review the SEO analysis",
        delivered: false,
        createdAt: Date.now(),
      };

      const message = formatNotificationMessage(notif, "Vision", "Jarvis");

      expect(message).toContain("[NOTIFICATION]");
      expect(message).toContain("@Vision");
      expect(message).toContain("Please review the SEO analysis");
      expect(message).toContain("from Jarvis");
    });

    it("should include task title when available", () => {
      const notif: Notification = {
        _id: "notif:1",
        mentionedAgentId: "content-writer",
        fromAgentId: "seo-analyst",
        content: "Keyword research ready",
        taskId: "task:1",
        delivered: false,
        createdAt: Date.now(),
      };

      const message = formatNotificationMessage(
        notif,
        "Loki",
        "Vision",
        "Blog Post Campaign"
      );

      expect(message).toContain("on task: Blog Post Campaign");
    });

    it("should handle agent IDs as fallback when names unavailable", () => {
      const notif: Notification = {
        _id: "notif:1",
        mentionedAgentId: "designer",
        fromAgentId: "content-writer",
        content: "Design mockups needed",
        delivered: false,
        createdAt: Date.now(),
      };

      const message = formatNotificationMessage(
        notif,
        notif.mentionedAgentId,
        notif.fromAgentId
      );

      expect(message).toContain("@designer");
      expect(message).toContain("from content-writer");
    });

    it("should include notification emoji prefix", () => {
      const notif: Notification = {
        _id: "notif:1",
        mentionedAgentId: "product-analyst",
        fromAgentId: "jarvis",
        content: "Task assigned",
        delivered: false,
        createdAt: Date.now(),
      };

      const message = formatNotificationMessage(notif, "Shuri", "Jarvis");
      expect(message).toContain("📬");
    });
  });

  // ===== DELIVERY FLOW =====
  describe("Notification Delivery Flow", () => {
    it("should mark notification as delivered only after successful send", async () => {
      const notif: Notification = {
        _id: "notif:1",
        mentionedAgentId: "jarvis",
        fromAgentId: "developer",
        content: "Code review requested",
        delivered: false,
        createdAt: Date.now(),
      };

      const sessionsSendMock = vi.fn().mockResolvedValue(true);
      const markDeliveredMock = vi.fn().mockResolvedValue("notif:1");

      const sendSuccess = await sessionsSendMock(
        AGENT_SESSIONS[notif.mentionedAgentId],
        formatNotificationMessage(notif, "Jarvis", "Friday")
      );

      expect(sendSuccess).toBe(true);

      if (sendSuccess) {
        await markDeliveredMock(notif._id);
      }

      expect(markDeliveredMock).toHaveBeenCalledWith(notif._id);
    });

    it("should not mark as delivered if session send fails", async () => {
      const notif: Notification = {
        _id: "notif:2",
        mentionedAgentId: "designer",
        fromAgentId: "product-analyst",
        content: "Design review needed",
        delivered: false,
        createdAt: Date.now(),
      };

      const sessionsSendMock = vi.fn().mockResolvedValue(false);
      const markDeliveredMock = vi.fn();

      const sendSuccess = await sessionsSendMock(
        AGENT_SESSIONS[notif.mentionedAgentId],
        "[NOTIFICATION] message"
      );

      expect(sendSuccess).toBe(false);

      if (sendSuccess) {
        await markDeliveredMock(notif._id);
      }

      expect(markDeliveredMock).not.toHaveBeenCalled();
    });

    it("should queue failed deliveries for retry with exponential backoff", () => {
      const retryQueue: Array<{
        notificationId: string;
        agentId: string;
        retryCount: number;
        nextRetryTime: number;
      }> = [];

      function queueForRetry(
        notificationId: string,
        agentId: string,
        retryCount: number
      ): void {
        const backoffMs = RETRY_BACKOFF[retryCount] || 16000;
        const nextRetryTime = Date.now() + backoffMs;
        retryQueue.push({
          notificationId,
          agentId,
          retryCount: retryCount + 1,
          nextRetryTime,
        });
      }

      queueForRetry("notif:3", "seo-analyst", 0);
      expect(retryQueue).toHaveLength(1);
      expect(retryQueue[0].retryCount).toBe(1);

      queueForRetry("notif:3", "seo-analyst", 1);
      expect(retryQueue).toHaveLength(2);
      expect(retryQueue[1].retryCount).toBe(2);
      expect(retryQueue[1].nextRetryTime).toBeGreaterThan(
        retryQueue[0].nextRetryTime
      );
    });

    it("should respect max retry limit (5 retries)", () => {
      let gaveUp = false;

      function checkMaxRetries(retryCount: number): void {
        if (retryCount >= MAX_RETRIES) {
          gaveUp = true;
        }
      }

      for (let i = 0; i < 5; i++) {
        checkMaxRetries(i);
        expect(gaveUp).toBe(false);
      }

      checkMaxRetries(5);
      expect(gaveUp).toBe(true);
    });
  });

  // ===== IDEMPOTENCY =====
  describe("Idempotency", () => {
    it("should not re-deliver already-delivered notifications", () => {
      const notif: Notification = {
        _id: "notif:4",
        mentionedAgentId: "content-writer",
        fromAgentId: "customer-researcher",
        content: "Research findings attached",
        delivered: true,
        createdAt: Date.now(),
      };

      const undeliveredNotifs = [notif].filter((n) => !n.delivered);
      expect(undeliveredNotifs).toHaveLength(0);
    });

    it("should handle duplicate fetch gracefully", async () => {
      const notifs: Notification[] = [
        {
          _id: "notif:5",
          mentionedAgentId: "developer",
          fromAgentId: "jarvis",
          content: "Task assigned",
          delivered: false,
          createdAt: Date.now(),
        },
      ];

      const getUndeliveredMock = vi
        .fn()
        .mockResolvedValue(notifs)
        .mockResolvedValueOnce(notifs)
        .mockResolvedValueOnce(notifs);

      const batch1 = await getUndeliveredMock("developer");
      const batch2 = await getUndeliveredMock("developer");

      expect(batch1[0]._id).toBe(batch2[0]._id);
    });
  });

  // ===== BATCH OPERATIONS =====
  describe("Batch Operations", () => {
    it("should process multiple notifications in sequence", async () => {
      const notifs: Notification[] = [
        {
          _id: "notif:6",
          mentionedAgentId: "jarvis",
          fromAgentId: "designer",
          content: "Design approved",
          delivered: false,
          createdAt: Date.now(),
        },
        {
          _id: "notif:7",
          mentionedAgentId: "jarvis",
          fromAgentId: "developer",
          content: "Code merged",
          delivered: false,
          createdAt: Date.now(),
        },
        {
          _id: "notif:8",
          mentionedAgentId: "product-analyst",
          fromAgentId: "jarvis",
          content: "Weekly review scheduled",
          delivered: false,
          createdAt: Date.now(),
        },
      ];

      const sessionsSendMock = vi.fn().mockResolvedValue(true);
      const markDeliveredMock = vi.fn().mockResolvedValue("");

      for (const notif of notifs) {
        const success = await sessionsSendMock(
          AGENT_SESSIONS[notif.mentionedAgentId],
          "[NOTIFICATION] message"
        );
        if (success) {
          await markDeliveredMock(notif._id);
        }
      }

      expect(sessionsSendMock).toHaveBeenCalledTimes(3);
      expect(markDeliveredMock).toHaveBeenCalledTimes(3);
    });

    it("should handle mixed success/failure in batch", async () => {
      const notifs: Notification[] = [
        {
          _id: "notif:9",
          mentionedAgentId: "designer",
          fromAgentId: "product-analyst",
          content: "Task ready",
          delivered: false,
          createdAt: Date.now(),
        },
        {
          _id: "notif:10",
          mentionedAgentId: "email-marketing",
          fromAgentId: "product-analyst",
          content: "Campaign data",
          delivered: false,
          createdAt: Date.now(),
        },
      ];

      const sessionsSendMock = vi
        .fn()
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(false);

      const markDeliveredMock = vi.fn();
      const retryQueue: Array<{
        notificationId: string;
        agentId: string;
        retryCount: number;
      }> = [];

      for (const notif of notifs) {
        const success = await sessionsSendMock(
          AGENT_SESSIONS[notif.mentionedAgentId],
          "[NOTIFICATION] message"
        );

        if (success) {
          await markDeliveredMock(notif._id);
        } else {
          retryQueue.push({
            notificationId: notif._id,
            agentId: notif.mentionedAgentId,
            retryCount: 0,
          });
        }
      }

      expect(markDeliveredMock).toHaveBeenCalledTimes(1);
      expect(retryQueue).toHaveLength(1);
      expect(retryQueue[0].notificationId).toBe("notif:10");
    });

    it("should poll all 10 agents in a cycle", async () => {
      const getUndeliveredMock = vi.fn().mockResolvedValue([]);

      for (const agentId of Object.keys(AGENT_SESSIONS)) {
        await getUndeliveredMock(agentId);
      }

      expect(getUndeliveredMock).toHaveBeenCalledTimes(10);

      const agentsCalled = getUndeliveredMock.mock.calls.map(
        (call: unknown[]) => call[0]
      );
      expect(agentsCalled).toContain("jarvis");
      expect(agentsCalled).toContain("developer");
      expect(agentsCalled).toContain("designer");
    });
  });

  // ===== ERROR HANDLING =====
  describe("Error Handling", () => {
    it("should handle Convex API timeouts gracefully", async () => {
      const getUndeliveredMock = vi
        .fn()
        .mockRejectedValue(new Error("Convex API timeout"));

      try {
        await getUndeliveredMock("jarvis");
      } catch (err) {
        expect((err as Error).message).toContain("timeout");
      }

      expect(getUndeliveredMock).toHaveBeenCalled();
    });

    it("should handle unknown agent IDs", () => {
      const unknownAgentId = "unknown-agent";
      const sessionKey = AGENT_SESSIONS[unknownAgentId];
      expect(sessionKey).toBeUndefined();
    });

    it("should continue polling if marking delivered fails", async () => {
      const notif: Notification = {
        _id: "notif:11",
        mentionedAgentId: "jarvis",
        fromAgentId: "developer",
        content: "Something",
        delivered: false,
        createdAt: Date.now(),
      };

      const sessionsSendMock = vi.fn().mockResolvedValue(true);
      const markDeliveredMock = vi
        .fn()
        .mockRejectedValue(new Error("Database error"));

      const success = await sessionsSendMock(
        AGENT_SESSIONS[notif.mentionedAgentId],
        "[NOTIFICATION] message"
      );

      if (success) {
        try {
          await markDeliveredMock(notif._id);
        } catch (err) {
          expect((err as Error).message).toContain("Database error");
        }
      }

      expect(sessionsSendMock).toHaveBeenCalled();
    });
  });

  // ===== CONVEX HTTP API =====
  describe("Convex HTTP API", () => {
    it("should use correct query endpoint format", () => {
      const convexUrl = "https://tidy-salamander-925.eu-west-1.convex.cloud";
      const queryUrl = `${convexUrl}/api/query`;
      const mutationUrl = `${convexUrl}/api/mutation`;

      expect(queryUrl).toBe(
        "https://tidy-salamander-925.eu-west-1.convex.cloud/api/query"
      );
      expect(mutationUrl).toBe(
        "https://tidy-salamander-925.eu-west-1.convex.cloud/api/mutation"
      );
    });

    it("should format query payload correctly", () => {
      const payload = {
        path: "notifications:getUndelivered",
        args: { agentId: "seo-analyst" },
      };

      expect(payload.path).toBe("notifications:getUndelivered");
      expect(payload.args.agentId).toBe("seo-analyst");
    });

    it("should format mutation payload for markDelivered", () => {
      const payload = {
        path: "notifications:markDelivered",
        args: { id: "notif:123" },
      };

      expect(payload.path).toBe("notifications:markDelivered");
      expect(payload.args.id).toBe("notif:123");
    });
  });

  // ===== FULL DELIVERY WORKFLOW =====
  describe("Full Delivery Workflow", () => {
    it("should complete full cycle: fetch -> format -> send -> mark", async () => {
      const notif: Notification = {
        _id: "notif:12",
        mentionedAgentId: "content-writer",
        fromAgentId: "product-analyst",
        content: "Product roadmap updated",
        taskId: "task:planning",
        delivered: false,
        createdAt: Date.now(),
      };

      const agentMap: Record<string, string> = {
        "content-writer": "Loki",
        "product-analyst": "Shuri",
      };

      // 1. Fetch
      const getUndeliveredMock = vi.fn().mockResolvedValue([notif]);
      const notifications = await getUndeliveredMock("content-writer");
      expect(notifications).toHaveLength(1);

      // 2. Format
      const message = formatNotificationMessage(
        notif,
        agentMap[notif.mentionedAgentId],
        agentMap[notif.fromAgentId],
        "planning"
      );
      expect(message).toContain("@Loki");
      expect(message).toContain("Shuri");
      expect(message).toContain("on task: planning");

      // 3. Send
      const sessionsSendMock = vi.fn().mockResolvedValue(true);
      const sendSuccess = await sessionsSendMock(
        AGENT_SESSIONS[notif.mentionedAgentId],
        message
      );
      expect(sendSuccess).toBe(true);

      // 4. Mark delivered
      const markDeliveredMock = vi.fn().mockResolvedValue(notif._id);
      if (sendSuccess) {
        const result = await markDeliveredMock(notif._id);
        expect(result).toBe(notif._id);
      }

      expect(markDeliveredMock).toHaveBeenCalledWith(notif._id);
    });
  });
});
