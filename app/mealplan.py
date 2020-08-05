from app.sql import *
from . import ureg
from app.util import online_stats
from app.btree import BPlusTree

from itertools import accumulate
import math
from bisect import bisect
from functools import lru_cache
from random import randrange, shuffle, choice

import attr
from pint import DimensionalityError


@attr.s
class MealPlanner:
    meal_selections = attr.ib(init=False, default=attr.Factory(list))
    budget_left = attr.ib()
    calories_needed = attr.ib()
    min_ingredients = attr.ib(default=attr.Factory(dict))
    max_ingredients = attr.ib(default=attr.Factory(dict))


def check_plan(db, meals, budget, cals, min_ingredients=None, max_ingredients=None):
    assert sum(m.cost for m in meals) <= budget
    assert sum(m.calories for m in meals) >= cals
    if min_ingredients or max_ingredients:
        ingredient_map = fetch_ingredients_for_recipes(db)
        if min_ingredients:
            for ing, amount in min_ingredients.items():
                s = 0
                for r in meals:
                    try:
                        s += ingredient_map[r.name].get(ing, 0)
                    except:
                        pass
                assert s >= amount

        if max_ingredients:
            for ing, amount in max_ingredients.items():
                s = 0
                for r in meals:
                    try:
                        s += ingredient_map[r.name].get(ing, 0)
                    except:
                        pass
                assert s <= amount


def find_meals(
    db, budget, total_calories, min_ingredients=None, max_ingredients=None,
):
    if not min_ingredients:
        min_ingredients = {}

    if not max_ingredients:
        max_ingredients = {}

    budget_left = budget
    calories_needed = total_calories

    planner = MealPlanner(
        budget_left, calories_needed, min_ingredients.copy(), max_ingredients.copy()
    )

    includes = [ing for ing, amount in min_ingredients.items() if amount.magnitude > 0]
    excludes = [ing for ing, amount in max_ingredients.items() if amount.magnitude == 0]

    recipes = fetch_recipes(db, excludes)

    minimum_plan_cost = (
        math.ceil(calories_needed / (recipes[0].calories or 100)) * recipes[0].cost
    )
    if minimum_plan_cost > budget:
        raise ValueError("Not enough money")

    ingredient_map = fetch_ingredients_for_recipes(db, includes, excludes)

    # TODO: ensure that constraints are satisfiable

    means, variances = online_stats([r.costPerCalorie or 0.005 for r in recipes])
    price_cutoffs = [mean + 2 * math.sqrt(var) for mean, var in zip(means, variances)]
    price_tree = BPlusTree(20)
    for i, cutoff in enumerate(price_cutoffs):
        price_tree.insert(cutoff, i)

    use_tree = list(iter(price_tree)) == price_cutoffs

    @lru_cache(maxsize=8)
    def max_search_index(price):
        #print(list(iter(price_tree))[:50])
        #if use_tree:
        #    return price_tree.find(price)

        return bisect(price_cutoffs, price)

    meal_selections = []
    max_iterations = 1_000
    n = 0

    def add_meal(i, planner):
        recipe = recipes[i]
        for ingredient, amount in ingredient_map[recipe.name].items():
            if ingredient in planner.min_ingredients:
                try:
                    planner.min_ingredients[ingredient] -= amount
                except DimensionalityError:
                    pass

            if ingredient in planner.max_ingredients:
                try:
                    planner.max_ingredients[ingredient] -= amount
                except DimensionalityError:
                    pass

        planner.budget_left -= recipe.cost
        planner.calories_needed -= recipe.calories

        planner.meal_selections.append(i)

    def remove_meal(i, planner):
        if i is None:
            i = choice(planner.meal_selections)

        recipe = recipes[i]
        for ingredient, amount in ingredient_map[recipe.name].items():
            if ingredient in planner.min_ingredients:
                try:
                    planner.min_ingredients[ingredient] += amount
                except DimensionalityError:
                    pass

            if ingredient in planner.max_ingredients:
                try:
                    planner.max_ingredients[ingredient] += amount
                except DimensionalityError:
                    pass

        planner.budget_left += recipe.cost
        planner.calories_needed += recipe.calories

        planner.meal_selections.remove(i)

    @lru_cache(maxsize=8)
    def valid_meals_for_ingredient(ingredient, max_idx):
        return [
            i
            for i, r in enumerate(recipes[:max_idx])
            if ingredient in ingredient_map[r.name]
        ]

    # crossing fingers that this converges
    while (
        planner.budget_left < 0
        or planner.calories_needed > 0
        or any(amt > 0 for amt in planner.min_ingredients.values())
        or any(amt < 0 for amt in planner.max_ingredients.values())
    ):
        if n == max_iterations:
            raise RuntimeError(f"Could not create plan within {n} iterations")

        n += 1

        # Check if an ingredient has been used too many times
        too_much = False
        for ingredient, amount in planner.max_ingredients.items():
            if amount < 0:
                for i in planner.meal_selections:
                    r = recipes[i]
                    if ingredient in ingredient_map[r.name]:
                        remove_meal(i, planner)
                        too_much = True
                        break
                break
        if too_much:
            continue

        i = (
            max_search_index(planner.budget_left / planner.calories_needed)
            if planner.calories_needed > 0
            else len(recipes)
        )
        if i == 0 or planner.budget_left < 0:
            remove_meal(None, planner)
            continue

        else:
            # Check if there are minimums we need to satisfy
            for ingredient, amount in planner.min_ingredients.items():
                if amount > 0:
                    meal_choices = valid_meals_for_ingredient(ingredient, i)
                    if meal_choices == 0:
                        raise ValueError(f"No meals with {ingredient} within budget")

                    new_meal_index = choice(meal_choices)
                    break

            else:
                new_meal_index = randrange(i)

            add_meal(new_meal_index, planner)

    result = [recipes[i] for i in planner.meal_selections]
    return result


def distribute_meals(meals, days):
    meal_plan = [[] for _ in range(days)]
    meal_source = sorted(meals, key=lambda r: -r.calories)
    for recipe in meal_source:
        pos = min(
            enumerate(meal_plan),
            key=lambda idx_m: (sum(r.calories for r in idx_m[1]), idx_m[0]),
        )[0]
        meal_plan[pos].append(recipe)

    shuffle(meal_plan)
    return meal_plan
