// AUTO-GENERATED FILE - DO NOT EDIT
// Generated from schemas/ by scripts/generate-schemas.js
// Run: npm run generate:schemas

export const personalRecordsSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openweight.org/schemas/personal-records.schema.json",
  "title": "PersonalRecords",
  "description": "A collection of personal records (PRs) and one-rep maxes for strength training exercises",
  "type": "object",
  "required": [
    "exportedAt",
    "records"
  ],
  "additionalProperties": true,
  "properties": {
    "exportedAt": {
      "title": "Exported At",
      "description": "When this PR snapshot was exported in ISO 8601 format",
      "type": "string",
      "format": "date-time",
      "examples": [
        "2024-01-15T10:00:00Z"
      ]
    },
    "athlete": {
      "$ref": "#/definitions/Athlete"
    },
    "records": {
      "title": "Records",
      "description": "Array of exercise PR records",
      "type": "array",
      "items": {
        "$ref": "#/definitions/ExerciseRecord"
      }
    },
    "normalizedScores": {
      "$ref": "#/definitions/NormalizedScores"
    }
  },
  "definitions": {
    "Athlete": {
      "title": "Athlete",
      "description": "Athlete info for normalization calculations (no PII)",
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "bodyweightKg": {
          "title": "Bodyweight (kg)",
          "description": "Current/reference bodyweight in kilograms for coefficient calculation",
          "type": "number",
          "minimum": 0,
          "examples": [
            82.5,
            75,
            100
          ]
        },
        "sex": {
          "title": "Sex",
          "description": "Biological sex for coefficient calculation",
          "type": "string",
          "enum": [
            "male",
            "female",
            "mx"
          ]
        }
      }
    },
    "ExerciseRecord": {
      "title": "ExerciseRecord",
      "description": "Personal records for a single exercise",
      "type": "object",
      "required": [
        "exercise"
      ],
      "additionalProperties": true,
      "properties": {
        "exercise": {
          "$ref": "#/definitions/Exercise"
        },
        "repMaxes": {
          "title": "Rep Maxes",
          "description": "Best weight lifted at each rep count (1RM, 2RM, etc.)",
          "type": "array",
          "items": {
            "$ref": "#/definitions/RepMax"
          }
        },
        "estimated1RM": {
          "$ref": "#/definitions/Estimated1RM"
        },
        "volumePR": {
          "$ref": "#/definitions/VolumePR"
        },
        "durationPR": {
          "$ref": "#/definitions/DurationPR"
        }
      }
    },
    "Exercise": {
      "title": "Exercise",
      "description": "Describes which exercise the records are for",
      "type": "object",
      "required": [
        "name"
      ],
      "additionalProperties": true,
      "properties": {
        "name": {
          "title": "Name",
          "description": "Human-readable exercise name",
          "type": "string",
          "minLength": 1,
          "maxLength": 200,
          "examples": [
            "Barbell Back Squat",
            "Bench Press",
            "Pull-up"
          ]
        },
        "equipment": {
          "title": "Equipment",
          "description": "Equipment used. Use variants for different gear (e.g., 'barbell-wraps' vs 'barbell-raw')",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "barbell",
            "dumbbell",
            "bodyweight",
            "barbell-wraps"
          ]
        },
        "category": {
          "title": "Category",
          "description": "Body part or category",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "chest",
            "back",
            "legs"
          ]
        }
      }
    },
    "RepMax": {
      "title": "RepMax",
      "description": "Best weight lifted for a specific rep count",
      "type": "object",
      "required": [
        "reps",
        "weight",
        "unit",
        "date"
      ],
      "additionalProperties": true,
      "properties": {
        "reps": {
          "title": "Reps",
          "description": "Number of repetitions (1 for 1RM, 5 for 5RM, etc.)",
          "type": "integer",
          "minimum": 1,
          "examples": [
            1,
            3,
            5,
            10
          ]
        },
        "weight": {
          "title": "Weight",
          "description": "Weight lifted",
          "type": "number",
          "minimum": 0,
          "examples": [
            180,
            100,
            225
          ]
        },
        "unit": {
          "title": "Unit",
          "description": "Weight unit",
          "type": "string",
          "enum": [
            "kg",
            "lb"
          ]
        },
        "date": {
          "title": "Date",
          "description": "When the PR was achieved (date only for privacy)",
          "type": "string",
          "format": "date",
          "examples": [
            "2024-01-15",
            "2023-12-20"
          ]
        },
        "type": {
          "title": "Type",
          "description": "Whether this was actually tested or estimated from other lifts",
          "type": "string",
          "enum": [
            "actual",
            "estimated"
          ],
          "default": "actual"
        },
        "bodyweightKg": {
          "title": "Bodyweight (kg)",
          "description": "Bodyweight at time of PR for normalized scoring",
          "type": "number",
          "minimum": 0,
          "examples": [
            82.5,
            75
          ]
        },
        "workoutId": {
          "title": "Workout ID",
          "description": "Reference to the source workout log",
          "type": "string",
          "maxLength": 200
        },
        "rpe": {
          "title": "RPE",
          "description": "Rate of Perceived Exertion if recorded",
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "examples": [
            9,
            10,
            9.5
          ]
        },
        "notes": {
          "title": "Notes",
          "description": "Context for the PR (competition, gym PR, etc.)",
          "type": "string",
          "maxLength": 1000
        }
      }
    },
    "Estimated1RM": {
      "title": "Estimated1RM",
      "description": "Calculated one-rep max from submaximal work",
      "type": "object",
      "required": [
        "value",
        "unit",
        "formula",
        "basedOnReps",
        "basedOnWeight"
      ],
      "additionalProperties": true,
      "properties": {
        "value": {
          "title": "Value",
          "description": "Estimated 1RM value",
          "type": "number",
          "minimum": 0,
          "examples": [
            185,
            200,
            150
          ]
        },
        "unit": {
          "title": "Unit",
          "description": "Weight unit",
          "type": "string",
          "enum": [
            "kg",
            "lb"
          ]
        },
        "formula": {
          "title": "Formula",
          "description": "Formula used for calculation",
          "type": "string",
          "enum": [
            "brzycki",
            "epley",
            "lombardi",
            "mayhew",
            "oconner",
            "wathan"
          ],
          "examples": [
            "brzycki",
            "epley"
          ]
        },
        "basedOnReps": {
          "title": "Based On Reps",
          "description": "Reps from the set used for calculation",
          "type": "integer",
          "minimum": 1,
          "examples": [
            3,
            5,
            8
          ]
        },
        "basedOnWeight": {
          "title": "Based On Weight",
          "description": "Weight from the set used for calculation",
          "type": "number",
          "minimum": 0,
          "examples": [
            165,
            140,
            200
          ]
        },
        "date": {
          "title": "Date",
          "description": "When the estimate was calculated",
          "type": "string",
          "format": "date",
          "examples": [
            "2024-01-15"
          ]
        }
      }
    },
    "VolumePR": {
      "title": "VolumePR",
      "description": "Best session volume (total weight moved) for an exercise",
      "type": "object",
      "required": [
        "value",
        "unit",
        "date"
      ],
      "additionalProperties": true,
      "properties": {
        "value": {
          "title": "Value",
          "description": "Total volume (sets × reps × weight)",
          "type": "number",
          "minimum": 0,
          "examples": [
            8500,
            12000,
            5000
          ]
        },
        "unit": {
          "title": "Unit",
          "description": "Weight unit",
          "type": "string",
          "enum": [
            "kg",
            "lb"
          ]
        },
        "date": {
          "title": "Date",
          "description": "When the volume PR was achieved",
          "type": "string",
          "format": "date",
          "examples": [
            "2024-01-12"
          ]
        },
        "notes": {
          "title": "Notes",
          "description": "Details about the session",
          "type": "string",
          "maxLength": 1000,
          "examples": [
            "10x5 at 170kg",
            "5x10 at 100kg"
          ]
        }
      }
    },
    "DurationPR": {
      "title": "DurationPR",
      "description": "Best time for timed exercises (planks, carries, holds)",
      "type": "object",
      "required": [
        "seconds",
        "date"
      ],
      "additionalProperties": true,
      "properties": {
        "seconds": {
          "title": "Seconds",
          "description": "Duration in seconds",
          "type": "integer",
          "minimum": 0,
          "examples": [
            180,
            60,
            300
          ]
        },
        "date": {
          "title": "Date",
          "description": "When the duration PR was achieved",
          "type": "string",
          "format": "date",
          "examples": [
            "2024-01-08"
          ]
        },
        "weight": {
          "title": "Weight",
          "description": "Weight used if applicable (weighted plank, loaded carry)",
          "type": "number",
          "minimum": 0,
          "examples": [
            20,
            50
          ]
        },
        "unit": {
          "title": "Unit",
          "description": "Weight unit if weight is provided",
          "type": "string",
          "enum": [
            "kg",
            "lb"
          ]
        },
        "notes": {
          "title": "Notes",
          "description": "Details about the PR",
          "type": "string",
          "maxLength": 1000
        }
      }
    },
    "NormalizedScores": {
      "title": "NormalizedScores",
      "description": "Pre-calculated bodyweight-normalized scores for powerlifts",
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "squat": {
          "$ref": "#/definitions/LiftScores"
        },
        "bench": {
          "$ref": "#/definitions/LiftScores"
        },
        "deadlift": {
          "$ref": "#/definitions/LiftScores"
        },
        "total": {
          "$ref": "#/definitions/LiftScores"
        }
      }
    },
    "LiftScores": {
      "title": "LiftScores",
      "description": "Normalized scores for a single lift or total",
      "type": "object",
      "additionalProperties": true,
      "properties": {
        "wilks": {
          "title": "Wilks Score",
          "description": "Wilks coefficient score",
          "type": "number",
          "minimum": 0,
          "examples": [
            145.2,
            406.2
          ]
        },
        "dots": {
          "title": "DOTS Score",
          "description": "DOTS coefficient score",
          "type": "number",
          "minimum": 0,
          "examples": [
            148.5,
            414.6
          ]
        },
        "ipfGl": {
          "title": "IPF GL Score",
          "description": "IPF Goodlift score",
          "type": "number",
          "minimum": 0
        },
        "glossbrenner": {
          "title": "Glossbrenner Score",
          "description": "Glossbrenner coefficient score",
          "type": "number",
          "minimum": 0
        }
      }
    }
  }
} as const

