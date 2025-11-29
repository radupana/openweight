export const workoutLogSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://openweight.org/schemas/workout-log.schema.json',
  title: 'WorkoutLog',
  description: 'A completed strength training session',
  type: 'object',
  required: ['date', 'exercises'],
  additionalProperties: true,
  properties: {
    date: {
      title: 'Date',
      description: 'When the workout occurred in ISO 8601 format with timezone',
      type: 'string',
      format: 'date-time',
    },
    name: {
      title: 'Name',
      description: 'User-defined workout name',
      type: 'string',
      maxLength: 200,
    },
    notes: {
      title: 'Notes',
      description: 'Free-form notes about the session',
      type: 'string',
      maxLength: 10000,
    },
    durationSeconds: {
      title: 'Duration (seconds)',
      description: 'Total workout duration in seconds',
      type: 'integer',
      minimum: 0,
    },
    exercises: {
      title: 'Exercises',
      description: 'The exercises performed in this workout',
      type: 'array',
      minItems: 1,
      items: {
        $ref: '#/definitions/ExerciseLog',
      },
    },
  },
  definitions: {
    ExerciseLog: {
      title: 'ExerciseLog',
      description: 'A single exercise performed within a workout',
      type: 'object',
      required: ['exercise', 'sets'],
      additionalProperties: true,
      properties: {
        exercise: {
          $ref: '#/definitions/Exercise',
        },
        order: {
          title: 'Order',
          description: 'Position in workout (1-indexed). If omitted, array order is used.',
          type: 'integer',
          minimum: 1,
        },
        notes: {
          title: 'Notes',
          description: 'Notes specific to this exercise',
          type: 'string',
          maxLength: 5000,
        },
        supersetId: {
          title: 'Superset ID',
          description: 'Groups exercises into supersets. Same ID = same superset.',
          type: 'integer',
          minimum: 1,
        },
        sets: {
          title: 'Sets',
          description: 'The sets performed for this exercise',
          type: 'array',
          minItems: 1,
          items: {
            $ref: '#/definitions/SetLog',
          },
        },
      },
    },
    Exercise: {
      title: 'Exercise',
      description: 'Describes which exercise was performed',
      type: 'object',
      required: ['name'],
      additionalProperties: true,
      properties: {
        name: {
          title: 'Name',
          description: 'Human-readable exercise name',
          type: 'string',
          minLength: 1,
          maxLength: 200,
        },
        equipment: {
          title: 'Equipment',
          description: 'Equipment used',
          type: 'string',
          maxLength: 50,
        },
        category: {
          title: 'Category',
          description: 'Body part or category',
          type: 'string',
          maxLength: 50,
        },
        musclesWorked: {
          title: 'Muscles Worked',
          description: 'Specific muscles targeted by this exercise',
          type: 'array',
          items: {
            type: 'string',
            maxLength: 50,
          },
        },
      },
    },
    SetLog: {
      title: 'SetLog',
      description: 'A single set within an exercise',
      type: 'object',
      additionalProperties: true,
      allOf: [
        {
          if: { required: ['weight'] },
          then: { required: ['unit'] },
        },
        {
          if: { required: ['distance'] },
          then: { required: ['distanceUnit'] },
        },
      ],
      properties: {
        reps: {
          title: 'Reps',
          description: 'Repetitions completed. 0 indicates a failed attempt.',
          type: 'integer',
          minimum: 0,
        },
        weight: {
          title: 'Weight',
          description: 'Weight used. Omit for bodyweight exercises.',
          type: 'number',
          minimum: 0,
        },
        unit: {
          title: 'Unit',
          description: 'Weight unit. Required if weight is provided.',
          type: 'string',
          enum: ['kg', 'lb'],
        },
        durationSeconds: {
          title: 'Duration (seconds)',
          description: 'Time for timed exercises',
          type: 'integer',
          minimum: 0,
        },
        distance: {
          title: 'Distance',
          description: 'Distance for carries, sled work, etc.',
          type: 'number',
          minimum: 0,
        },
        distanceUnit: {
          title: 'Distance Unit',
          description: 'Distance unit. Required if distance is provided.',
          type: 'string',
          enum: ['m', 'km', 'ft', 'mi', 'yd'],
        },
        rpe: {
          title: 'RPE',
          description: 'Rate of Perceived Exertion on 0-10 scale',
          type: 'number',
          minimum: 0,
          maximum: 10,
        },
        rir: {
          title: 'RIR',
          description: 'Reps In Reserve',
          type: 'integer',
          minimum: 0,
        },
        toFailure: {
          title: 'To Failure',
          description: 'Whether the set was taken to muscular failure',
          type: 'boolean',
        },
        type: {
          title: 'Type',
          description: 'Set type (working, warmup, dropset, etc.)',
          type: 'string',
          maxLength: 50,
        },
        restSeconds: {
          title: 'Rest (seconds)',
          description: 'Rest taken after this set',
          type: 'integer',
          minimum: 0,
        },
        tempo: {
          title: 'Tempo',
          description: 'Tempo notation: eccentric-pause-concentric-pause',
          type: 'string',
          pattern: '^[0-9X]-[0-9X]-[0-9X]-[0-9X]$',
        },
        notes: {
          title: 'Notes',
          description: 'Notes for this specific set',
          type: 'string',
          maxLength: 1000,
        },
      },
    },
  },
} as const
