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

  const dataAi = await prisma.domain.upsert({
    where: { slug: 'data-ai' },
    update: {},
    create: {
      name: 'Data & AI',
      slug: 'data-ai',
      icon: '🤖',
      description: 'Learn data analysis, machine learning, and practical AI skills',
      color: '#0ea5e9',
      order: 7,
    },
  })

  const business = await prisma.domain.upsert({
    where: { slug: 'business' },
    update: {},
    create: {
      name: 'Business',
      slug: 'business',
      icon: '💼',
      description: 'Build entrepreneurship, finance, and business strategy skills',
      color: '#f97316',
      order: 8,
    },
  })

  const design = await prisma.domain.upsert({
    where: { slug: 'design' },
    update: {},
    create: {
      name: 'Design',
      slug: 'design',
      icon: '🎨',
      description: 'Master visual design, UX/UI, and design systems',
      color: '#14b8a6',
      order: 9,
    },
  })

  const cybersecurity = await prisma.domain.upsert({
    where: { slug: 'cybersecurity' },
    update: {},
    create: {
      name: 'Cybersecurity',
      slug: 'cybersecurity',
      icon: '🔐',
      description: 'Learn security fundamentals, secure coding, and threat defense',
      color: '#6366f1',
      order: 10,
    },
  })

  const productivity = await prisma.domain.upsert({
    where: { slug: 'productivity' },
    update: {},
    create: {
      name: 'Productivity',
      slug: 'productivity',
      icon: '⚡',
      description: 'Improve planning, communication, and project execution',
      color: '#84cc16',
      order: 11,
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

  // Add broad surface-level cuisine tracks
  const chineseCuisine = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'chinese' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Chinese Cuisine',
      slug: 'chinese',
      description: 'Core Chinese cooking styles and techniques',
      order: 3,
    },
  })

  const frenchCuisine = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'french' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'French Cuisine',
      slug: 'french',
      description: 'Classical French cooking fundamentals',
      order: 4,
    },
  })

  const japaneseCuisine = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'japanese' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Japanese Cuisine',
      slug: 'japanese',
      description: 'Japanese home and restaurant cooking basics',
      order: 5,
    },
  })

  const indianCuisine = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'indian' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Indian Cuisine',
      slug: 'indian',
      description: 'Indian flavor profiles, spices, and staple dishes',
      order: 6,
    },
  })

  const broadCookingTracks = [
    {
      title: 'Italian Cooking',
      slug: 'italian-cooking-track',
      description: 'Learn key Italian techniques, sauces, pasta, and regional dishes',
      difficulty: 3,
      duration: 60,
      tags: ['italian', 'pasta', 'sauces', 'regional'],
      categoryId: italian.id,
      domainId: cooking.id,
    },
    {
      title: 'Chinese Cooking',
      slug: 'chinese-cooking-track',
      description: 'Learn stir-fry, steaming, wok heat control, and sauce balancing',
      difficulty: 3,
      duration: 60,
      tags: ['chinese', 'wok', 'stir-fry', 'sauces'],
      categoryId: chineseCuisine.id,
      domainId: cooking.id,
    },
    {
      title: 'French Cooking',
      slug: 'french-cooking-track',
      description: 'Practice classical techniques, stocks, sauces, and plating basics',
      difficulty: 4,
      duration: 70,
      tags: ['french', 'classical', 'stocks', 'sauces'],
      categoryId: frenchCuisine.id,
      domainId: cooking.id,
    },
    {
      title: 'Japanese Cooking',
      slug: 'japanese-cooking-track',
      description: 'Cover rice, broths, knife work, and core Japanese meal structure',
      difficulty: 3,
      duration: 60,
      tags: ['japanese', 'rice', 'dashi', 'knife-skills'],
      categoryId: japaneseCuisine.id,
      domainId: cooking.id,
    },
    {
      title: 'Indian Cooking',
      slug: 'indian-cooking-track',
      description: 'Understand spice layering, curries, breads, and regional styles',
      difficulty: 3,
      duration: 65,
      tags: ['indian', 'spices', 'curries', 'regional'],
      categoryId: indianCuisine.id,
      domainId: cooking.id,
    },
  ]

  for (const activity of broadCookingTracks) {
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

  const mexicanCuisine = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'mexican' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Mexican Cuisine',
      slug: 'mexican',
      description: 'Mexican regional cuisine and staple techniques',
      order: 7,
    },
  })

  const thaiCuisine = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'thai' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Thai Cuisine',
      slug: 'thai',
      description: 'Thai flavor balancing and essential dishes',
      order: 8,
    },
  })

  const additionalCookingTracks = [
    {
      title: 'Mexican Cooking',
      slug: 'mexican-cooking-track',
      description: 'Learn tortillas, salsas, and core Mexican home-cooking methods',
      difficulty: 3,
      duration: 60,
      tags: ['mexican', 'salsas', 'tortillas', 'regional'],
      categoryId: mexicanCuisine.id,
      domainId: cooking.id,
    },
    {
      title: 'Thai Cooking',
      slug: 'thai-cooking-track',
      description: 'Practice Thai curry, stir-fry, and flavor balancing fundamentals',
      difficulty: 3,
      duration: 60,
      tags: ['thai', 'curries', 'stir-fry', 'balance'],
      categoryId: thaiCuisine.id,
      domainId: cooking.id,
    },
  ]

  for (const activity of additionalCookingTracks) {
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

  // Create programming categories (broad tracks)
  const coreProgramming = await prisma.category.upsert({
    where: { domainId_slug: { domainId: programming.id, slug: 'core-programming' } },
    update: {},
    create: {
      domainId: programming.id,
      name: 'Core Programming',
      slug: 'core-programming',
      description: 'Language fundamentals and problem-solving skills',
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

  const softwareEngineering = await prisma.category.upsert({
    where: { domainId_slug: { domainId: programming.id, slug: 'software-engineering' } },
    update: {},
    create: {
      domainId: programming.id,
      name: 'Software Engineering',
      slug: 'software-engineering',
      description: 'Testing, architecture, and maintainable coding practices',
      order: 3,
    },
  })

  // Create programming activities (broad, informative tracks)
  const programmingActivities = [
    {
      title: 'Python',
      slug: 'python-track',
      description: 'Learn Python from syntax to practical scripting and automation',
      difficulty: 2,
      duration: 60,
      tags: ['syntax', 'data-types', 'functions', 'modules', 'files', 'automation'],
      categoryId: coreProgramming.id,
      domainId: programming.id,
    },
    {
      title: 'JavaScript',
      slug: 'javascript-track',
      description: 'Master JavaScript basics for web interactivity and app logic',
      difficulty: 2,
      duration: 60,
      tags: ['variables', 'functions', 'dom', 'events', 'async', 'apis'],
      categoryId: coreProgramming.id,
      domainId: programming.id,
    },
    {
      title: 'Data Structures & Algorithms',
      slug: 'dsa-track',
      description: 'Build problem-solving skills with arrays, trees, graphs, and patterns',
      difficulty: 4,
      duration: 75,
      tags: ['arrays', 'hashmaps', 'trees', 'graphs', 'sorting', 'complexity'],
      categoryId: coreProgramming.id,
      domainId: programming.id,
    },
    {
      title: 'Frontend Development',
      slug: 'frontend-track',
      description: 'Create modern UI with HTML, CSS, JavaScript, and component frameworks',
      difficulty: 3,
      duration: 75,
      tags: ['html', 'css', 'react', 'state-management', 'accessibility', 'responsive-design'],
      categoryId: webdev.id,
      domainId: programming.id,
    },
    {
      title: 'Backend Development',
      slug: 'backend-track',
      description: 'Build APIs, manage databases, and handle authentication',
      difficulty: 4,
      duration: 80,
      tags: ['api-design', 'databases', 'auth', 'validation', 'scaling', 'deployment'],
      categoryId: webdev.id,
      domainId: programming.id,
    },
    {
      title: 'Testing & Code Quality',
      slug: 'testing-code-quality-track',
      description: 'Write reliable software with tests, linting, and refactoring practices',
      difficulty: 3,
      duration: 55,
      tags: ['unit-tests', 'integration-tests', 'linting', 'refactoring', 'ci-cd'],
      categoryId: softwareEngineering.id,
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

  // Add high-level programming language tracks users expect.
  const programmingLanguages = await prisma.category.upsert({
    where: { domainId_slug: { domainId: programming.id, slug: 'programming-languages' } },
    update: {},
    create: {
      domainId: programming.id,
      name: 'Programming Languages',
      slug: 'programming-languages',
      description: 'Language-specific learning tracks',
      order: 4,
    },
  })

  const languageProgrammingTracks = [
    {
      title: 'HTML',
      slug: 'html-track',
      description: 'Learn semantic HTML, forms, and document structure',
      difficulty: 1,
      duration: 45,
      tags: ['html', 'semantic', 'forms', 'structure'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'CSS',
      slug: 'css-track',
      description: 'Master layouts, responsiveness, and modern styling systems',
      difficulty: 2,
      duration: 50,
      tags: ['css', 'flexbox', 'grid', 'responsive'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'Java',
      slug: 'java-track',
      description: 'Build Java fundamentals: OOP, collections, and application structure',
      difficulty: 3,
      duration: 65,
      tags: ['java', 'oop', 'collections', 'jvm'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'C',
      slug: 'c-track',
      description: 'Learn systems programming fundamentals in C',
      difficulty: 4,
      duration: 70,
      tags: ['c', 'memory', 'pointers', 'systems'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'C++',
      slug: 'cpp-track',
      description: 'Understand C++ OOP, STL, and performance-oriented programming',
      difficulty: 4,
      duration: 75,
      tags: ['c++', 'stl', 'oop', 'performance'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
  ]

  for (const activity of languageProgrammingTracks) {
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

  const additionalProgrammingLanguageTracks = [
    {
      title: 'TypeScript',
      slug: 'typescript-track',
      description: 'Use static typing to build safer JavaScript applications',
      difficulty: 3,
      duration: 60,
      tags: ['typescript', 'types', 'frontend', 'backend'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'Go',
      slug: 'go-track',
      description: 'Learn Go fundamentals for backend services and tooling',
      difficulty: 3,
      duration: 60,
      tags: ['go', 'backend', 'concurrency', 'services'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'Rust',
      slug: 'rust-track',
      description: 'Understand ownership, safety, and systems programming with Rust',
      difficulty: 4,
      duration: 70,
      tags: ['rust', 'ownership', 'systems', 'performance'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
  ]

  for (const activity of additionalProgrammingLanguageTracks) {
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

  // Add broad fitness tracks
  const cardio = await prisma.category.upsert({
    where: { domainId_slug: { domainId: fitness.id, slug: 'cardio' } },
    update: {},
    create: {
      domainId: fitness.id,
      name: 'Cardio',
      slug: 'cardio',
      description: 'Cardiovascular conditioning and endurance',
      order: 2,
    },
  })

  const mobility = await prisma.category.upsert({
    where: { domainId_slug: { domainId: fitness.id, slug: 'mobility' } },
    update: {},
    create: {
      domainId: fitness.id,
      name: 'Mobility',
      slug: 'mobility',
      description: 'Improve movement quality and joint range',
      order: 3,
    },
  })

  const yoga = await prisma.category.upsert({
    where: { domainId_slug: { domainId: fitness.id, slug: 'yoga' } },
    update: {},
    create: {
      domainId: fitness.id,
      name: 'Yoga',
      slug: 'yoga',
      description: 'Yoga practice for flexibility, breath, and recovery',
      order: 4,
    },
  })

  const broadFitnessTracks = [
    {
      title: 'Strength Training',
      slug: 'strength-training-track',
      description: 'Develop strength with progressive overload and good form',
      difficulty: 3,
      duration: 50,
      tags: ['strength', 'progressive-overload', 'form', 'compound-lifts'],
      categoryId: strength.id,
      domainId: fitness.id,
    },
    {
      title: 'Cardio Training',
      slug: 'cardio-training-track',
      description: 'Build endurance with interval and steady-state cardio sessions',
      difficulty: 2,
      duration: 40,
      tags: ['cardio', 'intervals', 'endurance', 'heart-rate'],
      categoryId: cardio.id,
      domainId: fitness.id,
    },
    {
      title: 'Mobility & Flexibility',
      slug: 'mobility-flexibility-track',
      description: 'Increase mobility, reduce stiffness, and support better movement',
      difficulty: 2,
      duration: 35,
      tags: ['mobility', 'flexibility', 'recovery', 'range-of-motion'],
      categoryId: mobility.id,
      domainId: fitness.id,
    },
    {
      title: 'Yoga Practice',
      slug: 'yoga-practice-track',
      description: 'Build a balanced yoga routine for strength, breath, and recovery',
      difficulty: 2,
      duration: 45,
      tags: ['yoga', 'breathwork', 'balance', 'flow'],
      categoryId: yoga.id,
      domainId: fitness.id,
    },
  ]

  for (const activity of broadFitnessTracks) {
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

  const pilates = await prisma.category.upsert({
    where: { domainId_slug: { domainId: fitness.id, slug: 'pilates' } },
    update: {},
    create: {
      domainId: fitness.id,
      name: 'Pilates',
      slug: 'pilates',
      description: 'Core-focused control, stability, and posture work',
      order: 5,
    },
  })

  const running = await prisma.category.upsert({
    where: { domainId_slug: { domainId: fitness.id, slug: 'running' } },
    update: {},
    create: {
      domainId: fitness.id,
      name: 'Running',
      slug: 'running',
      description: 'Running form, endurance, and pace development',
      order: 6,
    },
  })

  const additionalFitnessTracks = [
    {
      title: 'Pilates Training',
      slug: 'pilates-training-track',
      description: 'Build core strength, alignment, and movement control',
      difficulty: 2,
      duration: 40,
      tags: ['pilates', 'core', 'posture', 'control'],
      categoryId: pilates.id,
      domainId: fitness.id,
    },
    {
      title: 'Running Training',
      slug: 'running-training-track',
      description: 'Improve running endurance, pace, and recovery strategy',
      difficulty: 2,
      duration: 45,
      tags: ['running', 'endurance', 'pace', 'recovery'],
      categoryId: running.id,
      domainId: fitness.id,
    },
  ]

  for (const activity of additionalFitnessTracks) {
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

  // Add broad language tracks users can customize later.
  const english = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'english' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'English',
      slug: 'english',
      description: 'English fluency and communication practice',
      order: 4,
    },
  })

  const japanese = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'japanese' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'Japanese',
      slug: 'japanese',
      description: 'Japanese language and writing system basics',
      order: 5,
    },
  })

  const korean = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'korean' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'Korean',
      slug: 'korean',
      description: 'Korean language and conversation fundamentals',
      order: 6,
    },
  })

  const mandarin = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'mandarin' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'Mandarin Chinese',
      slug: 'mandarin',
      description: 'Mandarin pronunciation, tones, and sentence patterns',
      order: 7,
    },
  })

  const additionalLanguageTracks = [
    {
      title: 'English',
      slug: 'english-track',
      description: 'Improve speaking, grammar, and professional communication in English',
      difficulty: 2,
      duration: 55,
      tags: ['speaking', 'grammar', 'writing', 'vocabulary', 'fluency'],
      categoryId: english.id,
      domainId: languages.id,
    },
    {
      title: 'Japanese',
      slug: 'japanese-track',
      description: 'Learn kana, core grammar, and practical daily conversation',
      difficulty: 3,
      duration: 60,
      tags: ['hiragana', 'katakana', 'grammar', 'conversation', 'vocabulary'],
      categoryId: japanese.id,
      domainId: languages.id,
    },
    {
      title: 'Korean',
      slug: 'korean-track',
      description: 'Build Hangul reading skills and everyday conversational Korean',
      difficulty: 3,
      duration: 60,
      tags: ['hangul', 'grammar', 'conversation', 'vocabulary'],
      categoryId: korean.id,
      domainId: languages.id,
    },
    {
      title: 'Mandarin Chinese',
      slug: 'mandarin-track',
      description: 'Practice tones, pinyin, and useful Mandarin expressions',
      difficulty: 3,
      duration: 60,
      tags: ['tones', 'pinyin', 'conversation', 'characters', 'listening'],
      categoryId: mandarin.id,
      domainId: languages.id,
    },
  ]

  for (const activity of additionalLanguageTracks) {
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

  const portuguese = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'portuguese' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'Portuguese',
      slug: 'portuguese',
      description: 'Portuguese grammar, listening, and practical speaking',
      order: 8,
    },
  })

  const arabic = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'arabic' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'Arabic',
      slug: 'arabic',
      description: 'Arabic alphabet, core grammar, and communication basics',
      order: 9,
    },
  })

  const extraLanguageTracks = [
    {
      title: 'Portuguese',
      slug: 'portuguese-track',
      description: 'Build Portuguese conversation and listening comprehension skills',
      difficulty: 3,
      duration: 60,
      tags: ['portuguese', 'conversation', 'grammar', 'listening'],
      categoryId: portuguese.id,
      domainId: languages.id,
    },
    {
      title: 'Arabic',
      slug: 'arabic-track',
      description: 'Learn Arabic script, pronunciation, and daily-use phrases',
      difficulty: 3,
      duration: 65,
      tags: ['arabic', 'alphabet', 'pronunciation', 'conversation'],
      categoryId: arabic.id,
      domainId: languages.id,
    },
  ]

  for (const activity of extraLanguageTracks) {
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
  const preAlgebra = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'pre-algebra' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Pre-Algebra',
      slug: 'pre-algebra',
      description: 'Arithmetic foundations and intro problem-solving',
      order: 1,
    },
  })

  const algebra = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'algebra' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Algebra',
      slug: 'algebra',
      description: 'Equations, functions, and algebraic reasoning',
      order: 2,
    },
  })

  const precalculus = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'precalculus' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Precalculus',
      slug: 'precalculus',
      description: 'Functions, trigonometry, and advanced algebra topics',
      order: 3,
    },
  })

  const calculus = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'calculus' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Calculus',
      slug: 'calculus',
      description: 'Limits, derivatives, and integrals',
      order: 4,
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
      order: 5,
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
      order: 6,
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
      order: 7,
    },
  })

  // Create school activities - broad tracks with informative subtopics
  const schoolActivities = [
    {
      title: 'Pre-Algebra',
      slug: 'pre-algebra-track',
      description: 'Build a strong base with fractions, ratios, and equations',
      difficulty: 2,
      duration: 55,
      tags: ['fractions', 'ratios', 'integers', 'expressions', 'word-problems'],
      categoryId: preAlgebra.id,
      domainId: school.id,
    },
    {
      title: 'Algebra',
      slug: 'algebra-track',
      description: 'Learn linear equations, inequalities, and function foundations',
      difficulty: 3,
      duration: 60,
      tags: ['equations', 'inequalities', 'functions', 'graphing', 'systems'],
      categoryId: algebra.id,
      domainId: school.id,
    },
    {
      title: 'Precalculus',
      slug: 'precalculus-track',
      description: 'Strengthen function analysis and trigonometry before calculus',
      difficulty: 4,
      duration: 65,
      tags: ['trigonometry', 'polynomials', 'exponentials', 'logarithms', 'unit-circle'],
      categoryId: precalculus.id,
      domainId: school.id,
    },
    {
      title: 'Calculus',
      slug: 'calculus-track',
      description: 'Understand limits, derivatives, integrals, and real-world applications',
      difficulty: 5,
      duration: 75,
      tags: ['limits', 'derivatives', 'integrals', 'optimization', 'rates-of-change'],
      categoryId: calculus.id,
      domainId: school.id,
    },
    {
      title: 'Science',
      slug: 'science-track',
      description: 'Explore scientific concepts - chemistry, biology, and physics',
      difficulty: 4,
      duration: 60,
      tags: ['chemistry', 'biology', 'physics', 'experiments', 'lab-skills', 'scientific-method'],
      categoryId: science.id,
      domainId: school.id,
    },
    {
      title: 'Writing & English',
      slug: 'writing-english-track',
      description: 'Improve writing and English skills - essays to creative writing',
      difficulty: 3,
      duration: 60,
      tags: ['grammar', 'punctuation', 'essays', 'creative-writing', 'reading-comprehension', 'vocabulary'],
      categoryId: writing.id,
      domainId: school.id,
    },
    {
      title: 'History',
      slug: 'history-track',
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

  // Create data & AI categories
  const dataAnalysis = await prisma.category.upsert({
    where: { domainId_slug: { domainId: dataAi.id, slug: 'data-analysis' } },
    update: {},
    create: {
      domainId: dataAi.id,
      name: 'Data Analysis',
      slug: 'data-analysis',
      description: 'Analyze and visualize data with practical tools',
      order: 1,
    },
  })

  const machineLearning = await prisma.category.upsert({
    where: { domainId_slug: { domainId: dataAi.id, slug: 'machine-learning' } },
    update: {},
    create: {
      domainId: dataAi.id,
      name: 'Machine Learning',
      slug: 'machine-learning',
      description: 'Core ML concepts and model-building workflow',
      order: 2,
    },
  })

  const dataAiActivities = [
    {
      title: 'Spreadsheet Analysis Basics',
      slug: 'spreadsheet-analysis-basics',
      description: 'Clean, sort, and summarize data using formulas and pivot tables',
      difficulty: 2,
      duration: 45,
      tags: ['spreadsheets', 'analysis', 'pivot-tables'],
      categoryId: dataAnalysis.id,
      domainId: dataAi.id,
    },
    {
      title: 'SQL for Data Queries',
      slug: 'sql-data-queries',
      description: 'Write SELECT, JOIN, and aggregate queries to answer data questions',
      difficulty: 3,
      duration: 60,
      tags: ['sql', 'queries', 'databases'],
      categoryId: dataAnalysis.id,
      domainId: dataAi.id,
    },
    {
      title: 'Data Visualization Principles',
      slug: 'data-visualization-principles',
      description: 'Choose the right chart type and design clear visual narratives',
      difficulty: 3,
      duration: 50,
      tags: ['charts', 'storytelling', 'dashboards'],
      categoryId: dataAnalysis.id,
      domainId: dataAi.id,
    },
    {
      title: 'ML Problem Framing',
      slug: 'ml-problem-framing',
      description: 'Define target labels, features, and evaluation metrics for ML projects',
      difficulty: 4,
      duration: 60,
      tags: ['ml', 'problem-solving', 'metrics'],
      categoryId: machineLearning.id,
      domainId: dataAi.id,
    },
    {
      title: 'Supervised Learning Foundations',
      slug: 'supervised-learning-foundations',
      description: 'Understand regression and classification workflows end to end',
      difficulty: 4,
      duration: 70,
      tags: ['classification', 'regression', 'training'],
      categoryId: machineLearning.id,
      domainId: dataAi.id,
    },
    {
      title: 'Prompting for AI Assistants',
      slug: 'prompting-ai-assistants',
      description: 'Write effective prompts for research, coding, and content tasks',
      difficulty: 2,
      duration: 35,
      tags: ['genai', 'prompting', 'productivity'],
      categoryId: machineLearning.id,
      domainId: dataAi.id,
    },
  ]

  for (const activity of dataAiActivities) {
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

  // Create business categories
  const entrepreneurship = await prisma.category.upsert({
    where: { domainId_slug: { domainId: business.id, slug: 'entrepreneurship' } },
    update: {},
    create: {
      domainId: business.id,
      name: 'Entrepreneurship',
      slug: 'entrepreneurship',
      description: 'Validate ideas, define audiences, and build go-to-market plans',
      order: 1,
    },
  })

  const finance = await prisma.category.upsert({
    where: { domainId_slug: { domainId: business.id, slug: 'finance' } },
    update: {},
    create: {
      domainId: business.id,
      name: 'Finance',
      slug: 'finance',
      description: 'Build practical budgeting and financial decision-making skills',
      order: 2,
    },
  })

  const businessActivities = [
    {
      title: 'Customer Discovery Interviews',
      slug: 'customer-discovery-interviews',
      description: 'Conduct structured interviews to validate customer pain points',
      difficulty: 3,
      duration: 45,
      tags: ['startup', 'research', 'interviews'],
      categoryId: entrepreneurship.id,
      domainId: business.id,
    },
    {
      title: 'Lean Value Proposition',
      slug: 'lean-value-proposition',
      description: 'Craft a concise value proposition linked to real user outcomes',
      difficulty: 3,
      duration: 40,
      tags: ['value-proposition', 'product', 'messaging'],
      categoryId: entrepreneurship.id,
      domainId: business.id,
    },
    {
      title: 'Go-To-Market Basics',
      slug: 'go-to-market-basics',
      description: 'Outline channels, positioning, and launch milestones',
      difficulty: 4,
      duration: 60,
      tags: ['gtm', 'marketing', 'launch'],
      categoryId: entrepreneurship.id,
      domainId: business.id,
    },
    {
      title: 'Personal Budget System',
      slug: 'personal-budget-system',
      description: 'Set up monthly budget categories and spending controls',
      difficulty: 2,
      duration: 35,
      tags: ['budgeting', 'personal-finance', 'planning'],
      categoryId: finance.id,
      domainId: business.id,
    },
    {
      title: 'Cash Flow Essentials',
      slug: 'cash-flow-essentials',
      description: 'Track inflows and outflows to avoid cash shortfalls',
      difficulty: 3,
      duration: 45,
      tags: ['cash-flow', 'accounting', 'operations'],
      categoryId: finance.id,
      domainId: business.id,
    },
    {
      title: 'Unit Economics Fundamentals',
      slug: 'unit-economics-fundamentals',
      description: 'Use CAC, LTV, and margin metrics for better growth decisions',
      difficulty: 4,
      duration: 55,
      tags: ['unit-economics', 'saas', 'metrics'],
      categoryId: finance.id,
      domainId: business.id,
    },
  ]

  for (const activity of businessActivities) {
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

  // Create design categories
  const uxUi = await prisma.category.upsert({
    where: { domainId_slug: { domainId: design.id, slug: 'ux-ui' } },
    update: {},
    create: {
      domainId: design.id,
      name: 'UX/UI Design',
      slug: 'ux-ui',
      description: 'Design usable, accessible interfaces',
      order: 1,
    },
  })

  const visualDesign = await prisma.category.upsert({
    where: { domainId_slug: { domainId: design.id, slug: 'visual-design' } },
    update: {},
    create: {
      domainId: design.id,
      name: 'Visual Design',
      slug: 'visual-design',
      description: 'Build strong typography, layout, and color systems',
      order: 2,
    },
  })

  const designActivities = [
    {
      title: 'UX Research Fundamentals',
      slug: 'ux-research-fundamentals',
      description: 'Define user goals and collect actionable usability insights',
      difficulty: 2,
      duration: 45,
      tags: ['ux', 'research', 'usability'],
      categoryId: uxUi.id,
      domainId: design.id,
    },
    {
      title: 'Wireframing a User Flow',
      slug: 'wireframing-user-flow',
      description: 'Sketch a complete flow from entry point to completion state',
      difficulty: 3,
      duration: 50,
      tags: ['wireframes', 'flows', 'prototyping'],
      categoryId: uxUi.id,
      domainId: design.id,
    },
    {
      title: 'Accessibility Basics',
      slug: 'accessibility-basics',
      description: 'Apply contrast, focus, and hierarchy principles for inclusive UI',
      difficulty: 3,
      duration: 35,
      tags: ['a11y', 'ui', 'standards'],
      categoryId: uxUi.id,
      domainId: design.id,
    },
    {
      title: 'Typography System Setup',
      slug: 'typography-system-setup',
      description: 'Create readable scales and text styles for digital products',
      difficulty: 2,
      duration: 40,
      tags: ['typography', 'design-system', 'readability'],
      categoryId: visualDesign.id,
      domainId: design.id,
    },
    {
      title: 'Color Palette Strategy',
      slug: 'color-palette-strategy',
      description: 'Build brand-consistent palettes and semantic UI color tokens',
      difficulty: 3,
      duration: 40,
      tags: ['color', 'branding', 'ui'],
      categoryId: visualDesign.id,
      domainId: design.id,
    },
    {
      title: 'Landing Page Composition',
      slug: 'landing-page-composition',
      description: 'Arrange hero, proof, and CTA sections with strong visual rhythm',
      difficulty: 3,
      duration: 55,
      tags: ['layout', 'conversion', 'web-design'],
      categoryId: visualDesign.id,
      domainId: design.id,
    },
  ]

  for (const activity of designActivities) {
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

  // Create cybersecurity categories
  const securityFundamentals = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cybersecurity.id, slug: 'fundamentals' } },
    update: {},
    create: {
      domainId: cybersecurity.id,
      name: 'Security Fundamentals',
      slug: 'fundamentals',
      description: 'Core security concepts, threat models, and defense basics',
      order: 1,
    },
  })

  const secureCoding = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cybersecurity.id, slug: 'secure-coding' } },
    update: {},
    create: {
      domainId: cybersecurity.id,
      name: 'Secure Coding',
      slug: 'secure-coding',
      description: 'Write software resilient to common attack classes',
      order: 2,
    },
  })

  const cybersecurityActivities = [
    {
      title: 'Threat Modeling Basics',
      slug: 'threat-modeling-basics',
      description: 'Identify assets, attack surfaces, and mitigations for an app',
      difficulty: 3,
      duration: 45,
      tags: ['threat-modeling', 'security', 'architecture'],
      categoryId: securityFundamentals.id,
      domainId: cybersecurity.id,
    },
    {
      title: 'Authentication and Authorization',
      slug: 'authn-authz-basics',
      description: 'Understand sessions, tokens, roles, and least-privilege design',
      difficulty: 3,
      duration: 50,
      tags: ['auth', 'rbac', 'identity'],
      categoryId: securityFundamentals.id,
      domainId: cybersecurity.id,
    },
    {
      title: 'Network Security Essentials',
      slug: 'network-security-essentials',
      description: 'Learn TLS, firewalls, and secure network segmentation basics',
      difficulty: 4,
      duration: 60,
      tags: ['networking', 'tls', 'defense'],
      categoryId: securityFundamentals.id,
      domainId: cybersecurity.id,
    },
    {
      title: 'OWASP Top 10 Walkthrough',
      slug: 'owasp-top-10-walkthrough',
      description: 'Review common web vulnerabilities and practical safeguards',
      difficulty: 4,
      duration: 70,
      tags: ['owasp', 'web-security', 'vulnerabilities'],
      categoryId: secureCoding.id,
      domainId: cybersecurity.id,
    },
    {
      title: 'Input Validation and Sanitization',
      slug: 'input-validation-sanitization',
      description: 'Prevent injection attacks with robust validation boundaries',
      difficulty: 3,
      duration: 40,
      tags: ['validation', 'injection', 'secure-code'],
      categoryId: secureCoding.id,
      domainId: cybersecurity.id,
    },
    {
      title: 'Secure Secrets Management',
      slug: 'secure-secrets-management',
      description: 'Store and rotate API keys and credentials safely',
      difficulty: 3,
      duration: 35,
      tags: ['secrets', 'devops', 'security'],
      categoryId: secureCoding.id,
      domainId: cybersecurity.id,
    },
  ]

  for (const activity of cybersecurityActivities) {
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

  // Create productivity categories
  const projectManagement = await prisma.category.upsert({
    where: { domainId_slug: { domainId: productivity.id, slug: 'project-management' } },
    update: {},
    create: {
      domainId: productivity.id,
      name: 'Project Management',
      slug: 'project-management',
      description: 'Plan work, manage scope, and deliver predictable outcomes',
      order: 1,
    },
  })

  const communication = await prisma.category.upsert({
    where: { domainId_slug: { domainId: productivity.id, slug: 'communication' } },
    update: {},
    create: {
      domainId: productivity.id,
      name: 'Communication',
      slug: 'communication',
      description: 'Write and speak clearly across teams and stakeholders',
      order: 2,
    },
  })

  const productivityActivities = [
    {
      title: 'Weekly Planning Ritual',
      slug: 'weekly-planning-ritual',
      description: 'Design a repeatable weekly review and planning routine',
      difficulty: 1,
      duration: 30,
      tags: ['planning', 'weekly-review', 'focus'],
      categoryId: projectManagement.id,
      domainId: productivity.id,
    },
    {
      title: 'Kanban Workflow Setup',
      slug: 'kanban-workflow-setup',
      description: 'Create a practical board with WIP limits and clear status flow',
      difficulty: 2,
      duration: 40,
      tags: ['kanban', 'workflow', 'execution'],
      categoryId: projectManagement.id,
      domainId: productivity.id,
    },
    {
      title: 'Goal Breakdown with Milestones',
      slug: 'goal-breakdown-milestones',
      description: 'Turn large goals into measurable milestones and next actions',
      difficulty: 2,
      duration: 35,
      tags: ['goals', 'milestones', 'delivery'],
      categoryId: projectManagement.id,
      domainId: productivity.id,
    },
    {
      title: 'Clear Status Updates',
      slug: 'clear-status-updates',
      description: 'Write concise updates with context, progress, and blockers',
      difficulty: 2,
      duration: 25,
      tags: ['writing', 'teamwork', 'status'],
      categoryId: communication.id,
      domainId: productivity.id,
    },
    {
      title: 'Meeting Facilitation Basics',
      slug: 'meeting-facilitation-basics',
      description: 'Run focused meetings with agendas, ownership, and follow-ups',
      difficulty: 2,
      duration: 35,
      tags: ['meetings', 'facilitation', 'leadership'],
      categoryId: communication.id,
      domainId: productivity.id,
    },
    {
      title: 'Presentation Story Structure',
      slug: 'presentation-story-structure',
      description: 'Build presentations with a clear narrative and strong takeaway',
      difficulty: 3,
      duration: 45,
      tags: ['presentations', 'storytelling', 'communication'],
      categoryId: communication.id,
      domainId: productivity.id,
    },
  ]

  for (const activity of productivityActivities) {
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

  // Expand subject coverage with additional broad tracks.
  const extraProgrammingTracks = [
    {
      title: 'PHP',
      slug: 'php-track',
      description: 'Build dynamic web applications with modern PHP',
      difficulty: 3,
      duration: 60,
      tags: ['php', 'web', 'backend', 'apis'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'C#',
      slug: 'csharp-track',
      description: 'Learn C# fundamentals for desktop, web, and game development',
      difficulty: 3,
      duration: 65,
      tags: ['c#', 'dotnet', 'oop', 'backend'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'Kotlin',
      slug: 'kotlin-track',
      description: 'Learn Kotlin for modern Android and backend development',
      difficulty: 3,
      duration: 60,
      tags: ['kotlin', 'android', 'jvm', 'mobile'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
    {
      title: 'Swift',
      slug: 'swift-track',
      description: 'Learn Swift language basics for iOS development',
      difficulty: 3,
      duration: 60,
      tags: ['swift', 'ios', 'mobile', 'apple'],
      categoryId: programmingLanguages.id,
      domainId: programming.id,
    },
  ]

  for (const activity of extraProgrammingTracks) {
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

  const koreanCuisine = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'korean' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Korean Cuisine',
      slug: 'korean',
      description: 'Korean flavors, fermentation, and staple dishes',
      order: 9,
    },
  })

  const mediterraneanCuisine = await prisma.category.upsert({
    where: { domainId_slug: { domainId: cooking.id, slug: 'mediterranean' } },
    update: {},
    create: {
      domainId: cooking.id,
      name: 'Mediterranean Cuisine',
      slug: 'mediterranean',
      description: 'Mediterranean ingredients and heart-healthy cooking basics',
      order: 10,
    },
  })

  const extraCookingTracks = [
    {
      title: 'Korean Cooking',
      slug: 'korean-cooking-track',
      description: 'Learn banchan, stews, marinades, and Korean home-cooking structure',
      difficulty: 3,
      duration: 60,
      tags: ['korean', 'fermentation', 'stews', 'rice'],
      categoryId: koreanCuisine.id,
      domainId: cooking.id,
    },
    {
      title: 'Mediterranean Cooking',
      slug: 'mediterranean-cooking-track',
      description: 'Cook balanced Mediterranean meals with grains, seafood, and vegetables',
      difficulty: 2,
      duration: 55,
      tags: ['mediterranean', 'healthy', 'olive-oil', 'seafood'],
      categoryId: mediterraneanCuisine.id,
      domainId: cooking.id,
    },
  ]

  for (const activity of extraCookingTracks) {
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

  const italianLanguage = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'italian' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'Italian',
      slug: 'italian',
      description: 'Italian communication and grammar foundations',
      order: 10,
    },
  })

  const russianLanguage = await prisma.category.upsert({
    where: { domainId_slug: { domainId: languages.id, slug: 'russian' } },
    update: {},
    create: {
      domainId: languages.id,
      name: 'Russian',
      slug: 'russian',
      description: 'Russian alphabet, pronunciation, and conversation basics',
      order: 11,
    },
  })

  const extraLanguageSubjects = [
    {
      title: 'Italian',
      slug: 'italian-track',
      description: 'Learn Italian greetings, grammar, and conversation for travel and study',
      difficulty: 3,
      duration: 60,
      tags: ['italian', 'conversation', 'grammar', 'travel'],
      categoryId: italianLanguage.id,
      domainId: languages.id,
    },
    {
      title: 'Russian',
      slug: 'russian-track',
      description: 'Learn Cyrillic reading, pronunciation, and practical Russian phrases',
      difficulty: 4,
      duration: 65,
      tags: ['russian', 'cyrillic', 'pronunciation', 'conversation'],
      categoryId: russianLanguage.id,
      domainId: languages.id,
    },
  ]

  for (const activity of extraLanguageSubjects) {
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

  const physics = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'physics' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Physics',
      slug: 'physics',
      description: 'Mechanics, motion, energy, and electricity fundamentals',
      order: 8,
    },
  })

  const chemistry = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'chemistry' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Chemistry',
      slug: 'chemistry',
      description: 'Atoms, reactions, stoichiometry, and lab thinking',
      order: 9,
    },
  })

  const biology = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'biology' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Biology',
      slug: 'biology',
      description: 'Cells, genetics, ecosystems, and life science foundations',
      order: 10,
    },
  })

  const economics = await prisma.category.upsert({
    where: { domainId_slug: { domainId: school.id, slug: 'economics' } },
    update: {},
    create: {
      domainId: school.id,
      name: 'Economics',
      slug: 'economics',
      description: 'Micro and macro economics basics for students',
      order: 11,
    },
  })

  const extraSchoolSubjects = [
    {
      title: 'Physics',
      slug: 'physics-track',
      description: 'Learn motion, forces, energy, and basic problem-solving in physics',
      difficulty: 4,
      duration: 65,
      tags: ['physics', 'mechanics', 'energy', 'equations'],
      categoryId: physics.id,
      domainId: school.id,
    },
    {
      title: 'Chemistry',
      slug: 'chemistry-track',
      description: 'Understand atoms, chemical reactions, and foundational lab concepts',
      difficulty: 4,
      duration: 65,
      tags: ['chemistry', 'atoms', 'reactions', 'stoichiometry'],
      categoryId: chemistry.id,
      domainId: school.id,
    },
    {
      title: 'Biology',
      slug: 'biology-track',
      description: 'Explore cell biology, genetics, and living systems',
      difficulty: 3,
      duration: 60,
      tags: ['biology', 'cells', 'genetics', 'ecosystems'],
      categoryId: biology.id,
      domainId: school.id,
    },
    {
      title: 'Economics',
      slug: 'economics-track',
      description: 'Learn supply-demand, markets, incentives, and economic policy basics',
      difficulty: 3,
      duration: 55,
      tags: ['economics', 'microeconomics', 'macroeconomics', 'markets'],
      categoryId: economics.id,
      domainId: school.id,
    },
  ]

  for (const activity of extraSchoolSubjects) {
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

  const danceFitness = await prisma.category.upsert({
    where: { domainId_slug: { domainId: fitness.id, slug: 'dance-fitness' } },
    update: {},
    create: {
      domainId: fitness.id,
      name: 'Dance Fitness',
      slug: 'dance-fitness',
      description: 'Cardio dance routines for endurance and coordination',
      order: 7,
    },
  })

  const calisthenics = await prisma.category.upsert({
    where: { domainId_slug: { domainId: fitness.id, slug: 'calisthenics' } },
    update: {},
    create: {
      domainId: fitness.id,
      name: 'Calisthenics',
      slug: 'calisthenics',
      description: 'Bodyweight training progression for strength and control',
      order: 8,
    },
  })

  const extraFitnessSubjects = [
    {
      title: 'Dance Fitness',
      slug: 'dance-fitness-track',
      description: 'Use dance-based workouts to improve cardio and coordination',
      difficulty: 2,
      duration: 40,
      tags: ['dance', 'cardio', 'coordination', 'endurance'],
      categoryId: danceFitness.id,
      domainId: fitness.id,
    },
    {
      title: 'Calisthenics',
      slug: 'calisthenics-track',
      description: 'Build bodyweight strength with progressions for push, pull, and core',
      difficulty: 3,
      duration: 50,
      tags: ['calisthenics', 'bodyweight', 'strength', 'skills'],
      categoryId: calisthenics.id,
      domainId: fitness.id,
    },
  ]

  for (const activity of extraFitnessSubjects) {
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

  const piano = await prisma.category.upsert({
    where: { domainId_slug: { domainId: music.id, slug: 'piano' } },
    update: {},
    create: {
      domainId: music.id,
      name: 'Piano',
      slug: 'piano',
      description: 'Piano basics, hand coordination, and repertoire building',
      order: 2,
    },
  })

  const musicTheory = await prisma.category.upsert({
    where: { domainId_slug: { domainId: music.id, slug: 'music-theory' } },
    update: {},
    create: {
      domainId: music.id,
      name: 'Music Theory',
      slug: 'music-theory',
      description: 'Understand rhythm, harmony, and composition fundamentals',
      order: 3,
    },
  })

  const extraMusicSubjects = [
    {
      title: 'Piano',
      slug: 'piano-track',
      description: 'Learn basic chords, scales, and beginner song accompaniment on piano',
      difficulty: 2,
      duration: 45,
      tags: ['piano', 'chords', 'scales', 'coordination'],
      categoryId: piano.id,
      domainId: music.id,
    },
    {
      title: 'Music Theory',
      slug: 'music-theory-track',
      description: 'Learn notes, intervals, chords, and rhythm patterns for any instrument',
      difficulty: 3,
      duration: 50,
      tags: ['theory', 'harmony', 'rhythm', 'composition'],
      categoryId: musicTheory.id,
      domainId: music.id,
    },
  ]

  for (const activity of extraMusicSubjects) {
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

  const domainCount = await prisma.domain.count()
  const categoryCount = await prisma.category.count()
  const activityCount = await prisma.activity.count()

  console.log('✅ Database seed completed successfully!')
  console.log(`   - ${domainCount} domains created`)
  console.log(`   - ${categoryCount} categories created`)
  console.log(`   - ${activityCount} activities created`)
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
