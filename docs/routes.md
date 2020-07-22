NOTES
-----------------
Unless otherwise specified, all responses should be in JSON.
If a resource for a route doesn't exist, return 404.

ADMIN-ONLY ROUTES
-----------------
If a valid non-admin user tries to access an admin-only route, return 403.

AUTHENTICATION
-----------------
All routes except /api/login and /api/createaccount should expect an authorization token (i.e. the header "Authorization": "Bearer <token>"). If the token is missing, doesn't match a token in the db (need to add a table for this), or has expired, return 401. Otherwise, continue with normal operations and refresh the token.

------------------

### GET /api/login

Logs the user in. Expects the header "Authorization": "Basic <x>", where x is username:password base64-encoded (basic auth). If the login succeeds, return 200 with body {"token": <token>}, where token is a newly generated token. Otherwise, return 400.


### GET /api/createaccount

Creates an account. Identical to /api/login except the account needs to not exist initially.


### GET /api/adminpricelistings

Gets price listings for admins. Admin-only route. Response should be:

{ results: [
    {
      ingredientName: "foo",
      source: "Walmart",
      timeCreated: <unix timestamp>,
      price: 2.54,
      units: "lb"
    },
    ...
  ]
}

Order by ingredient name, source, units, price (all asc)


### POST /api/adminpricelistings/update

Updates a price listing in the database. Admin-only route. Data should be:

{
  ingredientName: "foo",
  source: "Walmart",
  timeCreated: <unix timestamp>,
  price: 2.54,
  units: "lb"
}


### POST /api/adminpricelistings/delete

Deletes a price listing from the database. Admin-only route. Data should be:

{
  ingredientName: "foo",
  source: "Walmart",
  timeCreated: <unix timestamp>
}


### POST /api/pricelistings

Creates a new price listing. Data should be:

{
  ingredientName: "foo",
  source: "Walmart",
  price: 2.54,
  units: "lb"
}


### GET /api/pricelistings

Fetches an ingredient that doesn't have any price listings yet. If there are none,
fetch the ingredient with the fewest listings.

{result: "milk"}


### GET /api/search/ingredient?kw=<keyword>

Searches for ingredients that match a specified keyword. Response should be:

{results: ["milk", ...]}


### GET /api/search/unit?kw=<keyword>

Searches for units that match a specified keyword. Response should be:

{results: ["tbsp", ...]}
