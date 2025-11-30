# Playground

Validate your JSON against openweight schemas directly in the browser.

<LiveValidator />

## How It Works

This playground uses [AJV](https://ajv.js.org/) (the same validation library used by the SDKs) to validate your JSON against the openweight schemas.

1. Select a schema type
2. Paste or type your JSON
3. See validation results in real-time

## Try These Invalid Examples

Test the validation by introducing errors:

**Missing required field:**
```json
{
  "exercises": []
}
```
(Missing `date` field)

**Weight without unit:**
```json
{
  "date": "2024-01-15T09:30:00Z",
  "exercises": [
    {
      "exercise": { "name": "Squat" },
      "sets": [{ "reps": 5, "weight": 100 }]
    }
  ]
}
```
(Has `weight` but no `unit`)
