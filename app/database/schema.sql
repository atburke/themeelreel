CREATE TABLE User (
	Username VARCHAR(50) NOT NULL,
	Password_Hash VARCHAR(50),
	Salt VARCHAR(50),
	Is_Admin BOOLEAN,
	PRIMARY KEY (Username)
);

CREATE TABLE Token (
	Username VARCHAR(50) NOT NULL,
	Token VARCHAR(256),
	TimeCreated TIMESTAMP,
	PRIMARY KEY (Username),
	FOREIGN KEY (Username) REFERENCES User ON DELETE CASCADE
);

CREATE TABLE Meal_Plan (
	Meal_Plan_ID VARCHAR(50) NOT NULL,
	Username VARCHAR(50) NOT NULL,
	Meal_Plan_Title VARCHAR(50),
	Time_Created DATETIME,
	PRIMARY KEY (Meal_Plan_ID, Username),
	FOREIGN KEY (Username) REFERENCES User ON DELETE CASCADE
);

CREATE TABLE Created_By (
	Username VARCHAR(50) NOT NULL,
	Meal_Plan_ID VARCHAR(50) NOT NULL,
	PRIMARY KEY (Username, Meal_Plan_ID),
	FOREIGN KEY (Username) REFERENCES User ON DELETE CASCADE,
	FOREIGN KEY (Meal_Plan_ID) REFERENCES Meal_Plan ON DELETE CASCADE
);

CREATE TABLE Recipe (
	Recipe_Name VARCHAR(50) NOT NULL,
	Meal_Type VARCHAR(50),
	Image_URL VARCHAR(50),
	Recipe_URL VARCHAR(50),
	Recipe_Cost REAL,
	Servings INT,
	Calories INT,
	PRIMARY KEY (Recipe_Name)
);

CREATE TABLE Consists_Of (
	Recipe_Name VARCHAR(50) NOT NULL,
	Meal_Plan_ID VARCHAR(50) NOT NULL,
	PRIMARY KEY (Recipe_Name, Meal_Plan_ID),
	FOREIGN KEY (Recipe_Name) REFERENCES Recipe ON DELETE CASCADE,
	FOREIGN KEY (Meal_Plan_ID) REFERENCES Meal_Plan ON DELETE CASCADE
);

CREATE TABLE Ingredient (
	Ingredient_Name VARCHAR(50) NOT NULL,
	Recipe_Units VARCHAR(50),
	Average_Price_Per_Unit REAL,
	PRIMARY KEY (Ingredient_Name)
);

CREATE TABLE Requires (
	Ingredient_Name VARCHAR(50) NOT NULL,
	Recipe_Name VARCHAR(50) NOT NULL,
	Required_Amount REAL,
	Item_Units VARCHAR(50),
	PRIMARY KEY (Ingredient_Name, Recipe_Name),
	FOREIGN KEY (Ingredient_Name) REFERENCES Ingredient ON DELETE CASCADE,
	FOREIGN KEY (Recipe_Name) REFERENCES Recipe ON DELETE CASCADE
);

CREATE TABLE Ingredient_Price_Listing (
	Time_Added DATETIME NOT NULL,
	Ingredient_Source VARCHAR(50) NOT NULL,
	Ingredient_Name VARCHAR(50) NOT NULL,
	Ingredient_Units VARCHAR(50),
	Ingredient_Price REAL,
	PRIMARY KEY (Time_Added, Ingredient_Source, Ingredient_Name),
	FOREIGN KEY (Ingredient_Name) REFERENCES Ingredient ON DELETE CASCADE
);
