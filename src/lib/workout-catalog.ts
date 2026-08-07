export type StarterExercise = {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  instructions: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  movementPattern:
    | "push"
    | "pull"
    | "squat"
    | "hinge"
    | "lunge"
    | "rotation"
    | "anti_rotation"
    | "isolation";
  equipment: string[];
};

export const starterExercises: StarterExercise[] = [
  {
    slug: "push-up",
    name: "Push-up",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Keep a straight body line, lower under control, then press the floor away.",
    difficulty: "beginner",
    movementPattern: "push",
    equipment: ["bodyweight"],
  },
  {
    slug: "dumbbell-floor-press",
    name: "Dumbbell Floor Press",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Lie on the floor, brace your torso, lower the dumbbells with control and press up.",
    difficulty: "beginner",
    movementPattern: "push",
    equipment: ["dumbbells"],
  },
  {
    slug: "dumbbell-row",
    name: "Dumbbell Row",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Brace your torso and pull the dumbbell toward your hip without twisting your trunk.",
    difficulty: "beginner",
    movementPattern: "pull",
    equipment: ["dumbbells"],
  },
  {
    slug: "reverse-fly",
    name: "Reverse Fly",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Hinge slightly, keep a soft elbow bend and open the arms until the upper back contracts.",
    difficulty: "beginner",
    movementPattern: "pull",
    equipment: ["dumbbells", "resistance-bands"],
  },
  {
    slug: "biceps-curl",
    name: "Biceps Curl",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Keep your elbows close to your sides and curl without swinging your torso.",
    difficulty: "beginner",
    movementPattern: "isolation",
    equipment: ["dumbbells", "resistance-bands"],
  },
  {
    slug: "shoulder-press",
    name: "Shoulder Press",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Brace your core and press the weights overhead without overextending your lower back.",
    difficulty: "beginner",
    movementPattern: "push",
    equipment: ["dumbbells", "barbell"],
  },
  {
    slug: "lateral-raise",
    name: "Lateral Raise",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Raise the weights to about shoulder height with control and avoid shrugging.",
    difficulty: "beginner",
    movementPattern: "isolation",
    equipment: ["dumbbells", "resistance-bands"],
  },
  {
    slug: "bodyweight-squat",
    name: "Bodyweight Squat",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Sit down between your hips while keeping your feet planted and knees tracking over your toes.",
    difficulty: "beginner",
    movementPattern: "squat",
    equipment: ["bodyweight"],
  },
  {
    slug: "goblet-squat",
    name: "Goblet Squat",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Hold one dumbbell close to your chest, squat under control and drive through the floor.",
    difficulty: "beginner",
    movementPattern: "squat",
    equipment: ["dumbbells"],
  },
  {
    slug: "romanian-deadlift",
    name: "Romanian Deadlift",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Push the hips back with a neutral spine, keep the load close, then stand tall by extending the hips.",
    difficulty: "intermediate",
    movementPattern: "hinge",
    equipment: ["dumbbells", "barbell"],
  },
  {
    slug: "reverse-lunge",
    name: "Reverse Lunge",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Step back into a controlled lunge and drive through the front foot to return to standing.",
    difficulty: "beginner",
    movementPattern: "lunge",
    equipment: ["bodyweight", "dumbbells"],
  },
  {
    slug: "calf-raise",
    name: "Calf Raise",
    category: "strength",
    categoryLabel: "Strength",
    instructions: "Rise onto the balls of your feet, pause briefly at the top and lower under control.",
    difficulty: "beginner",
    movementPattern: "isolation",
    equipment: ["bodyweight", "dumbbells"],
  },
  {
    slug: "plank",
    name: "Plank",
    category: "core",
    categoryLabel: "Core",
    instructions: "Brace your trunk and keep your head, ribs, hips and heels in a straight line.",
    difficulty: "beginner",
    movementPattern: "anti_rotation",
    equipment: ["bodyweight"],
  },
  {
    slug: "bicycle-crunch",
    name: "Bicycle Crunch",
    category: "core",
    categoryLabel: "Core",
    instructions: "Rotate through the trunk slowly while alternating the knees; avoid pulling on your neck.",
    difficulty: "beginner",
    movementPattern: "rotation",
    equipment: ["bodyweight"],
  },
];

export type WorkoutTemplateDay = {
  name: string;
  focus: string[];
};

export function getWorkoutTemplate(daysPerWeek: number): WorkoutTemplateDay[] {
  const templates: Record<number, WorkoutTemplateDay[]> = {
    1: [{ name: "Full Body", focus: ["push", "pull", "legs", "core"] }],
    2: [
      { name: "Upper Body", focus: ["push", "pull", "arms"] },
      { name: "Lower Body + Core", focus: ["legs", "core"] },
    ],
    3: [
      { name: "Push", focus: ["push"] },
      { name: "Pull", focus: ["pull", "arms"] },
      { name: "Legs + Core", focus: ["legs", "core"] },
    ],
    4: [
      { name: "Upper A", focus: ["push", "pull"] },
      { name: "Lower A", focus: ["legs", "core"] },
      { name: "Upper B", focus: ["push", "pull", "arms"] },
      { name: "Lower B", focus: ["legs", "core"] },
    ],
    5: [
      { name: "Push", focus: ["push"] },
      { name: "Pull", focus: ["pull", "arms"] },
      { name: "Legs", focus: ["legs"] },
      { name: "Upper", focus: ["push", "pull"] },
      { name: "Lower + Core", focus: ["legs", "core"] },
    ],
    6: [
      { name: "Push A", focus: ["push"] },
      { name: "Pull A", focus: ["pull", "arms"] },
      { name: "Legs A", focus: ["legs", "core"] },
      { name: "Push B", focus: ["push"] },
      { name: "Pull B", focus: ["pull", "arms"] },
      { name: "Legs B", focus: ["legs", "core"] },
    ],
    7: [
      { name: "Push A", focus: ["push"] },
      { name: "Pull A", focus: ["pull", "arms"] },
      { name: "Legs A", focus: ["legs"] },
      { name: "Push B", focus: ["push"] },
      { name: "Pull B", focus: ["pull", "arms"] },
      { name: "Legs B", focus: ["legs"] },
      { name: "Core + Mobility", focus: ["core"] },
    ],
  };

  return templates[Math.min(Math.max(daysPerWeek, 1), 7)];
}
