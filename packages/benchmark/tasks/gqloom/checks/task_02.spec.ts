// Hidden grader test. Staged by the harness at <repo>/.clarx-bench/ and run
// from there, which is why imports resolve one directory up.
// Hidden grader test. Behaviour must be identical to before the refactor.
import { describe, expect, it } from "vitest"
import { pascalCase } from "../packages/core/src/utils/string"

describe("gqloom-02: refactor preserves behaviour", () => {
  it.each([
    ["hello-world", "HelloWorld"],
    ["hello_world", "HelloWorld"],
    ["hello world", "HelloWorld"],
    ["helloWorld", "HelloWorld"],
    ["a  b", "AB"],
    ["", ""],
  ])("pascalCase(%j) === %j", (input, expected) => {
    expect(pascalCase(input as string)).toBe(expected)
  })
})
