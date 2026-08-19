// Hidden grader test. Staged by the harness at <repo>/.clarx-bench/ and run
// from there, which is why imports resolve one directory up.
// Hidden grader test. Checks the helper exists and is correct; the requirement
// that call sites actually use it is enforced by the unchanged-output tests in
// the repo's own suite, which the task requires to keep passing.
import { describe, expect, it } from "vitest"
import * as core from "../packages/core/src/index"

type Joiner = (...parts: string[]) => string

function joiner(): Joiner {
  const found = Object.entries(core as Record<string, unknown>).find(
    ([name, value]) =>
      typeof value === "function" &&
      /pascal/i.test(name) &&
      name.toLowerCase() !== "pascalcase",
  )
  if (!found) throw new Error("no shared PascalCase-joining helper exported from the entry point")
  return found[1] as Joiner
}

describe("gqloom-04: shared compound-name helper", () => {
  it("is exported from the public entry point", () => {
    expect(() => joiner()).not.toThrow()
  })

  it("joins fragments as PascalCase", () => {
    const join = joiner()
    expect(join("user", "name")).toBe("UserName")
    expect(join("user_account", "created-at")).toBe("UserAccountCreatedAt")
    expect(join("single")).toBe("Single")
  })
})
