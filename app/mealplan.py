from app.sql import *
from . import ureg
from app.util import online_stats

from itertools import accumulate
import math
from bisect import bisect
from functools import lru_cache
from random import randrange


def find_meals(
    db, budget, total_calories, min_ingredients=None, max_ingredients=None,
):
    if not min_ingredients:
        min_ingredients = {}

    if not max_ingredients:
        max_ingredients = {}

    budget_left = budget
    calories_needed = total_calories

    recipes = fetch_recipes(db)

    minimum_plan_cost = (
        math.ceil(calories_needed / recipes[0].calories) * recipes[0].cost
    )
    if minimum_plan_cost > budget:
        raise ValueError("Not enough money")

    means, variances = online_stats([r.costPerCalorie for r in recipes])
    price_cutoffs = [mean + 2 * math.sqrt(var) for mean, var in zip(means, variances)]

    @lru_cache(maxsize=8)
    def max_search_index(price):
        return bisect(price_cutoffs, price)

    meal_selections = []
    max_iterations = 1_000
    n = 0

    print(f"Need to find {total_calories} calories for ${budget} or less")

    # crossing fingers that this converges
    while budget_left < 0 or calories_needed > 0:
        print(n)
        if n == max_iterations:
            raise RuntimeError(f"Could not create recipe within {n} iterations")

        n += 1

        i = max_search_index(budget_left / calories_needed)
        if i == 0 or budget_left < 0:
            recipe_to_remove = meal_selections.pop()
            calories_needed += recipes[recipe_to_remove].calories
            budget_left += recipes[recipe_to_remove].cost

        else:
            new_meal = randrange(i)
            calories_needed -= recipes[new_meal].calories
            budget_left -= recipes[new_meal].cost
            meal_selections.append(new_meal)

        print(f"budget left: {budget_left}")
        print(f"calories needed: {calories_needed}")

    # TODO: fulfill other constraints
    return [recipes[i] for i in meal_selections]
