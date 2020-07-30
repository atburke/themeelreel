import hypothesis.strategies as st
from hypothesis import given
from . import ureg, Q_

from app.conftest import *
from app.sql import clear_tables
from app.mealplan import *

from collections import namedtuple

MockRecipe = namedtuple("MockRecipe", ["calories"])


def check_plan(db, meals, budget, cals, min_ingredients=None, max_ingredients=None):
    assert sum(m.cost for m in meals) <= budget
    assert sum(m.calories for m in meals) >= cals
    if min_ingredients or max_ingredients:
        ingredient_map = fetch_ingredients_for_recipes(db)
        if min_ingredients:
            for ing, amount in min_ingredients.items():
                assert sum(ingredient_map[r.name].get(ing, 0) for r in meals) >= amount

        if max_ingredients:
            for ing, amount in max_ingredients.items():
                assert sum(ingredient_map[r.name].get(ing, 0) for r in meals) <= amount


@pytest.mark.repeat(10)
def test_generate_mealplan_no_constraints(db):
    clear_tables(db)
    common_ingredients = [
        {"name": "carrots", "units": "g", "amount": 20},
        {"name": "apples", "units": "lb", "amount": 0.2},
        {"name": "spaghetti", "units": "lb", "amount": 1},
    ]
    for i, recipe in enumerate(
        [
            (5.00, 900),
            (4.50, 850),
            (9.00, 1300),
            (2.12, 350),
            (0.59, 200),
            (11.29, 1500),
            (7.07, 1000),
            (9.29, 1100),
        ]
    ):
        create_recipe(
            db,
            f"recipe_{i}",
            ingredients=common_ingredients,
            price=recipe[0],
            calories=recipe[1],
        )

    days = 10
    budget = 15 * days
    cals = 2000 * days
    meals = find_meals(db, budget, cals)
    check_plan(db, meals, budget, cals)


def test_generate_mealplan_not_possible(db):
    clear_tables(db)
    common_ingredients = [
        {"name": "carrots", "units": "g", "amount": 20},
        {"name": "apples", "units": "lb", "amount": 0.2},
        {"name": "spaghetti", "units": "lb", "amount": 1},
    ]
    for i, recipe in enumerate([(5.00, 500), (8.00, 750), (3.39, 300), (13.32, 1000)]):
        create_recipe(
            db,
            f"recipe_{i}",
            ingredients=common_ingredients,
            price=recipe[0],
            calories=recipe[1],
        )

    days = 10
    budget = 15 * days
    cals = 2000 * days
    with pytest.raises(ValueError):
        meals = find_meals(db, budget, cals)


@pytest.mark.repeat(10)
def test_generate_mealplan_minimum_amounts(db):
    clear_tables(db)
    min_ingredients = {"carrots": Q_(20, "g")}

    create_recipe(
        db,
        "A",
        [
            {"name": "carrots", "units": "g", "amount": 10},
            {"name": "apples", "units": "bushels", "amount": 0.1},
        ],
        3.00,
        500,
    )
    create_recipe(
        db, "B", [{"name": "apples", "units": "bushels", "amount": 0.2}], 5.00, 1000
    )
    create_recipe(db, "C", [{"name": "cucumbers", "units": "lb", "amount": 0.5}])

    days = 5
    budget = 10 * days
    cals = 1000 * days
    meals = find_meals(db, budget, cals)
    check_plan(db, meals, budget, cals, min_ingredients=min_ingredients)


@pytest.mark.repeat(10)
def test_generate_mealplan_maximum_amounts(db):
    clear_tables(db)
    max_ingredients = {"carrots": Q_(25, "g")}

    create_recipe(
        db,
        "A",
        [
            {"name": "carrots", "units": "g", "amount": 10},
            {"name": "apples", "units": "bushels", "amount": 0.1},
        ],
        3.00,
        500,
    )
    create_recipe(
        db, "B", [{"name": "apples", "units": "bushels", "amount": 0.2}], 5.00, 1000
    )
    create_recipe(db, "C", [{"name": "cucumbers", "units": "lb", "amount": 0.5}])

    days = 5
    budget = 10 * days
    cals = 1000 * days
    meals = find_meals(db, budget, cals, max_ingredients=max_ingredients)
    print(meals)
    check_plan(db, meals, budget, cals, max_ingredients=max_ingredients)


def test_gen_mealplan_minmax_same_item(db):
    clear_tables(db)
    min_ingredients = {"carrots": Q_(20, "g")}
    max_ingredients = {"carrots": Q_(50, "g")}

    create_recipe(
        db,
        "A",
        [
            {"name": "carrots", "units": "g", "amount": 10},
            {"name": "apples", "units": "bushels", "amount": 0.1},
        ],
        3.00,
        500,
    )
    create_recipe(
        db, "B", [{"name": "apples", "units": "bushels", "amount": 0.2}], 5.00, 1000
    )
    create_recipe(db, "C", [{"name": "cucumbers", "units": "lb", "amount": 0.5}])

    days = 5
    budget = 10 * days
    cals = 1000 * days
    meals = find_meals(db, budget, cals, min_ingredients, max_ingredients)
    check_plan(db, meals, budget, cals, min_ingredients, max_ingredients)


def test_gen_mealplan_cant_reach_min(db):
    clear_tables(db)
    min_ingredients = {"carrots": Q_(200, "g")}

    create_recipe(
        db,
        "A",
        [
            {"name": "carrots", "units": "g", "amount": 1},
            {"name": "apples", "units": "bushels", "amount": 0.1},
        ],
        3.00,
        500,
    )
    create_recipe(
        db, "B", [{"name": "apples", "units": "bushels", "amount": 0.2}], 5.00, 1000
    )
    create_recipe(db, "C", [{"name": "cucumbers", "units": "lb", "amount": 0.5}])

    days = 5
    budget = 10 * days
    cals = 1000 * days
    with pytest.raises(RuntimeError):
        find_meals(db, budget, cals, min_ingredients)


def test_gen_mealplan_over_max(db):
    clear_tables(db)
    max_ingredients = {"carrots": Q_(10, "g")}

    create_recipe(
        db,
        "A",
        [
            {"name": "carrots", "units": "g", "amount": 100},
            {"name": "apples", "units": "bushels", "amount": 0.1},
        ],
        3.00,
        500,
    )
    create_recipe(
        db, "B", [{"name": "apples", "units": "bushels", "amount": 0.2}], 5.00, 1
    )

    days = 5
    budget = 10 * days
    cals = 1000 * days
    with pytest.raises(RuntimeError):
        find_meals(db, budget, cals, max_ingredients=max_ingredients)


def test_distribute_meals_easy():
    cals = [1000, 1000, 1000]
    recipes = [MockRecipe(c) for c in cals]
    meal_plan = distribute_meals(recipes, 3)
    for day in meal_plan:
        assert len(day) == 1


def test_distribute_meals_stacking():
    cals = [100, 200, 300]
    recipes = [MockRecipe(c) for c in cals]
    meal_plan = distribute_meals(recipes, 2)
    dist = sorted([len(a) for a in meal_plan])
    assert dist == [1, 2]


def test_distribute_meals_stacking_hard():
    cals = [6, 2, 3, 2, 2, 4]
    recipes = [MockRecipe(c) for c in cals]
    meal_plan = distribute_meals(recipes, 3)
    dist = sorted([len(a) for a in meal_plan])
    assert dist == [1, 2, 3]


@given(st.integers(min_value=0, max_value=1_000))
def test_distribute_meals_empty(n):
    meal_plan = distribute_meals([], n)
    assert len(meal_plan) == n
    for day in meal_plan:
        assert day == []
