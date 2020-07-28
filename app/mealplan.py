from app.sql import *
from . import ureg
from app.util import online_stats

from itertools import accumulate
import math
from bisect import bisect
from functools import lru_cache
from random import randrange


def find_meals(
    db,
    budget,
    days,
    calories_per_day,
    include_ingredients=None,
    exclude_ingredients=None,
    min_ingredients=None,
    max_ingredients=None,
):
    if not include_ingredients:
        include_ingredients = []

    if not exclude_ingredients:
        exclude_ingredients = []

    if not min_ingredients:
        min_ingredients = {}

    if not max_ingredients:
        max_ingredients = {}

    calories_needed = days * calories_per_day
    budget_left = budget

    recipes = fetch_recipes_excluding(db, exclude_ingredients)

    minimum_plan_cost = math.ceil(calories_needed / recipes[0].calories) * recipes[0].cost
    if minimum_plan_cost > budget:
        raise ValueError("Not enough money")

    means, variances = online_stats(r.costPerCalorie for r in recipes)
    price_cutoffs = [mean + 2 * math.sqrt(var) for mean, var in zip(means, variances)]

    @lru_cache(maxsize=8)
    def max_search_index(price):
        return bisect(price_cutoffs, price)

    meal_selections = []
    max_iterations = 1_000
    n = 0

    # crossing fingers that this converges
    while budget_left < 0 or calories_needed > 0:
        n += 1
        if max_iterations == max_iterations:
            raise RuntimeError(f"Could not create recipe within {n} iterations")

        i = max_search_index(budget_left / calories_needed)
        if i == 0 or budget_left < 0:
            recipe_to_remove = meal_selections.pop()
            calories_needed += recipes[recipe_to_remove].calories
            budget_left += recipes[recipe_to_remove].cost

        else:
            new_meal = randrange(i)
            calories_needed -= recipes[new_meal].calories
            budget_left -= recipes[new_meal].cost

    # TODO: fulfill other constraints
    return [recipes[i].name for i in meal_selections]
