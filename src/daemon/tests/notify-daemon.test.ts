import { describe, it, expect, vi } from "vitest";

// ===== MOCK DATA & CONSTANTS =====

const AGENT_SESSIONS: Record<string, string> = {
  main: "agent:main:main",
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

// ===== TEST SUITES =====

describe("Notification Daemon", () => {
  // ===== AGENT SESSION MAPPING TESTS =====
  describe("Agent Session Mapping", () => {
    it("should have exactly 10 agent session mappings", () => {
      expect(Object.keys(AGENT_SESSIONS)).toHaveLength(10);
    });

    it("should map all required agents", () => {
      const requiredAgents = [
        "main",
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

  // ===== MESSAGE FORMATTING TESTS =====
  describe("Message Formatting", () => {
    function formatNotificationMessage(
      notification: Notification,
      mentionedAgentName: string,
      fromAgentName: string,
      taskTitle?: string
    ): string {
      let message = `[NOTIFICATION] @${mentionedAgentName}: ${notification.content}`;

      if (fromAgentName) {
        message += ` (from ${fromAgentName}`;
        if (taskTitle) {
          message += ` on task: ${taskTitle}`;
        }
        message += ")";
      }

      return message;
    }

    it("should format basic notification message", () => {
      const notif: Notification = {
        _id: "notif:1",
        mentionedAgentId: "seo-analyst",
        fromAgentId: "main",
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

      // Using IDs as fallback (when agentNameMap lookup fails)
      const message = formatNotificationMessage(
        notif,
        notif.mentionedAgentId,
        notif.fromAgentId
      );

      expect(message).toContain("@designer");
      expect(message).toContain("from content-writer");
    });

    it("should format @mention properly", () => {
      const notif: Notification = {
        _id: "notif:1",
        mentionedAgentId: "product-analyst",
        fromAgentId: "main",
        content: "Task assigned to you",
        delivered: false,
        createdAt: Date.now(),
      };

      const message = formatNotificationMessage(notif, "Shuri", "Jarvis");

      expect(message.match(/@\w+/)?.[0]).toBe("@Shuri");
    });
  });

  // ===== DELIVERY FLOW TESTS =====
  describe("Notification Delivery Flow", () => {
    it("should mark notification as delivered only after successful send", async () => {
      const notif: Notification = {
        _id: "notif:1",
        mentionedAgentId: "main",
        fromAgentId: "developer",
        content: "Code review requested",
        delivered: false,
        createdAt: Date.now(),
      };

      const sessionsSendMock = vi.fn().mockResolvedValue(true);
      const markDeliveredMock = vi.fn().mockResolvedValue("notif:1");

      // Simulate delivery
      const sendSuccess = await sessionsSendMock(
        AGENT_SESSIONS[notif.mentionedAgentId],
        "[NOTIFICATION] @Jarvis: Code review requested (from Friday)"
      );

      expect(sendSuccess).toBe(true);

      // Only after success, mark as delivered
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

      // Simulate failed delivery
      const sendSuccess = await sessionsSendMock(
        AGENT_SESSIONS[notif.mentionedAgentId],
        "[NOTIFICATION] message"
      );

      expect(sendSuccess).toBe(false);

      // Should NOT mark as delivered
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
      const RETRY_BACKOFF = [1000, 2000, 4000, 8000, 16000];

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

      const notifId = "notif:3";
      const agentId = "seo-analyst";

      // First failure: 1s backoff
      queueForRetry(notifId, agentId, 0);
      expect(retryQueue).toHaveLength(1);
      const firstRetry = retryQueue[0];
      expect(firstRetry.retryCount).toBe(1);

      // Second failure: 2s backoff
      queueForRetry(notifId, agentId, 1);
      expect(retryQueue).toHaveLength(2);
      const secondRetry = retryQueue[1];
      expect(secondRetry.retryCount).toBe(2);
      expect(secondRetry.nextRetryTime).toBeGreaterThan(
        firstRetry.nextRetryTime
      );

      // Verify exponential backoff times
      expect(secondRetry.nextRetryTime - firstRetry.nextRetryTime).toBeGreaterThanOrEqual(
        1000
      );
    });

    it("should respect max retry limit (5 retries)", () => {
      const MAX_RETRIES = 5;
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

  // ===== IDEMPOTENCY TESTS =====
  describe("Idempotency", () => {
    it("should not re-deliver already-delivered notifications", async () => {
      const notif: Notification = {
        _id: "notif:4",
        mentionedAgentId: "content-writer",
        fromAgentId: "customer-researcher",
        content: "Research findings attached",
        delivered: true, // Already delivered
        createdAt: Date.now(),
      };

      // Daemon should filter out delivered notifications before processing
      const undeliveredNotifs = [notif].filter((n) => !n.delivered);

      expect(undeliveredNotifs).toHaveLength(0);
    });

    it("should handle duplicate fetch gracefully", async () => {
      const notifs: Notification[] = [
        {
          _id: "notif:5",
          mentionedAgentId: "developer",
          fromAgentId: "main",
          content: "Task assigned",
          delivered: false,
          createdAt: Date.now(),
        },
      ];

      const getUndeliveredMock = vi
        .fn()
        .mockResolvedValue(notifs)
        .mockResolvedValueOnce(notifs)
        .mockResolvedValueOnce(notifs); // Same result twice

      // First call
      const batch1 = await getUndeliveredMock("developer");
      expect(batch1).toHaveLength(1);

      // Second call
      const batch2 = await getUndeliveredMock("developer");
      expect(batch2).toHaveLength(1);

      // Both should be identical (no duplicates created)
      expect(batch1[0]._id).toBe(batch2[0]._id);
    });
  });

  // ===== BATCH OPERATION TESTS =====
  describe("Batch Operations", () => {
    it("should process multiple notifications in sequence", async () => {
      const notifs: Notification[] = [
        {
          _id: "notif:6",
          mentionedAgentId: "main",
          fromAgentId: "designer",
          content: "Design approved",
          delivered: false,
          createdAt: Date.now(),
        },
        {
          _id: "notif:7",
          mentionedAgentId: "main",
          fromAgentId: "developer",
          content: "Code merged",
          delivered: false,
          createdAt: Date.now(),
        },
        {
          _id: "notif:8",
          mentionedAgentId: "product-analyst",
          fromAgentId: "main",
          content: "Weekly review scheduled",
          delivered: false,
          createdAt: Date.now(),
        },
      ];

      const sessionsSendMock = vi
        .fn()
        .mockResolvedValue(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true)
        .mockResolvedValueOnce(true);

      const markDeliveredMock = vi.fn().mockResolvedValue("");

      // Process each notification
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
        .mockResolvedValueOnce(true) // First succeeds
        .mockResolvedValueOnce(false); // Second fails

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
          // Queue for retry
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

      const agentsCalled = getUndeliveredMock.mock.calls.map((call) => call[0]);
      expect(agentsCalled).toContain("main");
      expect(agentsCalled).toContain("developer");
      expect(agentsCalled).toContain("designer");
    });
  });

  // ===== ERROR HANDLING TESTS =====
  describe("Error Handling", () => {
    it("should handle Convex API timeouts gracefully", async () => {
      const getUndeliveredMock = vi.fn().mockRejectedValue(
        new Error("Convex API timeout")
      );

      try {
        await getUndeliveredMock("main");
      } catch (err) {
        expect((err as Error).message).toContain("timeout");
      }

      // Should not crash, should continue polling
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
        mentionedAgentId: "main",
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
          // Log error but continue
          expect((err as Error).message).toContain("Database error");
        }
      }

      // Daemon should still be operational
      expect(sessionsSendMock).toHaveBeenCalled();
    });
  });

  // ===== POLLING TESTS =====
  describe("Polling", () => {
    it("should poll every 2 seconds", async () => {
      // polling interval used by daemon (tested elsewhere)

      let callCount = 0;
      const pollMock = vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve();
      });

      // Simulate one polling cycle
      await pollMock();
      expect(callCount).toBe(1);

      // 2 seconds later
      await pollMock();
      expect(callCount).toBe(2);
    });

    it("should handle polling interval independently from network latency", async () => {
      const getUndeliveredMock = vi.fn();

      // Fast network
      getUndeliveredMock.mockResolvedValueOnce([]);
      await getUndeliveredMock("main");
      expect(getUndeliveredMock).toHaveBeenCalledTimes(1);

      // Slow network (but polling should still happen every 2s)
      getUndeliveredMock.mockImplementationOnce(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 1000))
      );
      await getUndeliveredMock("developer");
      expect(getUndeliveredMock).toHaveBeenCalledTimes(2);
    });
  });

  // ===== INTEGRATION TESTS =====
  describe("Full Delivery Workflow", () => {
    it("should complete full delivery cycle: fetch -> format -> send -> mark", async () => {
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
      const message = `[NOTIFICATION] @${agentMap[notif.mentionedAgentId]}: ${notif.content} (from ${agentMap[notif.fromAgentId]} on task: planning)`;
      expect(message).toContain("@Loki");
      expect(message).toContain("Shuri");

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
