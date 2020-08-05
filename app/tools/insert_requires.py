import mysql.connector

mydb = mysql.connector.connect(host='us-cdbr-east-02.cleardb.com',
                                       database='heroku_46d4d29e1c35a52',
                                       user='be11a228b4cb3c',
                                       password='1359f316')
mycursor = mydb.cursor()
sql_insert = "insert into requires(Ingredient_Name, Recipe_Name, Required_Amount, Item_Units) " \
             "values(%s, %s, %s, %s)"
in_name = input("ingredient name: ")
rec_name = input("recipe name: ")
req_amt = input("required amount: ")
item_unts = input("item units: ")


val = (in_name, rec_name, req_amt, item_unts)

mycursor.execute(sql_insert, val)
mydb.commit()
print("committed")
