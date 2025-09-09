import { defineField, defineType } from 'sanity'
import { Dumbbell } from 'lucide-react'

export default defineType({
    name: 'exercise',
    title: 'Exercise',
    type: 'document',
    icon: Dumbbell,
    description: 'A single exercise with details, difficulty, media, and status.',
    fields: [
        defineField({
            name: 'name',
            title: 'Name',
            description: 'The name of the exercise.',
            type: 'string',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            description: 'A brief description of the exercise.',
            type: 'text',
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'difficulty',
            title: 'Difficulty',
            description: 'Select the difficulty level for this exercise.',
            type: 'string',
            options: {
                list: [
                    { title: 'Beginner', value: 'beginner' },
                    { title: 'Intermediate', value: 'intermediate' },
                    { title: 'Advanced', value: 'advanced' },
                ],
                layout: 'radio',
            },
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'image',
            title: 'Image',
            description: 'An image representing the exercise.',
            type: 'image',
            fields: [
                defineField({
                    name: 'alt',
                    type: 'string',
                    title: 'Alt Text',
                    description: "Describe the image for accessibility and SEO.",
                }),
            ],
            validation: Rule => Rule.required(),
        }),
        defineField({
            name: 'videoUrl',
            title: 'Video URL',
            description: 'A link to a video demonstrating the exercise.',
            type: 'url',
        }),
        defineField({
            name: 'isActive',
            title: 'Is Active?',
            description: 'Toggle to mark this exercise as active or inactive.',
            type: 'boolean',
            initialValue: true,
        }),
    ],
})