export const programSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openweight.org/schemas/program.schema.json",
  "title": "Program",
  "description": "A structured training program consisting of multiple weeks of workouts",
  "type": "object",
  "required": [
    "name",
    "weeks"
  ],
  "additionalProperties": true,
  "properties": {
    "name": {
      "title": "Name",
      "description": "Name of the training program",
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "examples": [
        "Starting Strength",
        "5/3/1 BBB",
        "GZCLP"
      ]
    },
    "description": {
      "title": "Description",
      "description": "Detailed description of the program, its goals, and how to follow it",
      "type": "string",
      "maxLength": 50000
    },
    "author": {
      "title": "Author",
      "description": "Creator or source of the program",
      "type": "string",
      "maxLength": 200,
      "examples": [
        "Mark Rippetoe",
        "Jim Wendler",
        "Cody Lefever"
      ]
    },
    "tags": {
      "title": "Tags",
      "description": "Categories or labels for the program",
      "type": "array",
      "items": {
        "type": "string",
        "maxLength": 50
      },
      "examples": [
        [
          "strength",
          "beginner"
        ],
        [
          "powerlifting",
          "intermediate"
        ]
      ]
    },
    "weeks": {
      "title": "Weeks",
      "description": "The weeks that make up this program",
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/definitions/ProgramWeek"
      }
    }
  },
  "definitions": {
    "ProgramWeek": {
      "title": "ProgramWeek",
      "description": "A week of training within a program",
      "type": "object",
      "required": [
        "workouts"
      ],
      "additionalProperties": true,
      "properties": {
        "name": {
          "title": "Name",
          "description": "Name or label for this week",
          "type": "string",
          "maxLength": 200,
          "examples": [
            "Week 1",
            "Deload Week",
            "5s Week"
          ]
        },
        "notes": {
          "title": "Notes",
          "description": "Notes or instructions for this week",
          "type": "string",
          "maxLength": 10000
        },
        "workouts": {
          "title": "Workouts",
          "description": "The workout templates for this week",
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "workout-template.schema.json"
          }
        }
      }
    }
  }
} as const

