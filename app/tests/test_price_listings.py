from conftest import *

from sqlalchemy.sql import text
import pytest


def ingredient_to_tuple(ing):
    return (ing["ingredientName"], ing["source"], ing["price"], ing["units"])


def test_get_admin_price_listings(client, db):
    initial_listings = [
        ("carrots", "Aldi", 9.99, "lb"),
        ("carrots", "Aldi", 10.00, "lb"),
        ("carrots", "Meijer", 7.32, "g"),
        ("carrots", "Walmart", 3.33, "oz"),
        ("squash", "Aldi", 2.32, "lb"),
    ]
    for name, source, price, unit in initial_listings:
        create_price_listing(db, name, source, price, unit)

    create_user(db, "admin", "adminpass", True)
    token = login(client, "admin", "adminpass")
    r = client.get(
        "/api/adminpricelistings", headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 200
    data = [ingredient_to_tuple(i) for i in r.get_json()["results"]]
    assert data == initial_listings


def test_get_admin_price_listings_not_admin(client, db):
    create_user(db, "me123", "mypass")
    token = login(client, "me123", "mypass")
    r = client.get(
        "/api/adminpricelistings", headers={"Authorization": f"Bearer {token}"}
    )
    assert r.status_code == 403


def test_update_price_listing(client, db):
    ts = create_price_listing(db, "carrot", "Walmart", 2.80, "lb")
    create_user(db, "admin", "grapes", True)
    token = login(client, "admin", "grapes")
    r = client.post(
        "/api/adminpricelistings/update",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "ingredientName": "carrot",
            "source": "Walmart",
            "timeCreated": ts.timestamp(),
            "price": 4.11,
            "units": "L",
        },
    )
    assert r.status_code == 200

    statement = text(
        "SELECT * FROM Ingredient_Price_Listing WHERE IngredientName = 'carrot' AND IngredientSource = 'Walmart' AND Time_Added = :now"
    )
    result = db.execute(statement, {"now": ts}).fetchall()
    assert result != []
    data = result[0]
    assert data.Ingredient_Price == 4.11
    assert data.Ingredient_Units == "L"


def test_update_price_listing_not_admin(client, db):
    ts = create_price_listing(db, "carrot", "Walmart", 2.80, "lb")
    create_user(db, "guy", "guyspw")
    token = login(client, "guy", "guyspw")
    r = client.post(
        "/api/adminpricelistings/update",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "ingredientName": "carrot",
            "source": "Walmart",
            "timeCreated": ts.timestamp(),
            "price": 4.11,
            "units": "L",
        },
    )
    assert r.status_code == 403


def test_delete_price_listing(client, db):
    ts = create_price_listing(db, "carrot", "Walmart", 2.80, "lb")
    create_user(db, "admin", "grapes", True)
    token = login(client, "admin", "grapes")
    r = client.post(
        "/api/adminpricelistings/delete",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "ingredientName": "carrot",
            "source": "Walmart",
            "timeCreated": ts.timestamp(),
        },
    )
    assert r.status_code == 200

    statement = text(
        "SELECT * FROM Ingredient_Price_Listing WHERE IngredientName = 'carrot' AND IngredientSource = 'Walmart' AND Time_Added = :now"
    )
    result = db.execute(statement, {"now": ts}).fetchall()
    assert result == []


def test_delete_price_listing_not_admin(client, db):
    ts = create_price_listing(db, "carrot", "Walmart", 2.80, "lb")
    create_user(db, "guy", "guyspw")
    token = login(client, "guy", "guyspw")
    r = client.post(
        "/api/adminpricelistings/delete",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "ingredientName": "carrot",
            "source": "Walmart",
            "timeCreated": ts.timestamp(),
        },
    )
    assert r.status_code == 403


