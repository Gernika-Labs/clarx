// Hidden grader test. Imports through the public entry point on purpose: the
// task requires the helper to be reachable the same way its siblings are.
import { describe, expect, it } from "vitest"
import * as core from "../../packages/core/src/index"

describe("gqloom-03: kebabCase", () => {
  it("is exported from the public entry point", () => {
    expect(typeof (core as Record<string, unknown>).kebabCase).toBe("function")
  })

  it.each([
    ["helloWorld", "hello-world"],
    ["hello_world", "hello-world"],
    ["Hello World", "hello-world"],
    ["hello-world", "hello-world"],
    ["", ""],
  ])("kebabCase(%j) === %j", (input, expected) => {
    const kebabCase = (core as unknown as { kebabCase: (s: string) => string }).kebabCase
    expect(kebabCase(input as string)).toBe(expected)
  })
})
