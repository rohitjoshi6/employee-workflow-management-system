import { describe, expect, it } from "vitest";
import { canTransitionRequest, toAuditAction } from "../src/workflow.js";

describe("workflow transitions", () => {
  it("allows pending requests to be approved, rejected, or marked needs_info", () => {
    expect(canTransitionRequest("pending", "approved")).toBe(true);
    expect(canTransitionRequest("pending", "rejected")).toBe(true);
    expect(canTransitionRequest("pending", "needs_info")).toBe(true);
  });

  it("blocks updates once a request is terminal", () => {
    expect(canTransitionRequest("approved", "rejected")).toBe(false);
    expect(canTransitionRequest("rejected", "approved")).toBe(false);
  });

  it("formats audit actions from status changes", () => {
    expect(toAuditAction("approved")).toBe("request.approved");
  });
});

