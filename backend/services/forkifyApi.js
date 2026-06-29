const axios = require("axios");
const { wrapForkifyError } = require("../utils/apiErrors");

const FORKIFY_URL =
  process.env.RECIPE_API_URL || "https://forkify-api.herokuapp.com/api/v2/recipes";

async function searchForkify(query) {
  try {
    const { data } = await axios.get(FORKIFY_URL, { params: { search: query } });
    if (!data?.data?.recipes) {
      throw new Error("Invalid response from Forkify search API");
    }
    return data.data.recipes;
  } catch (error) {
    throw wrapForkifyError(error);
  }
}

async function fetchForkifyRecipe(id) {
  try {
    const { data } = await axios.get(`${FORKIFY_URL}/${id}`);
    if (!data?.data?.recipe) {
      throw new Error("Recipe not found on Forkify");
    }
    return data.data.recipe;
  } catch (error) {
    throw wrapForkifyError(error);
  }
}

module.exports = { searchForkify, fetchForkifyRecipe };
