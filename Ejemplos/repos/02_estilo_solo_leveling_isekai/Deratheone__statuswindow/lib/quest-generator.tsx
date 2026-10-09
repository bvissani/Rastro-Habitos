// Quest generator functions

// Generate a random ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15)
}

// Generate a random number between min and max
const randomNumber = (min: number, max: number) => {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Quest templates
const questTemplates = {
  strength: [
    {
      title: "Guerrero del Entrenamiento",
      description: "Completa una serie de entrenamientos físicos para aumentar tu fuerza.",
      targetRange: [3, 7],
      rewardRange: [5, 10],
      xpRewardRange: [50, 100],
    },
    {
      title: "Desafío de Resistencia",
      description: "Supera tus límites físicos con actividades de resistencia.",
      targetRange: [2, 5],
      rewardRange: [7, 12],
      xpRewardRange: [70, 120],
    },
    {
      title: "Entrenamiento de Fuerza",
      description: "Construye músculo y mejora tus capacidades físicas.",
      targetRange: [4, 8],
      rewardRange: [6, 11],
      xpRewardRange: [60, 110],
    },
  ],
  intelligence: [
    {
      title: "Buscador de Conocimiento",
      description: "Expande tu mente a través del aprendizaje y el estudio.",
      targetRange: [3, 7],
      rewardRange: [5, 10],
      xpRewardRange: [50, 100],
    },
    {
      title: "Lector Incansable",
      description: "Lee y absorbe nueva información para aumentar tu inteligencia.",
      targetRange: [2, 5],
      rewardRange: [7, 12],
      xpRewardRange: [70, 120],
    },
    {
      title: "Desafío Mental",
      description: "Resuelve problemas y acertijos para afilar tu mente.",
      targetRange: [4, 8],
      rewardRange: [6, 11],
      xpRewardRange: [60, 110],
    },
  ],
  mana: [
    {
      title: "Paz Interior",
      description: "Practica atención plena y meditación para restaurar tu maná.",
      targetRange: [3, 7],
      rewardRange: [5, 10],
      xpRewardRange: [50, 100],
    },
    {
      title: "Ritual de Autocuidado",
      description: "Dedica tiempo al autocuidado para rejuvenecer tu espíritu.",
      targetRange: [2, 5],
      rewardRange: [7, 12],
      xpRewardRange: [70, 120],
    },
    {
      title: "Crecimiento Espiritual",
      description: "Participa en actividades que nutran tu bienestar interior.",
      targetRange: [4, 8],
      rewardRange: [6, 11],
      xpRewardRange: [60, 110],
    },
  ],
}

// Generate a quest based on type and user level
const generateQuest = (type: "strength" | "intelligence" | "mana", userLevel: number) => {
  const templates = questTemplates[type]
  const template = templates[Math.floor(Math.random() * templates.length)]

  // Scale difficulty based on user level
  const levelMultiplier = 1 + (userLevel - 1) * 0.2 // 20% increase per level

  const target = Math.round(randomNumber(template.targetRange[0], template.targetRange[1]) * levelMultiplier)
  const reward = Math.round(randomNumber(template.rewardRange[0], template.rewardRange[1]) * levelMultiplier)
  const xpReward = Math.round(randomNumber(template.xpRewardRange[0], template.xpRewardRange[1]) * levelMultiplier)

  return {
    id: generateId(),
    title: template.title,
    description: template.description,
    type,
    target,
    progress: 0,
    reward,
    xpReward,
    completed: false,
    createdAt: new Date().toISOString(),
  }
}

// Generate default quests for a new user
export const generateDefaultQuests = (userData: any) => {
  const userLevel = userData.level || 1
  const quests = []

  // Generate 2 quests for each stat type
  for (let i = 0; i < 2; i++) {
    quests.push(generateQuest("strength", userLevel))
    quests.push(generateQuest("intelligence", userLevel))
    quests.push(generateQuest("mana", userLevel))
  }

  return quests
}
