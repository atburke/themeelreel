import mysql.connector
from mysql.connector import Error
from recipe_scrapers import scrape_me


mydb = mysql.connector.connect(host='us-cdbr-east-02.cleardb.com',
                                       database='heroku_46d4d29e1c35a52',
                                       user='be11a228b4cb3c',
                                       password='1359f316')
mycursor = mydb.cursor()
sql_insert = "insert into ingredient(Ingredient_Name, Recipe_Units, Average_Price_Per_Unit) " \
             "values(%s, %s, %s)"
in_name = input("ingredient name: ")
rec_unts = input("recipe units: ")


val = (in_name, rec_unts, None)

mycursor.execute(sql_insert, val)
mydb.commit()
print("committed")