export const workoutLogSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openweight.org/schemas/workout-log.schema.json",
  "title": "WorkoutLog",
  "description": "A completed strength training session",
  "type": "object",
  "required": [
    "date",
    "exercises"
  ],
  "additionalProperties": true,
  "properties": {
    "date": {
      "title": "Date",
      "description": "When the workout occurred in ISO 8601 format with timezone",
      "type": "string",
      "format": "date-time",
      "examples": [
        "2024-01-15T09:30:00Z",
        "2024-01-15T10:00:00+01:00"
      ]
    },
    "name": {
      "title": "Name",
      "description": "User-defined workout name",
      "type": "string",
      "maxLength": 200,
      "examples": [
        "Push Day",
        "Week 3 Day 1",
        "Upper Body A"
      ]
    },
    "notes": {
      "title": "Notes",
      "description": "Free-form notes about the session",
      "type": "string",
      "maxLength": 10000
    },
    "durationSeconds": {
      "title": "Duration (seconds)",
      "description": "Total workout duration in seconds",
      "type": "integer",
      "minimum": 0,
      "examples": [
        3600,
        5400
      ]
    },
    "templateId": {
      "title": "Template ID",
      "description": "Optional reference to the workout template this log was created from. App-defined identifier.",
      "type": "string",
      "maxLength": 200
    },
    "exercises": {
      "title": "Exercises",
      "description": "The exercises performed in this workout",
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/definitions/ExerciseLog"
      }
    }
  },
  "definitions": {
    "ExerciseLog": {
      "title": "ExerciseLog",
      "description": "A single exercise performed within a workout",
      "type": "object",
      "required": [
        "exercise",
        "sets"
      ],
      "additionalProperties": true,
      "properties": {
        "exercise": {
          "$ref": "#/definitions/Exercise"
        },
        "order": {
          "title": "Order",
          "description": "Position in workout (1-indexed). If omitted, array order is used.",
          "type": "integer",
          "minimum": 1
        },
        "notes": {
          "title": "Notes",
          "description": "Notes specific to this exercise",
          "type": "string",
          "maxLength": 5000
        },
        "supersetId": {
          "title": "Superset ID",
          "description": "Groups exercises into supersets. Same ID = same superset. Omit if not in a superset.",
          "type": "integer",
          "minimum": 1
        },
        "sets": {
          "title": "Sets",
          "description": "The sets performed for this exercise",
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/SetLog"
          }
        }
      }
    },
    "Exercise": {
      "title": "Exercise",
      "description": "Describes which exercise was performed",
      "type": "object",
      "required": [
        "name"
      ],
      "additionalProperties": true,
      "properties": {
        "name": {
          "title": "Name",
          "description": "Human-readable exercise name",
          "type": "string",
          "minLength": 1,
          "maxLength": 200,
          "examples": [
            "Barbell Back Squat",
            "Bench Press",
            "Pull-up"
          ]
        },
        "equipment": {
          "title": "Equipment",
          "description": "Equipment used. Recommended values: barbell, dumbbell, kettlebell, cable, machine, bodyweight, ez-bar, trap-bar, smith-machine, resistance-band, suspension",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "barbell",
            "dumbbell",
            "bodyweight"
          ]
        },
        "category": {
          "title": "Category",
          "description": "Body part or category. Recommended values: chest, back, shoulders, arms, legs, core, full-body, olympic, cardio",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "chest",
            "back",
            "legs"
          ]
        },
        "musclesWorked": {
          "title": "Muscles Worked",
          "description": "Specific muscles targeted by this exercise",
          "type": "array",
          "items": {
            "type": "string",
            "maxLength": 50
          },
          "examples": [
            [
              "pectoralis major",
              "anterior deltoid",
              "triceps"
            ]
          ]
        }
      }
    },
    "SetLog": {
      "title": "SetLog",
      "description": "A single set within an exercise",
      "type": "object",
      "additionalProperties": true,
      "allOf": [
        {
          "if": {
            "required": [
              "weight"
            ]
          },
          "then": {
            "required": [
              "unit"
            ]
          }
        },
        {
          "if": {
            "required": [
              "distance"
            ]
          },
          "then": {
            "required": [
              "distanceUnit"
            ]
          }
        }
      ],
      "properties": {
        "reps": {
          "title": "Reps",
          "description": "Repetitions completed. Omit for time-only exercises. 0 indicates a failed attempt.",
          "type": "integer",
          "minimum": 0,
          "examples": [
            5,
            8,
            12
          ]
        },
        "weight": {
          "title": "Weight",
          "description": "Weight used. Omit for bodyweight exercises.",
          "type": "number",
          "minimum": 0,
          "examples": [
            100,
            60.5,
            225
          ]
        },
        "unit": {
          "title": "Unit",
          "description": "Weight unit. Required if weight is provided.",
          "type": "string",
          "enum": [
            "kg",
            "lb"
          ]
        },
        "durationSeconds": {
          "title": "Duration (seconds)",
          "description": "Time for timed exercises (planks, carries, holds)",
          "type": "integer",
          "minimum": 0,
          "examples": [
            60,
            30,
            45
          ]
        },
        "distance": {
          "title": "Distance",
          "description": "Distance for carries, sled work, or other distance-based exercises",
          "type": "number",
          "minimum": 0,
          "examples": [
            40,
            100,
            0.5
          ]
        },
        "distanceUnit": {
          "title": "Distance Unit",
          "description": "Distance unit. Required if distance is provided.",
          "type": "string",
          "enum": [
            "m",
            "km",
            "ft",
            "mi",
            "yd"
          ]
        },
        "rpe": {
          "title": "RPE",
          "description": "Rate of Perceived Exertion on 0-10 scale. Decimals allowed (e.g., 7.5).",
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "examples": [
            7,
            8,
            8.5
          ]
        },
        "rir": {
          "title": "RIR",
          "description": "Reps In Reserve (alternative to RPE)",
          "type": "integer",
          "minimum": 0,
          "examples": [
            2,
            3,
            1
          ]
        },
        "toFailure": {
          "title": "To Failure",
          "description": "Whether the set was taken to muscular failure",
          "type": "boolean"
        },
        "type": {
          "title": "Type",
          "description": "Set type. Recommended values: working, warmup, dropset, backoff, amrap, cluster, myo, rest-pause, failure. Default assumed: working.",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "working",
            "warmup",
            "dropset"
          ]
        },
        "restSeconds": {
          "title": "Rest (seconds)",
          "description": "Rest taken after this set",
          "type": "integer",
          "minimum": 0,
          "examples": [
            90,
            180,
            60
          ]
        },
        "tempo": {
          "title": "Tempo",
          "description": "Tempo notation: eccentric-pause-concentric-pause. Use X for explosive. Example: 3-1-2-0",
          "type": "string",
          "pattern": "^[0-9X]-[0-9X]-[0-9X]-[0-9X]$",
          "examples": [
            "3-1-2-0",
            "4-0-1-0",
            "2-0-X-0"
          ]
        },
        "notes": {
          "title": "Notes",
          "description": "Notes for this specific set",
          "type": "string",
          "maxLength": 1000
        }
      }
    }
  }
} as const

