import { defineType, defineField, defineArrayMember } from 'sanity'
import { Dumbbell } from 'lucide-react'

export default defineType({
  name: 'workout',
  title: 'Workout',
  type: 'document',
  icon: Dumbbell,
  description:
    "A record of a user's workout session, including exercises performed, sets, reps, duration, and date.",
  fields: [
    defineField({
      name: 'userId',
      title: 'User ID',
      description: 'The Clerk user ID associated with this workout.',
      type: 'string',
    }),
    defineField({
      name: 'date',
      title: 'Date',
      description: 'The date when the workout was performed.',
      type: 'datetime',
    }),
    defineField({
      name: 'duration',
      title: 'Duration (seconds)',
      description: 'Total duration of the workout in seconds.',
      type: 'number',
    }),
    defineField({
      name: 'exercises',
      title: 'Exercises',
      description:
        'List of exercises performed in this workout, including sets, reps, weight, and unit.',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'exerciseEntry',
          fields: [
            defineField({
              name: 'exercise',
              title: 'Exercise',
              description: 'Reference to the exercise performed.',
              type: 'reference',
              to: [{ type: 'exercise' }],
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'sets',
              title: 'Sets',
              description: 'Details of each set performed for this exercise.',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'setEntry',
                  fields: [
                    defineField({
                      name: 'reps',
                      title: 'Repetitions',
                      description:
                        'Number of repetitions performed in this set.',
                      type: 'number',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'weight',
                      title: 'Weight',
                      description: 'Weight used in this set.',
                      type: 'number',
                      validation: (Rule) => Rule.required(),
                    }),
                    defineField({
                      name: 'weightUnit',
                      title: 'Weight Unit',
                      description:
                        'Unit of weight (kg as per Indian standard).',
                      type: 'string',
                      initialValue: 'kg',
                      options: {
                        list: [{ title: 'Kilograms', value: 'kg' }],
                        layout: 'dropdown',
                      },
                      validation: (Rule) => Rule.required(),
                    }),
                  ],
                  preview: {
                    select: {
                      reps: 'reps',
                      weight: 'weight',
                      weightUnit: 'weightUnit',
                    },
                    prepare({ reps, weight, weightUnit }) {
                      return {
                        title: `${reps} reps × ${weight}${weightUnit}`,
                      }
                    },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {
              exercise: 'exercise',
              exerciseTitle: 'exercise.name',
              sets: 'sets',
            },
            prepare({ exerciseTitle, sets }) {
              return {
                title: exerciseTitle || 'Exercise',
                subtitle: sets ? `Total sets: ${sets.length}` : 'No sets added',
              }
            },
          },
        }),
      ],
    }),
  ],
})
