# RecipeHub

A full-stack, **Dockerized** **MERN** recipe platform powered by the [Forkify API](https://forkify-api.herokuapp.com/). Search recipes, match what is in your pantry, plan weekly meals, and save favourites. It has optional diet, allergy, and cuisine filters on every search flow.

![Stack](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![Stack](https://img.shields.io/badge/Express-000000?logo=express&logoColor=white)
![Stack](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white)
![Stack](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Stack](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

---

## Highlights

| Area               | What you get                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------- |
| **Recipe search**  | Live Forkify search with (30-day freshness)caching                                                            |
| **Pantry matcher** | Search for dishes with existing ingredients in your kitchen. View ingredient overlap scoring with **% match** |
| **Meal planner**   | **3–7 day** meal plans with diversity-aware selection                                                         |
| **Filters**        | Filter through with: 4 diets · 3 allergies · 8 cuisines applied per request                                   |

---

## Output & scoring

RecipeHub surfaces **quantified results** so users can compare options at a glance:

### Pantry matcher - Cook with what you have

- **Match Percent**: between **0–100%** ingredient match score, ranked highest first
- **Matched Ingredients**: list of pantry items found in the recipe
- **Missing Ingredients**: list of recipe items not covered by the pantry
- Up to **10** ranked matches returned per search

### Meal planner - Weekly Meal Planner

- Configurable : Upto **3–7** Days
- Select **cuisines, alergies and/or diet restrictions**
- View and **bookmark meals**

### Recipe detail

- **Servings** with **+/- scaling** on ingredients per person
- **Paginated** search results: **6 recipes per page**

## Tech stack

| Layer        | Technologies                               |
| ------------ | ------------------------------------------ |
| Frontend     | React, Vite, Tailwind CSS, Lucide icons |
| Backend      | Node.js, Express, Mongoose, JWT auth       |
| Database     | MongoDB                                   |
| External API | Forkify (free tier)                        |
| Containers   | Docker                                     |

#

### 1. Quick Start

```bash
docker compose up --build
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173
