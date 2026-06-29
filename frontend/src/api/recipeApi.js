const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function readErrorMessage(response, fallback) {
  const data = await response.json().catch(() => ({}));
  return data.message || fallback;
}

async function apiFetch(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  return response;
}

export async function login(email, password) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 400 || response.status === 401) {
      throw new Error("Invalid credentials");
    }
    throw new Error(data.message || "Login failed. Please try again later.");
  }

  if (!data?.user) {
    throw new Error("Invalid response from server");
  }

  return data;
}

export async function register(username, email, password) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
}

export async function searchRecipes(query) {
  const response = await apiFetch(
    `/recipes/search?q=${encodeURIComponent(query)}`
  );

  if (!response.ok) {
    throw new Error(await readErrorMessage(response, "Failed to fetch recipes"));
  }

  const data = await response.json();
  return data.data?.recipes || [];
}

export async function getRecipeById(id) {
  if (!id) throw new Error("ID is required to fetch a recipe");

  const response = await apiFetch(`/recipes/${id}`);

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to fetch recipe details")
    );
  }

  const data = await response.json();
  return data.data.recipe;
}

export async function getPantryMatches(ingredients, preferences = {}) {
  const response = await apiFetch("/recommendations/pantry", {
    method: "POST",
    body: JSON.stringify({ ingredients, preferences }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Failed to match pantry ingredients");
  }

  return data.matches || [];
}

export async function generateMealPlan(numDays = 7, preferences = {}) {
  const response = await apiFetch("/recommendations/meal-plan", {
    method: "POST",
    body: JSON.stringify({ numDays, preferences }),
  });

  if (!response.ok) {
    throw new Error(
      await readErrorMessage(response, "Failed to generate meal plan")
    );
  }

  const data = await response.json();
  return { mealPlan: data.mealPlan, warning: data.warning || null };
}

export async function getLatestMealPlan() {
  const response = await apiFetch("/recommendations/meal-plan");

  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Failed to fetch meal plan");

  const data = await response.json();
  return data.mealPlan;
}

export async function checkBookmark(recipeId) {
  const response = await apiFetch(`/bookmarks/check/${recipeId}`);

  if (!response.ok) return false;
  const data = await response.json();
  return data.isBookmarked;
}

export async function addBookmark(recipeId) {
  const response = await apiFetch("/bookmarks", {
    method: "POST",
    body: JSON.stringify({ recipeId }),
  });

  if (!response.ok) throw new Error("Failed to bookmark recipe");
}

export async function removeBookmark(recipeId) {
  const response = await apiFetch(`/bookmarks/${recipeId}`, {
    method: "DELETE",
  });

  if (!response.ok) throw new Error("Failed to remove bookmark");
}

export async function getBookmarks() {
  const response = await apiFetch("/bookmarks");

  if (!response.ok) throw new Error("Failed to fetch bookmarks");

  return response.json();
}
