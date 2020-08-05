import json
import sys

import sqlalchemy
from sqlalchemy.sql import text


def parse_fake_json(f):
    acc = ""
    for line in f:
        acc += line
        try:
            data = json.loads(acc)
            yield data
            acc = ""

        except:
            pass


def main():
    recipe_file = sys.argv[1]

    engine = sqlalchemy.create_engine("sqlite:///dev.sqlite")
    conn = engine.connect()

    with open(recipe_file) as f:
        for i, recipe in enumerate(parse_fake_json(f), start=1):
            statement = text(
                "INSERT INTO Recipe "
                "VALUES (:name, 'Dinner', NULL, 'example.com', NULL, :servings, :calories)"
            )
            try:
                conn.execute(
                    statement,
                    {
                        "name": recipe["name"],
                        "servings": recipe["servings"],
                        "calories": recipe["calories"],
                    },
                )
            except Exception as e:
                pass

            for ingredient in recipe["ingredients"]:
                statement = text(
                    "SELECT Ingredient_Name AS name "
                    "FROM Ingredient "
                    "WHERE name = :name"
                )
                if not conn.execute(statement, {"name": ingredient["ingredient"]}).fetchall():
                    statement = text(
                        "INSERT INTO Ingredient " "VALUES (:name, :units, NULL)"
                    )
                    conn.execute(
                        statement,
                        {"name": ingredient["ingredient"], "units": ingredient["unit"]},
                    )

                statement = text(
                    "INSERT INTO Requires " "VALUES (:ingName, :name, :amount, :units)"
                )

                try:
                    conn.execute(
                        statement,
                        {
                            "ingName": ingredient["ingredient"],
                            "name": recipe["name"],
                            "amount": ingredient["amount"],
                            "units": ingredient["unit"],
                        },
                    )
                except Exception as e:
                    pass

        print(f"Parsed recipe {i}: {recipe['name']}")


if __name__ == "__main__":
    main()
