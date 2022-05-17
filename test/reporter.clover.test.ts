import { checkSnapshot, checkOutputSnapshot } from "./util";

import { Unicov } from "../src";

describe("CloverReporter", () => {
  const now = Date.now;
  afterEach(() => {
    Date.now = now;
  });

  test("Parsing", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/clover-coverage.xml",
      "clover"
    );
    checkSnapshot(unicov, "common-clover-coverage");
  });

  test("Test invalid clover coverage file.", async () => {
    await expect(
      Unicov.fromCoverage(
        "./test/fixtures/invalid-cobertura-coverage.xml",
        "clover"
      )
    ).rejects.toThrow("Invalid clover coverage reporter");
  });

  test("Formatting", async () => {
    const unicov = await Unicov.fromCoverage(
      "./test/fixtures/lcov.info",
      "lcov",
      { caseInsensitive: true }
    );
    Date.now = () => 1651974519992;
    await checkOutputSnapshot(unicov, "clover", "clover-output.xml");
  });
});
