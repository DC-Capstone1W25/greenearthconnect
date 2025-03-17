import pandas as pd
weather_data = pd.read_csv('BobHopeAirportStationWeatherData.csv')
air_data = pd.read_csv('los-angeles-north-main-street-air-quality.csv')
merged_df = pd.merge(weather_data, air_data, on='date', how='inner')
merged_df.drop(columns=['date', 'Temperature (°F) MAX', 'Temperature (°F) MIN', 'Dew Point (°F) MAX', 'Dew Point (°F) MIN', 'Humidity (%) MAX', 'Humidity (%) MIN', 'Wind Speed (mph) MAX', 'Wind Speed (mph) MIN', 'Pressure (in) MAX', 'Pressure (in) MIN'], inplace=True)
small_aerosols = merged_df.drop(columns=['pm10', 'o3', 'no2', 'so2', 'co'])
big_aerosols = merged_df.drop(columns=['pm25', 'o3', 'no2', 'so2', 'co'])
ozone = merged_df.drop(columns=['pm25', 'pm10', 'no2', 'so2', 'co'])
nitrogen_dioxide = merged_df.drop(columns=['pm25', 'pm10', 'o3', 'so2', 'co'])
sulfur_dioxide = merged_df.drop(columns=['pm25', 'pm10', 'o3', 'no2', 'co'])
carbon_monoxide = merged_df.drop(columns=['pm25', 'pm10', 'o3', 'no2', 'so2'])
small_aerosols['pm25'] = small_aerosols['pm25'].fillna(small_aerosols['pm25'].mean())
features = small_aerosols.drop(['pm25'], axis=1)
label = small_aerosols['pm25']
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(features, label, test_size=0.25, random_state=424)
from sklearn.model_selection import GridSearchCV
from sklearn.ensemble import RandomForestRegressor
parameters = {
    'n_estimators': [15, 20, 25],
    'max_depth': [1, 2, 3],
    'min_samples_split': [1, 2, 3],
    'min_samples_leaf': [1, 2, 3]
}

grid_search = GridSearchCV(estimator=RandomForestRegressor(), param_grid=parameters, cv=5)
grid_search.fit(X_train, y_train)
from sklearn.metrics import mean_squared_error, r2_score
y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

import requests

# The API endpoint
url = "https://www.meteosource.com/api/v1/free/point?place_id=burbank&sections=current%2Chourly&language=en&units=auto&key=eveah5zhbw4xfpkyjk519y8cpy2cs58u7q9hpomn"

# A GET request to the API
response = requests.get(url)

# Print the response
weather_response = response.json()

# Extract relevant data
current_temp = weather_response["current"]["temperature"]
total_precipitation = weather_response["current"]["precipitation"]["total"]
wind_speed = weather_response["current"]["wind"]["speed"]
data_for_prediction = pd.DataFrame({
        "Temperature (°F) AVG": [current_temp],
        "Dew Point (°F) AVG": [0],
        "Humidity (%) AVG": [0],
        "Wind Speed (mph) AVG": [wind_speed],
        "Pressure (in) AVG": [0],
        "Precipitation": [total_precipitation]
    })
prediction_pm25 = grid_search.predict(data_for_prediction)


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
y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
prediction_pm10 = grid_search.predict(data_for_prediction)

ozone['o3'] = ozone['o3'].fillna(ozone['o3'].mean())
features = ozone.drop(['o3'], axis=1)
label = ozone['o3']
X_train, X_test, y_train, y_test = train_test_split(features, label, test_size=0.25, random_state=424)
parameters = {
    'n_estimators': [15, 20, 25, 30],
    'max_depth': [2, 3, 4, 5],
    'min_samples_split': [2, 3, 4, 5],
    'min_samples_leaf': [2, 3, 4, 5]
}

grid_search = GridSearchCV(estimator=RandomForestRegressor(), param_grid=parameters, cv=5)
grid_search.fit(X_train, y_train)

y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)

prediction_o3 = grid_search.predict(data_for_prediction)

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
y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
prediction_no2 = grid_search.predict(data_for_prediction)

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
y_pred = grid_search.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
r2 = r2_score(y_test, y_pred)
prediction_co = grid_search.predict(data_for_prediction)

