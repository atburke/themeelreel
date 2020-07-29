import hypothesis.strategies as st
from hypothesis import given

from app.conftest import *
from app.sql import clear_tables
from app.mealplan import *

from collections import namedtuple

MockRecipe = namedtuple("MockRecipe", ["calories"])


def check_plan(db, meals, budget, cals):
    assert sum(m.cost for m in meals) <= budget
    assert sum(m.calories for m in meals) >= cals


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
    print(meals)
    check_plan(db, meals, budget, cals)


def test_generate_mealplan_not_possible(db):
    clear_tables(db)
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


def test_generate_mealplan_minimum_amounts(db):
    pass


def test_generate_mealplan_maximum_amounts(db):
    pass


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
