# Personal Records Examples

Browse example personal records exports from simple to comprehensive.

## minimal.json

The smallest valid personal records file — just an export timestamp and one exercise with one rep max.

```json
{
  "exportedAt": "2024-01-15T10:00:00Z",
  "records": [
    {
      "exercise": {
        "name": "Barbell Back Squat"
      },
      "repMaxes": [
        {
          "reps": 1,
          "weight": 180,
          "unit": "kg",
          "date": "2024-01-10"
        }
      ]
    }
  ]
}
```

## full-featured.json

A comprehensive personal records export with multiple exercises, rep maxes, estimated 1RMs, volume PRs, duration PRs, and normalized scores.

```json
{
  "exportedAt": "2024-01-15T10:00:00Z",
  "athlete": {
    "bodyweightKg": 82.5,
    "sex": "male"
  },
  "records": [
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell",
        "category": "legs"
      },
      "repMaxes": [
        {
          "reps": 1,
          "weight": 180,
          "unit": "kg",
          "date": "2024-01-10",
          "type": "actual",
          "bodyweightKg": 82.5,
          "rpe": 10,
          "notes": "Competition PR"
        },
        {
          "reps": 3,
          "weight": 165,
          "unit": "kg",
          "date": "2024-01-05",
          "type": "actual"
        },
        {
          "reps": 5,
          "weight": 155,
          "unit": "kg",
          "date": "2023-12-20",
          "type": "actual",
          "workoutId": "workout-123"
        }
      ],
      "estimated1RM": {
        "value": 185,
        "unit": "kg",
        "formula": "brzycki",
        "basedOnReps": 3,
        "basedOnWeight": 165,
        "date": "2024-01-05"
      },
      "volumePR": {
        "value": 8500,
        "unit": "kg",
        "date": "2024-01-12",
        "notes": "10x5 at 170kg"
      }
    },
    {
      "exercise": {
        "name": "Bench Press",
        "equipment": "barbell",
        "category": "chest"
      },
      "repMaxes": [
        {
          "reps": 1,
          "weight": 120,
          "unit": "kg",
          "date": "2024-01-08",
          "type": "actual"
        },
        {
          "reps": 5,
          "weight": 100,
          "unit": "kg",
          "date": "2024-01-02",
          "type": "actual"
        }
      ],
      "estimated1RM": {
        "value": 116,
        "unit": "kg",
        "formula": "epley",
        "basedOnReps": 5,
        "basedOnWeight": 100
      }
    },
    {
      "exercise": {
        "name": "Plank",
        "equipment": "bodyweight",
        "category": "core"
      },
      "durationPR": {
        "seconds": 180,
        "date": "2024-01-08"
      }
    },
    {
      "exercise": {
        "name": "Weighted Plank",
        "equipment": "bodyweight",
        "category": "core"
      },
      "durationPR": {
        "seconds": 60,
        "date": "2024-01-10",
        "weight": 20,
        "unit": "kg",
        "notes": "Plate on back"
      }
    }
  ],
  "normalizedScores": {
    "squat": {
      "wilks": 145.2,
      "dots": 148.5
    },
    "bench": {
      "wilks": 98.3,
      "dots": 100.1
    },
    "deadlift": {
      "wilks": 162.7,
      "dots": 166.0
    },
    "total": {
      "wilks": 406.2,
      "dots": 414.6,
      "ipfGl": 420.5
    }
  }
}
```

## imperial-units.json

Personal records using pounds instead of kilograms.

```json
{
  "exportedAt": "2024-01-15T10:00:00Z",
  "athlete": {
    "bodyweightKg": 90.7,
    "sex": "male"
  },
  "records": [
    {
      "exercise": {
        "name": "Barbell Back Squat",
        "equipment": "barbell"
      },
      "repMaxes": [
        {
          "reps": 1,
          "weight": 405,
          "unit": "lb",
          "date": "2024-01-10",
          "type": "actual"
        },
        {
          "reps": 5,
          "weight": 315,
          "unit": "lb",
          "date": "2024-01-05"
        }
      ]
    },
    {
      "exercise": {
        "name": "Bench Press",
        "equipment": "barbell"
      },
      "repMaxes": [
        {
          "reps": 1,
          "weight": 275,
          "unit": "lb",
          "date": "2024-01-08"
        }
      ]
    }
  ]
}
```

## Key Features Demonstrated

### Rep Maxes (repMaxes)

Track your best weight at different rep counts:
- **1RM**: Your true one-rep max
- **3RM, 5RM, etc.**: Best weight for rep ranges
- **type**: `"actual"` (tested) vs `"estimated"` (calculated)

### Estimated 1RM (estimated1RM)

Calculate your theoretical max from submaximal work:
- **formula**: `brzycki`, `epley`, `lombardi`, `mayhew`, `oconner`, `wathan`
- Includes the source reps/weight used for calculation

### Volume PR (volumePR)

Best total volume achieved in a single session:
- `value`: Total work (sets × reps × weight)
- Useful for hypertrophy tracking

### Duration PR (durationPR)

Best time for timed exercises:
- Planks, dead hangs, carries
- Optional weight for weighted variations

### Normalized Scores

Bodyweight-adjusted scores for powerlifting:
- **Wilks**: Classic powerlifting coefficient
- **DOTS**: Modern replacement for Wilks
- **IPF GL**: International Powerlifting Federation scoring

## More Examples

See all personal records examples in the [GitHub repository](https://github.com/radupana/openweight/tree/main/examples/personal-records).
