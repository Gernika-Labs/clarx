// Hidden grader test. Copied into the repo at grade time; never shown to the agent.
import { describe, expect, it } from "vitest"
import { pascalCase, screamingSnakeCase } from "../../packages/core/src/utils/string"

describe("gqloom-01: separator handling agrees across converters", () => {
  it("ignores leading separators in both", () => {
    expect(pascalCase("_leading")).toBe("Leading")
    expect(screamingSnakeCase("_leading")).toBe("LEADING")
  })

  it("ignores trailing separators in both", () => {
    expect(pascalCase("trailing_")).toBe("Trailing")
    expect(screamingSnakeCase("trailing_")).toBe("TRAILING")
  })

  it("leaves inner separators working as before", () => {
    expect(pascalCase("hello-world")).toBe("HelloWorld")
    expect(pascalCase("hello_world")).toBe("HelloWorld")
    expect(pascalCase("helloWorld")).toBe("HelloWorld")
    expect(screamingSnakeCase("helloWorld")).toBe("HELLO_WORLD")
    expect(screamingSnakeCase("hello world")).toBe("HELLO_WORLD")
  })

  it("still returns empty string for empty input", () => {
    expect(pascalCase("")).toBe("")
    expect(screamingSnakeCase("")).toBe("")
  })
})
