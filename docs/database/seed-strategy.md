# FitForge Seed Strategy

## Objectives

Seed data must make a fresh development database immediately useful without creating fake production users or relying on unstable third-party APIs.

## Seed layers

### 1. Reference catalogue

Safe in every environment and idempotent:
- dietary preferences
- allergens
- food categories
- equipment
- muscle groups
- exercise categories
- recipe tags

Use stable, human-readable seed keys or deterministic UUIDs. Upsert by slug or code.

### 2. Curated shared content

Development, preview and production may receive curated public content:
- common South African-friendly foods
- starter recipes
- approved exercise catalogue
- approved media and attribution records

Every media record must include provider, source URL, creator, licence and verification date when applicable. Do not seed downloaded copies of third-party images unless the licence explicitly permits redistribution.

### 3. Demo persona

Development and preview only:
- demo account reference compatible with Better Auth
- Thabo-style body-recomposition profile
- 140–160 g protein target
- 2.5 L water target
- 10,000 step target
- 5 g creatine target
- four-day dumbbell plan
- seven-day meal plan
- sample measurements and push-up record progression

Production must not seed a login-capable demo identity. A separate opt-in demo environment can be created later.

## Initial catalogue targets

### Foods

Start with 35–50 entries covering:
- chicken breast and skinless thighs
- lean beef mince and steak
- hake and tuna
- eggs
- Greek yoghurt, cottage cheese, milk and maas
- beans and lentils
- oats, rice, potatoes, sweet potatoes, wholewheat bread and wraps
- bananas, apples and berries
- spinach, broccoli and mixed vegetables
- peanut butter and controlled portions of nuts
- whey protein as a generic supplement food entry

Nutrition values must state their serving basis. Values should come from a documented food-composition source before production release.

### Recipes

Seed 12–18 recipes spanning:
- breakfast
- snack
- lunch
- pre-workout
- post-workout
- dinner

Each recipe includes ingredients, ordered steps, servings, preparation time, calculated or reviewed nutrition and goal tags.

### Exercises

Seed the complete four-day starter programme plus alternatives:
- push-ups and close-grip push-ups
- dumbbell floor press and flyes
- overhead triceps extension
- one-arm rows and reverse flyes
- biceps, hammer and Zottman curls
- shoulder press, lateral raises and rear-delt flyes
- squats, lunges, Romanian deadlifts and calf raises
- plank, leg raises, bicycle crunches, side knee raises and mountain climbers

Each exercise includes instructions, common mistakes, difficulty, primary and secondary muscles, equipment and approved media metadata.

## Idempotency

- Upsert reference and catalogue rows using unique slugs.
- Resolve generated IDs after each upsert before creating link-table rows.
- Replace child collections transactionally for curated records where appropriate.
- Never delete user-owned records from a general seed command.
- Separate `seed:catalogue` from `seed:demo` commands.

## Proposed commands

```json
{
  "db:seed": "npm run db:seed:catalogue && npm run db:seed:demo",
  "db:seed:catalogue": "tsx src/db/seed/catalogue.ts",
  "db:seed:demo": "tsx src/db/seed/demo.ts"
}
```

The demo command must refuse to run when `NODE_ENV=production` unless an explicit override is provided.

## Validation

After seeding, run assertions for:
- expected reference counts
- no duplicate slugs
- every published recipe has at least one ingredient and step
- every active exercise has a primary muscle group
- every externally sourced media asset has attribution metadata
- the demo plan reaches the expected number of days and entries
