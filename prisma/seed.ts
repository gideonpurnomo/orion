import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create domains - Ordered by priority
  const programming = await prisma.domain.upsert({
    where: { slug: 'programming' },
    update: {},
    create: {
      name: 'Programming',
      slug: 'programming',
      icon: '💻',
      description: 'Learn programming languages and software development skills',
      color: '#3b82f6',
      order: 1,
    },
  })

  const music = await prisma.domain.upsert({
    where: { slug: 'music' },
    update: {},
    create: {
      name: 'Music',
      slug: 'music',
      icon: '🎸',
      description: 'Develop your musical skills and learn to play instruments',
      color: '#8b5cf6',
      order: 2,
    },
  })

  const cooking = await prisma.domain.upsert({
    where: { slug: 'cooking' },
    update: {},
    create: {
      name: 'Cooking',
      slug: 'cooking',
      icon: '🍳',
      description: 'Master the art of cooking with recipes and techniques from around the world',
      color: '#ef4444',
      order: 3,
    },
  })

  const fitness = await prisma.domain.upsert({
    where: { slug: 'fitness' },
    update: {},
    create: {
      name: 'Fitness',
      slug: 'fitness',
      icon: '🏋️',
      description: 'Stay healthy and fit with various workout routines',
      color: '#10b981',
      order: 4,
    },
  })

  const languages = await prisma.domain.upsert({
    where: { slug: 'languages' },
    update: {},
    create: {
      name: 'Languages',
      slug: 'languages',
      icon: '🌍',
      description: 'Master new languages and improve communication skills',
      color: '#f59e0b',
      order: 5,
    },
  })

  const school = await prisma.domain.upsert({
    where: { slug: 'school' },
    update: {},
    create: {
      name: 'School Topics',
      slug: 'school',
      icon: '📚',
      description: 'Excel in academic subjects and build a strong foundation',
      color: '#ec4899',
      order: 6,
    },
  })

  // Create cooking categories
  const italian = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'italian' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Italian Cuisine',
      slug: 'italian',
      description: 'Classic Italian dishes and techniques',
      order: 1,
    },
  })

  const baking = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'baking' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Baking',
      slug: 'baking',
      description: 'Breads, pastries, and desserts',
      order: 2,
    },
  })

  // Create cooking activities
  const cookingActivities = [
    {
      title: 'Pasta Carbonara',
      slug: 'pasta-carbonara',
      description: 'Learn to make authentic Italian pasta carbonara with eggs, cheese, and pancetta',
      difficulty: 3,
      duration: 45,
      tags: ['pasta', 'quick', 'dinner'],
      categoryId: italian.id,
      domainId: cooking.id,
    },
    {
      title: 'Basic Knife Skills',
      slug: 'basic-knife-skills',
      description: 'Master essential knife techniques: dicing, julienne, and chiffonade',
      difficulty: 2,
      duration: 30,
      tags: ['techniques', 'foundational', 'safety'],
      categoryId: italian.id,
      domainId: cooking.id,
    },
    {
      title: 'Homemade Pizza Dough',
      slug: 'homemade-pizza-dough',
      description: 'Create authentic pizza dough from scratch with perfect fermentation',
      difficulty: 4,
      duration: 90,
      tags: ['dough', 'bread', 'italian'],
      categoryId: baking.id,
      domainId: cooking.id,
    },
    {
      title: 'Classic Tomato Sauce',
      slug: 'classic-tomato-sauce',
      description: 'Prepare a versatile Italian tomato sauce base for pasta and more',
      difficulty: 2,
      duration: 40,
      tags: ['sauce', 'versatile', 'storage'],
      categoryId: italian.id,
      domainId: cooking.id,
    },
    {
      title: 'Risotto Basics',
      slug: 'risotto-basics',
      description: 'Learn the technique for perfect creamy risotto',
      difficulty: 5,
      duration: 50,
      tags: ['rice', 'creamy', 'technique'],
      categoryId: italian.id,
      domainId: cooking.id,
    },
  ]

  for (const activity of cookingActivities) {
    await prisma.activity.upsert({
      where: {
        domainId_categoryId_slug: {
          domainId: activity.domainId,
          categoryId: activity.categoryId,
          slug: activity.slug,
        },
      },
      update: {},
      create: activity,
    })
  }

  // Create programming categories
  const python = await prisma.category.upsert({
    where: { domainId_slug: { domainId: programming.id, slug: 'python' } },
    update: {},
    create: {
      domainId: programming.id,
      name: 'Python',
      slug: 'python',
      description: 'Learn Python programming language',
      order: 1,
    },
  })

  const webdev = await prisma.category.upsert({
    where: { domainId_slug: { domainId: programming.id, slug: 'web-development' } },
    update: {},
    create: {
      domainId: programming.id,
      name: 'Web Development',
      slug: 'web-development',
      description: 'Frontend and backend web development',
      order: 2,
    },
  })

  // Create programming activities
  const programmingActivities = [
    {
      title: 'Hello World',
      slug: 'hello-world',
      description: 'Write your first Python program and understand the basic structure',
      difficulty: 1,
      duration: 10,
      tags: ['beginner', 'basics', 'intro'],
      categoryId: python.id,
      domainId: programming.id,
    },
    {
      title: 'Variables and Data Types',
      slug: 'variables-data-types',
      description: 'Learn about strings, integers, floats, and booleans in Python',
      difficulty: 1,
      duration: 25,
      tags: ['basics', 'data-types', 'foundational'],
      categoryId: python.id,
      domainId: programming.id,
    },
    {
      title: 'Lists and Dictionaries',
      slug: 'lists-dictionaries',
      description: 'Master Python data structures: lists, dictionaries, tuples, and sets',
      difficulty: 3,
      duration: 45,
      tags: ['data-structures', 'collections', 'intermediate'],
      categoryId: python.id,
      domainId: programming.id,
    },
    {
      title: 'Functions and Modules',
      slug: 'functions-modules',
      description: 'Write reusable functions and organize code into modules',
      difficulty: 3,
      duration: 40,
      tags: ['functions', 'modules', 'organization'],
      categoryId: python.id,
      domainId: programming.id,
    },
    {
      title: 'Basic HTML Structure',
      slug: 'basic-html',
      description: 'Create your first HTML webpage with proper semantic structure',
      difficulty: 1,
      duration: 20,
      tags: ['html', 'web', 'frontend'],
      categoryId: webdev.id,
      domainId: programming.id,
    },
    {
      title: 'CSS Styling Basics',
      slug: 'css-basics',
      description: 'Style your HTML with CSS for beautiful web pages',
      difficulty: 2,
      duration: 35,
      tags: ['css', 'styling', 'design'],
      categoryId: webdev.id,
      domainId: programming.id,
    },
    {
      title: 'JavaScript Fundamentals',
      slug: 'javascript-fundamentals',
      description: 'Learn JavaScript basics: variables, functions, and DOM manipulation',
      difficulty: 3,
      duration: 50,
      tags: ['javascript', 'frontend', 'interactive'],
      categoryId: webdev.id,
      domainId: programming.id,
    },
  ]

  for (const activity of programmingActivities) {
    await prisma.activity.upsert({
      where: {
        domainId_categoryId_slug: {
          domainId: activity.domainId,
          categoryId: activity.categoryId,
          slug: activity.slug,
        },
      },
      update: {},
      create: activity,
    })
  }

  // Create music categories
  const guitar = await prisma.category.upsert({
    where: { domainId_slug: { domainId: music.id, slug: 'guitar' } },
    update: {},
    create: {
      domainId: music.id,
      name: 'Guitar',
      slug: 'guitar',
      description: 'Learn to play guitar',
      order: 1,
    },
  })

  // Create music activities
  const musicActivities = [
    {
      title: 'Basic Chords (G, C, D)',
      slug: 'basic-chords',
      description: 'Learn the three most essential guitar chords',
      difficulty: 2,
      duration: 30,
      tags: ['chords', 'beginner', 'fundamental'],
      categoryId: guitar.id,
      domainId: music.id,
    },
    {
      title: 'Strumming Patterns',
      slug: 'strumming-patterns',
      description: 'Practice different strumming techniques for better rhythm',
      difficulty: 3,
      duration: 25,
      tags: ['rhythm', 'strumming', 'technique'],
      categoryId: guitar.id,
      domainId: music.id,
    },
    {
      title: 'Simple Songs Practice',
      slug: 'simple-songs',
      description: 'Play your first complete song using basic chords',
      difficulty: 3,
      duration: 20,
      tags: ['songs', 'practice', 'fun'],
      categoryId: guitar.id,
      domainId: music.id,
    },
  ]

  for (const activity of musicActivities) {
    await prisma.activity.upsert({
      where: {
        domainId_categoryId_slug: {
          domainId: activity.domainId,
          categoryId: activity.categoryId,
          slug: activity.slug,
        },
      },
      update: {},
      create: activity,
    })
  }

  // Create fitness categories
  const strength = await prisma.category.upsert({
    where: { domainId_slug: { domainId: fitness.id, slug: 'strength' } },
    update: {},
    create: {
      domainId: fitness.id,
      name: 'Strength Training',
      slug: 'strength',
      description: 'Build muscle and strength',
      order: 1,
    },
  })

  // Create fitness activities
  const fitnessActivities = [
    {
      title: 'Push-ups',
      slug: 'push-ups',
      description: 'Master proper push-up form and build upper body strength',
      difficulty: 2,
      duration: 15,
      tags: ['upper-body', 'strength', 'no-equipment'],
      categoryId: strength.id,
      domainId: fitness.id,
    },
    {
      title: 'Squats',
      slug: 'squats',
      description: 'Build leg strength with proper squat technique',
      difficulty: 2,
      duration: 15,
      tags: ['lower-body', 'strength', 'no-equipment'],
      categoryId: strength.id,
      domainId: fitness.id,
    },
    {
      title: 'Plank',
      slug: 'plank',
      description: 'Strengthen your core with plank variations',
      difficulty: 2,
      duration: 10,
      tags: ['core', 'strength', 'no-equipment'],
      categoryId: strength.id,
      domainId: fitness.id,
    },
  ]

  for (const activity of fitnessActivities) {
    await prisma.activity.upsert({
      where: {
        domainId_categoryId_slug: {
          domainId: activity.domainId,
          categoryId: activity.categoryId,
          slug: activity.slug,
        },
      },
      update: {},
      create: activity,
    })
  }

  // Create language categories
  const spanish = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'spanish' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'Spanish',
      slug: 'spanish',
      description: 'Learn Spanish language and culture',
      order: 1,
    },
  })

  const french = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'french' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'French',
      slug: 'french',
      description: 'Learn French language and culture',
      order: 2,
    },
  })

  const german = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'german' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'German',
      slug: 'german',
      description: 'Learn German language and culture',
      order: 3,
    },
  })

  // Create language activities - Broad subjects with sub-topic tags
  const languageActivities = [
    {
      title: 'Spanish',
      slug: 'spanish',
      description: 'Learn Spanish language - from basic greetings to advanced grammar',
      difficulty: 3,
      duration: 60,
      tags: ['greetings', 'numbers', 'verbs', 'grammar', 'conversation', 'vocabulary', 'culture'],
      categoryId: spanish.id,
      domainId: languages.id,
    },
    {
      title: 'French',
      slug: 'french',
      description: 'Master French language - essential phrases to advanced grammar',
      difficulty: 3,
      duration: 60,
      tags: ['greetings', 'pronunciation', 'verbs', 'grammar', 'conversation', 'vocabulary'],
      categoryId: french.id,
      domainId: languages.id,
    },
    {
      title: 'German',
      slug: 'german',
      description: 'Learn German language - alphabet to complex grammar',
      difficulty: 4,
      duration: 60,
      tags: ['alphabet', 'pronunciation', 'articles', 'grammar', 'conversation', 'vocabulary'],
      categoryId: german.id,
      domainId: languages.id,
    },
  ]

  for (const activity of languageActivities) {
    await prisma.activity.upsert({
      where: {
        domainId_categoryId_slug: {
          domainId: activity.domainId,
          categoryId: activity.categoryId,
          slug: activity.slug,
        },
      },
      update: {},
      create: activity,
    })
  }

  // Create school categories
  const math = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'math' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Mathematics',
      slug: 'math',
      description: 'Master mathematical concepts and problem-solving',
      order: 1,
    },
  })

  const science = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'science' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Science',
      slug: 'science',
      description: 'Explore scientific concepts and experiments',
      order: 2,
    },
  })

  const writing = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'writing' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Writing & English',
      slug: 'writing',
      description: 'Improve writing skills and English language proficiency',
      order: 3,
    },
  })

  const history = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'history' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'History',
      slug: 'history',
      description: 'Learn about historical events and civilizations',
      order: 4,
    },
  })

  // Create school activities - Broad subjects with sub-topic tags
  const schoolActivities = [
    {
      title: 'Mathematics',
      slug: 'math',
      description: 'Master mathematics - from algebra to calculus',
      difficulty: 4,
      duration: 60,
      tags: ['algebra', 'geometry', 'calculus', 'statistics', 'trigonometry', 'word-problems'],
      categoryId: math.id,
      domainId: school.id,
    },
    {
      title: 'Science',
      slug: 'science',
      description: 'Explore scientific concepts - chemistry, biology, and physics',
      difficulty: 4,
      duration: 60,
      tags: ['chemistry', 'biology', 'physics', 'experiments', 'lab-skills', 'scientific-method'],
      categoryId: science.id,
      domainId: school.id,
    },
    {
      title: 'Writing & English',
      slug: 'writing-english',
      description: 'Improve writing and English skills - essays to creative writing',
      difficulty: 3,
      duration: 60,
      tags: ['grammar', 'punctuation', 'essays', 'creative-writing', 'reading-comprehension', 'vocabulary'],
      categoryId: writing.id,
      domainId: school.id,
    },
    {
      title: 'History',
      slug: 'history',
      description: 'Study world history - ancient civilizations to modern events',
      difficulty: 3,
      duration: 60,
      tags: ['ancient-civilizations', 'modern-history', 'world-wars', 'historical-analysis', 'timelines', 'research'],
      categoryId: history.id,
      domainId: school.id,
    },
  ]

  for (const activity of schoolActivities) {
    await prisma.activity.upsert({
      where: {
        domainId_categoryId_slug: {
          domainId: activity.domainId,
          categoryId: activity.categoryId,
          slug: activity.slug,
        },
      },
      update: {},
      create: activity,
    })
  }

  console.log('✅ Database seed completed successfully!')
  console.log(`   - ${6} domains created`)
  console.log(`   - ${15} categories created`)
  console.log(`   - ${cookingActivities.length + programmingActivities.length + musicActivities.length + fitnessActivities.length + languageActivities.length + schoolActivities.length} activities created`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
