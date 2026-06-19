import { describe, expect, it } from "vitest";
import { statusLabel } from "./StatusBadge";

describe("statusLabel", () => {
  it("converts workflow statuses to readable labels", () => {
    expect(statusLabel("pending")).toBe("Pending");
    expect(statusLabel("needs_info")).toBe("Needs info");
    expect(statusLabel("approved")).toBe("Approved");
  });
});