def test_post_price_listing(client, db):
    now = datetime.datetime.now()
    create_user(db, "steve", "stevesteve")
    token = login(client, "steve", "stevesteve")
    r = client.post(
        "/api/pricelistings",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "ingredientName": "red onion",
            "source": "Kroger",
            "price": 99.01,
            "units": "kg",
        },
    )
    assert r.status_code == 200

    statement = text("SELECT * FROM Ingredient_Price_Listing")
    results = db.execute(statement).fetchall()
    assert len(results) == 1
    data = results[0]
    assert data.Ingredient_Name == "red onion"
    assert data.Ingredient_Source == "Kroger"
    assert data.Ingredient_Price == 99.01
    assert data.Ingredient_Units == "kg"
    assert data.Time_Added >= now


@pytest.mark.parametrize("missing", ["ingredientName", "source", "price", "units"])
def test_post_price_listing_missing_field(client, db, missing):
    data = {
        "ingredientName": "red onion",
        "source": "Kroger",
        "price": 22.32,
        "units": "lb",
    }
    del data[missing]

    create_user(db, "me", "pw")
    token = login(client, "me", "pw")
    r = client.post(
        "/api/pricelistings", headers={"Authorization": f"Bearer {token}"}, data=data
    )
    assert r.status_code == 400


def test_fetch_needed_price_listing(client, db):
    create_recipe(
        db,
        "carrots & onions",
        "snack",
        [
            {"name": "carrots", "amount": 3, "units": "lb"},
            {"name": "onions", "amount": 27, "units": "g"},
        ],
    )

    create_price_listing(db, "carrots", "Aldi", 2.27, "kg")
    create_user(db, "name", "pw")
    token = login(client, "name", "pw")
    r = client.get("/api/pricelistings", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.get_json() == {"result": "onions"}


def test_fetch_needed_price_listing_none_empty(client, db):
    create_recipe(
        db,
        "carrots & onions",
        "snack",
        [
            {"name": "carrots", "amount": 3, "units": "lb"},
            {"name": "onions", "amount": 27, "units": "g"},
        ],
    )

    create_price_listing(db, "carrots", "Aldi", 2.27, "kg")
    create_price_listing(db, "carrots", "Walmart", 1.11, "lb")
    create_price_listing(db, "onions", "Meijer", 3.43, "oz")
    create_user(db, "name", "pw")
    token = login(client, "name", "pw")
    r = client.get("/api/pricelistings", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.get_json() == {"result": "onions"}


ALL_ITEMS = ["cookies", "grapes", "lb", "tbsp", "g", "kg", "cookie dough"]


@pytest.mark.parametrize(
    "kw,matches",
    [
        ("cookie", ["cookies", "cookie dough"]),
        ("g", ["grapes", "g", "kg", "cookie dough"]),
        ("xyz", []),
        ("lb", ["lb"]),
        ("  lb  ", ["lb"]),
    ],
)
def test_search_ingredients(client, db, kw, matches):
    create_recipe(
        db,
        "kitchen sink",
        "breakfast",
        [{"name": item, "amount": 1, "units": "count"} for item in ALL_ITEMS],
    )
    create_user(db, "u", "p")
    token = login(client, "u", "p")
    r = client.get(
        "/api/search/ingredient",
        query_string={"kw": kw},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    returned_items = r.get_json()["results"]
    assert sorted(returned_items) == sorted(matches)


@pytest.mark.parametrize(
    "kw,matches",
    [
        ("cookie", ["cookies", "cookie dough"]),
        ("g", ["grapes", "g", "kg", "cookie dough"]),
        ("xyz", []),
        ("lb", ["lb"]),
        ("  lb  ", ["lb"]),
    ],
)
def test_search_units(client, db, kw, matches):
    create_recipe(
        db,
        "kitchen sink",
        "breakfast",
        [{"name": item, "amount": 1, "units": item} for item in ALL_ITEMS],
    )
    create_user(db, "u", "p")
    token = login(client, "u", "p")
    r = client.get(
        "/api/search/unit",
        query_string={"kw": kw},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert r.status_code == 200
    returned_items = r.get_json()["results"]
    assert sorted(returned_items) == sorted(matches)