export const workoutTemplateSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "$id": "https://openweight.org/schemas/workout-template.schema.json",
  "title": "WorkoutTemplate",
  "description": "A planned workout with target sets and reps",
  "type": "object",
  "required": [
    "name",
    "exercises"
  ],
  "additionalProperties": true,
  "properties": {
    "name": {
      "title": "Name",
      "description": "Name of the workout template",
      "type": "string",
      "minLength": 1,
      "maxLength": 200,
      "examples": [
        "Push Day",
        "Upper Body A",
        "Leg Day"
      ]
    },
    "notes": {
      "title": "Notes",
      "description": "Notes about the workout template",
      "type": "string",
      "maxLength": 10000
    },
    "day": {
      "title": "Day",
      "description": "Day of the week (1=Monday, 7=Sunday). Optional scheduling hint.",
      "type": "integer",
      "minimum": 1,
      "maximum": 7
    },
    "exercises": {
      "title": "Exercises",
      "description": "The exercises in this workout template",
      "type": "array",
      "minItems": 1,
      "items": {
        "$ref": "#/definitions/ExerciseTemplate"
      }
    }
  },
  "definitions": {
    "ExerciseTemplate": {
      "title": "ExerciseTemplate",
      "description": "A planned exercise with target sets",
      "type": "object",
      "required": [
        "exercise",
        "sets"
      ],
      "additionalProperties": true,
      "properties": {
        "exercise": {
          "$ref": "#/definitions/Exercise"
        },
        "order": {
          "title": "Order",
          "description": "Position in workout (1-indexed). If omitted, array order is used.",
          "type": "integer",
          "minimum": 1
        },
        "notes": {
          "title": "Notes",
          "description": "Notes specific to this exercise",
          "type": "string",
          "maxLength": 5000
        },
        "supersetId": {
          "title": "Superset ID",
          "description": "Groups exercises into supersets. Same ID = same superset.",
          "type": "integer",
          "minimum": 1
        },
        "sets": {
          "title": "Sets",
          "description": "The target sets for this exercise",
          "type": "array",
          "minItems": 1,
          "items": {
            "$ref": "#/definitions/SetTemplate"
          }
        }
      }
    },
    "Exercise": {
      "title": "Exercise",
      "description": "Describes which exercise to perform",
      "type": "object",
      "required": [
        "name"
      ],
      "additionalProperties": true,
      "properties": {
        "name": {
          "title": "Name",
          "description": "Human-readable exercise name",
          "type": "string",
          "minLength": 1,
          "maxLength": 200,
          "examples": [
            "Barbell Back Squat",
            "Bench Press",
            "Pull-up"
          ]
        },
        "equipment": {
          "title": "Equipment",
          "description": "Equipment used",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "barbell",
            "dumbbell",
            "bodyweight"
          ]
        },
        "category": {
          "title": "Category",
          "description": "Body part or category",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "chest",
            "back",
            "legs"
          ]
        },
        "musclesWorked": {
          "title": "Muscles Worked",
          "description": "Specific muscles targeted by this exercise",
          "type": "array",
          "items": {
            "type": "string",
            "maxLength": 50
          }
        }
      }
    },
    "SetTemplate": {
      "title": "SetTemplate",
      "description": "A target set with prescribed reps, weight, and intensity",
      "type": "object",
      "additionalProperties": true,
      "allOf": [
        {
          "if": {
            "required": [
              "targetWeight"
            ]
          },
          "then": {
            "required": [
              "unit"
            ]
          }
        },
        {
          "if": {
            "required": [
              "percentage"
            ]
          },
          "then": {
            "required": [
              "percentageOf"
            ]
          }
        }
      ],
      "properties": {
        "targetReps": {
          "title": "Target Reps",
          "description": "Exact number of reps to perform",
          "type": "integer",
          "minimum": 0,
          "examples": [
            5,
            8,
            12
          ]
        },
        "targetRepsMin": {
          "title": "Target Reps (Min)",
          "description": "Minimum reps in a rep range",
          "type": "integer",
          "minimum": 0,
          "examples": [
            8,
            10
          ]
        },
        "targetRepsMax": {
          "title": "Target Reps (Max)",
          "description": "Maximum reps in a rep range",
          "type": "integer",
          "minimum": 0,
          "examples": [
            12,
            15
          ]
        },
        "targetWeight": {
          "title": "Target Weight",
          "description": "Absolute weight to use",
          "type": "number",
          "minimum": 0,
          "examples": [
            100,
            60.5,
            225
          ]
        },
        "unit": {
          "title": "Unit",
          "description": "Weight unit. Required if targetWeight is provided.",
          "type": "string",
          "enum": [
            "kg",
            "lb"
          ]
        },
        "percentage": {
          "title": "Percentage",
          "description": "Percentage of a reference weight (e.g., 80% of 1RM)",
          "type": "number",
          "minimum": 0,
          "maximum": 200,
          "examples": [
            80,
            70,
            90
          ]
        },
        "percentageOf": {
          "title": "Percentage Of",
          "description": "Reference for percentage (e.g., '1RM', '5RM')",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "1RM",
            "5RM",
            "10RM"
          ]
        },
        "targetRPE": {
          "title": "Target RPE",
          "description": "Target Rate of Perceived Exertion (0-10)",
          "type": "number",
          "minimum": 0,
          "maximum": 10,
          "examples": [
            7,
            8,
            9
          ]
        },
        "targetRIR": {
          "title": "Target RIR",
          "description": "Target Reps In Reserve",
          "type": "integer",
          "minimum": 0,
          "examples": [
            2,
            3,
            1
          ]
        },
        "restSeconds": {
          "title": "Rest (seconds)",
          "description": "Recommended rest after this set",
          "type": "integer",
          "minimum": 0,
          "examples": [
            90,
            180,
            60
          ]
        },
        "tempo": {
          "title": "Tempo",
          "description": "Tempo notation: eccentric-pause-concentric-pause",
          "type": "string",
          "pattern": "^[0-9X]-[0-9X]-[0-9X]-[0-9X]$",
          "examples": [
            "3-1-2-0",
            "4-0-1-0",
            "2-0-X-0"
          ]
        },
        "type": {
          "title": "Type",
          "description": "Set type (working, warmup, dropset, etc.)",
          "type": "string",
          "maxLength": 50,
          "examples": [
            "working",
            "warmup",
            "dropset"
          ]
        },
        "notes": {
          "title": "Notes",
          "description": "Notes for this set",
          "type": "string",
          "maxLength": 1000
        }
      }
    }
  }
} as const
