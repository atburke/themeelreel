import mysql.connector
from mysql.connector import Error
from recipe_scrapers import scrape_me
db_user = input("Enter database username : ")
db_password = input("Enter database password : ")


mydb = mysql.connector.connect(host='us-cdbr-east-02.cleardb.com',
                                       database='heroku_46d4d29e1c35a52',
                                       user=db_user,
                                       password=db_password)
mycursor = mydb.cursor()
sql_insert = "insert into recipe(Recipe_Name, Meal_Type, Image_URL, Recipe_URL, Recipe_Cost, Servings, Calories) " \
             "values(%s, %s, %s, %s, %s, %s, %s)"
r_url = 'https://www.allrecipes.com/recipe/20916/egg-and-sausage-casserole/?internalSource=streams&referringId=144&referringContentType=Recipe%20Hub&clickId=st_trending_s'
scraper = scrape_me(r_url)

r_name = scraper.title()
m_type = 'Breakfast' #manually change this to the meal type of the recipe
i_url = scraper.image()
rec_url = r_url
rec_cost = None #None is a placeholder
r_servings = '12' #manually change servings
r_calories = '341' #manually change calories
val = (r_name, m_type, i_url, rec_url, rec_cost, r_servings, r_calories)

mycursor.execute(sql_insert, val)
mydb.commit()
print("committed")
