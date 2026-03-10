import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Check if templates already exist
  const existingTemplates = await prisma.scheduleTemplate.count()
  if (existingTemplates > 0) {
    console.log('Templates already exist, skipping seed')
    return
  }

  const templates = [
    {
      name: 'Beginner',
      type: 'BEGINNER' as const,
      description: 'A gentle introduction to learning. Perfect for those just starting their journey.',
      intensity: 1,
      dailyHours: 1,
      isSystem: true,
      config: {
        dailySlots: [
          { hour: 9, maxActivities: 1 },
          { hour: 10, maxActivities: 1 },
        ],
        dailyActivityCount: { min: 1, max: 2 },
      },
    },
    {
      name: 'Balanced',
      type: 'BALANCED' as const,
      description: 'A well-rounded schedule with a good mix of learning and rest.',
      intensity: 3,
      dailyHours: 3,
      isSystem: true,
      config: {
        dailySlots: [
          { hour: 9, maxActivities: 1 },
          { hour: 10, maxActivities: 1 },
          { hour: 14, maxActivities: 1 },
        ],
        dailyActivityCount: { min: 2, max: 3 },
      },
    },
    {
      name: 'Intensive',
      type: 'INTENSIVE' as const,
      description: 'For dedicated learners who want to make significant progress quickly.',
      intensity: 4,
      dailyHours: 5,
      isSystem: true,
      config: {
        dailySlots: [
          { hour: 9, maxActivities: 1 },
          { hour: 10, maxActivities: 1 },
          { hour: 11, maxActivities: 1 },
          { hour: 14, maxActivities: 1 },
          { hour: 15, maxActivities: 1 },
        ],
        dailyActivityCount: { min: 3, max: 5 },
      },
    },
    {
      name: 'Expert',
      type: 'EXPERT' as const,
      description: 'Maximum productivity schedule for serious learners and professionals.',
      intensity: 5,
      dailyHours: 7,
      isSystem: true,
      config: {
        dailySlots: [
          { hour: 8, maxActivities: 1 },
          { hour: 9, maxActivities: 1 },
          { hour: 10, maxActivities: 1 },
          { hour: 11, maxActivities: 1 },
          { hour: 14, maxActivities: 1 },
          { hour: 15, maxActivities: 1 },
          { hour: 16, maxActivities: 1 },
        ],
        dailyActivityCount: { min: 5, max: 7 },
      },
    },
  ]

  for (const template of templates) {
    await prisma.scheduleTemplate.create({
      data: template,
    })
  }

  console.log(`Created ${templates.length} templates`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
