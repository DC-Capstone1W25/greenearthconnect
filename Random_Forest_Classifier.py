import pandas as pd
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

#Import air quality dataset and weather dataset and merge them using timesamps
weather_data = pd.read_csv('BobHopeAirportStationWeatherData - Sheet1.csv')
air_data = pd.read_csv('los-angeles-north main street-air-quality.csv')
merged_df = pd.merge(weather_data, air_data, on='date', how='inner')
merged_df.head()

#Drop Max and Min weather columns. Create a different data frame for each pollutant
merged_df.drop(columns=['date', 'Temperature (°F) MAX', 'Temperature (°F) MIN', 'Dew Point (°F) MAX', 'Dew Point (°F) MIN', 'Humidity (%) MAX', 'Humidity (%) MIN', 'Wind Speed (mph) MAX', 'Wind Speed (mph) MIN', 'Pressure (in) MAX', 'Pressure (in) MIN'], inplace=True)
small_aerosols = merged_df.drop(columns=['pm10', 'o3', 'no2', 'so2', 'co'])
big_aerosols = merged_df.drop(columns=['pm25', 'o3', 'no2', 'so2', 'co'])
ozone = merged_df.drop(columns=['pm25', 'pm10', 'no2', 'so2', 'co'])
nitrogen_dioxide = merged_df.drop(columns=['pm25', 'pm10', 'o3', 'so2', 'co'])
sulfur_dioxide = merged_df.drop(columns=['pm25', 'pm10', 'o3', 'no2', 'co'])
carbon_monoxide = merged_df.drop(columns=['pm25', 'pm10', 'o3', 'no2', 'so2'])

#This section is for pm2.5
#First create the correlation matrix to look at correlation between variables
sns.heatmap(small_aerosols.corr(), annot=True)

#Separate data into features and label
small_aerosols['pm25'] = small_aerosols['pm25'].fillna(small_aerosols['pm25'].mean())
features = small_aerosols.drop(['pm25'], axis=1)
label = small_aerosols['pm25']

#Do the train/test split
X_train, X_test, y_train, y_test = train_test_split(features, label, test_size=0.25, random_state=424)

parameters = {
    'n_estimators': [15, 20, 25],
    'max_depth': [1, 2, 3],
    'min_samples_split': [1, 2, 3],
    'min_samples_leaf': [1, 2, 3]
}

grid_search = GridSearchCV(estimator=RandomForestRegressor(), param_grid=parameters, cv=5)
grid_search.fit(X_train, y_train)
#Get best hyperparameters and metrics
print(f"Best Parameters for pm2.5: {grid_search.best_params_}")
print(f"Best Score for pm2.5: {grid_search.best_score_}")
y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"R2 for pm2.5: {r2}")
print(f"MSE for pm2.5: {mse}")

#This section is for pm10
sns.heatmap(big_aerosols.corr(), annot=True)
big_aerosols['pm10'] = big_aerosols['pm10'].fillna(big_aerosols['pm10'].mean())
features = big_aerosols.drop(['pm10'], axis=1)
label = big_aerosols['pm10']
X_train, X_test, y_train, y_test = train_test_split(features, label, test_size=0.25, random_state=424)
parameters = {
    'n_estimators': [15, 20, 25],
    'max_depth': [1, 2, 3, 4],
    'min_samples_split': [1, 2, 3, 4],
    'min_samples_leaf': [1, 2, 3, 4]
}
grid_search = GridSearchCV(estimator=RandomForestRegressor(), param_grid=parameters, cv=5)
grid_search.fit(X_train, y_train)
print(f"Best Parameters for pm10: {grid_search.best_params_}")
print(f"Best Score for pm10: {grid_search.best_score_}")
y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"R2 for pm10: {r2}")
print(f"MSE for pm10: {mse}")

#This section is for NO2
sns.heatmap(nitrogen_dioxide.corr(), annot=True)
nitrogen_dioxide['no2'] = nitrogen_dioxide['no2'].fillna(nitrogen_dioxide['no2'].mean())
features = nitrogen_dioxide.drop(['no2'], axis=1)
label = nitrogen_dioxide['no2']
X_train, X_test, y_train, y_test = train_test_split(features, label, test_size=0.25, random_state=424)
parameters = {
    'n_estimators': [15, 20, 25, 30],
    'max_depth': [2, 3, 4, 5],
    'min_samples_split': [2, 3, 4, 5],
    'min_samples_leaf': [2, 3, 4, 5]
}
grid_search = GridSearchCV(estimator=RandomForestRegressor(), param_grid=parameters, cv=5)
grid_search.fit(X_train, y_train)
print(f"Best Parameters for NO2: {grid_search.best_params_}")
print(f"Best Score for NO2: {grid_search.best_score_}")
y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"R2 for NO2: {r2}")
print(f"MSE for NO2: {mse}")

#This section is for CO
sns.heatmap(sulfur_dioxide.corr(), annot=True)
carbon_monoxide['co'] = carbon_monoxide['co'].fillna(carbon_monoxide['co'].mean())
features = carbon_monoxide.drop(['co'], axis=1)
label = carbon_monoxide['co']
X_train, X_test, y_train, y_test = train_test_split(features, label, test_size=0.25, random_state=424)
parameters = {
    'n_estimators': [15, 20, 25, 30],
    'max_depth': [2, 3, 4, 5],
    'min_samples_split': [2, 3, 4, 5],
    'min_samples_leaf': [2, 3, 4, 5]
}
grid_search = GridSearchCV(estimator=RandomForestRegressor(), param_grid=parameters, cv=5)
grid_search.fit(X_train, y_train)
print(f"Best Parameters for CO: {grid_search.best_params_}")
print(f"Best Score: {grid_search.best_score_}")
y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
print(f"R2 for CO: {r2}")
print(f"MSE for CO: {mse}")