def calculate_aqi(concentration, breakpoints):
    for i in range(len(breakpoints) - 1):
        C_low, C_high = breakpoints[i][0], breakpoints[i + 1][0]
        I_low, I_high = breakpoints[i][1], breakpoints[i + 1][1]

        if C_low <= concentration <= C_high:
            AQI = ((I_high - I_low) / (C_high - C_low)) * (concentration - C_low) + I_low
            return round(AQI)

    return None  # Return None if concentration is out of range

# Define pollutant breakpoints (U.S. EPA AQI standard)
AQI_BREAKPOINTS_PM25 = [
    (0.0, 0), (12.0, 50), (35.4, 100), (55.4, 150), (150.4, 200), (250.4, 300), (350.4, 400), (500.4, 500)
]

AQI_BREAKPOINTS_PM10 = [
    (0, 0), (54, 50), (154, 100), (254, 150), (354, 200), (424, 300), (504, 400), (604, 500)
]

AQI_BREAKPOINTS_O3 = [
    (0, 0), (54, 50), (70, 100), (85, 150), (105, 200), (200, 300), (300, 400), (400, 500)
]

AQI_BREAKPOINTS_NO2 = [
    (0, 0), (53, 50), (100, 100), (360, 150), (649, 200), (1249, 300), (1649, 400), (2049, 500)
]

AQI_BREAKPOINTS_SO2 = [
    (0, 0), (35, 50), (75, 100), (185, 150), (304, 200), (604, 300), (804, 400), (1004, 500)
]

AQI_BREAKPOINTS_CO = [
    (0.0, 0), (4.4, 50), (9.4, 100), (12.4, 150), (15.4, 200), (30.4, 300), (40.4, 400), (50.4, 500)
]

# Example pollutant concentrations
pm25_concentration = prediction_pm25[0]  # µg/m³
pm10_concentration = prediction_pm10[0]  # µg/m³
o3_concentration = prediction_o3[0]  # ppb
no2_concentration = prediction_no2[0]  # ppb
#so2_concentration = prediction_co[0]  # ppb
co_concentration = prediction_co[0]  # ppm

# Calculate AQI for each pollutant
aqi_pm25 = calculate_aqi(pm25_concentration, AQI_BREAKPOINTS_PM25)
aq1_pm10 = calculate_aqi(pm10_concentration, AQI_BREAKPOINTS_PM10)
aq1_o3 = calculate_aqi(o3_concentration, AQI_BREAKPOINTS_O3)
aq1_no2 = calculate_aqi(no2_concentration, AQI_BREAKPOINTS_NO2)
#aq1_so2 = calculate_aqi(so2_concentration, AQI_BREAKPOINTS_SO2)
aq1_co = calculate_aqi(co_concentration, AQI_BREAKPOINTS_CO)

# Overall AQI (highest value)
overall_aqi = max(filter(None, [aqi_pm25, aq1_pm10, aq1_o3, aq1_no2, aq1_co]))

print(f"Predicted concetration of pm2.5 (µg/m³): {prediction_pm25}")
print(f"Predicted concetration of pm10 (µg/m³): {prediction_pm10}")
print(f"Predicted concetration of O3 (ppb): {prediction_o3}")
print(f"Predicted concetration of NO2 (ppb): {prediction_no2}")
print(f"Predicted concetration of CO (ppm): {prediction_co}")

print(f"PM2.5 AQI: {aqi_pm25}")
print(f"PM10 AQI: {aq1_pm10}")
print(f"O3 AQI: {aq1_o3}")
print(f"NO2 AQI: {aq1_no2}")
#print(f"SO2 AQI: {aq1_so2}")
print(f"CO AQI: {aq1_co}")
print(f"Overall AQI: {overall_aqi}")

if overall_aqi <= 50:
  print("Good")
elif overall_aqi <= 100:
  print("Moderate")
elif overall_aqi <= 150:
  print("Unhealthy for Sensitive Groups")
elif overall_aqi <= 200:
  print("Unhealthy")
elif overall_aqi <= 300:
  print("Very Unhealthy")
else:
  print("Hazardous")