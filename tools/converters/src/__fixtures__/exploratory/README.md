# Exploratory Fixtures

These CSV files exercise edge cases and unusual inputs for the Strong, Hevy, and JEFIT parsers.

Some fixtures have explicit test assertions in `__tests__/robustness.test.ts`
and `__tests__/jefit-robustness.test.ts`. Others exist as documentation of
parser behavior — they ensure the converter doesn't crash on unusual inputs,
even without specific assertions.
