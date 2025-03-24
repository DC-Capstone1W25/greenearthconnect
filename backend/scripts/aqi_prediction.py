# backend\scripts\aqi_prediction.py
import os
import pandas as pd
import sys
import json
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.ensemble import RandomForestRegressor

# Determine the directory of this script and the data folder relative to it
base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, '..', 'data')

# Build full paths for the CSV files
weather_csv = os.path.join(data_dir, 'BobHopeAirportStationWeatherData.csv')
air_csv = os.path.join(data_dir, 'los-angeles-north-main-street-air-quality.csv')

# Read input parameters passed from Node.js
try:
    temperature = float(sys.argv[1])
    humidity = float(sys.argv[2])
    wind_speed = float(sys.argv[3])
    precipitation = float(sys.argv[4])
except Exception as e:
    print(json.dumps({"error": "Invalid input parameters", "details": str(e)}))
    sys.exit(1)

# Load datasets with error handling
try:
    weather_data = pd.read_csv(weather_csv, parse_dates=['date'])
    air_data = pd.read_csv(air_csv, parse_dates=['date'])
except Exception as e:
    print(json.dumps({"error": "Failed to load CSV files", "details": str(e)}))
    sys.exit(1)

# Merge datasets on 'date'
merged_df = pd.merge(weather_data, air_data, on='date', how='inner')

# Drop unwanted columns
merged_df.drop(columns=[
    'date',
    'Temperature (°F) MAX', 'Temperature (°F) MIN',
    'Dew Point (°F) MAX', 'Dew Point (°F) MIN',
    'Humidity (%) MAX', 'Humidity (%) MIN',
    'Wind Speed (mph) MAX', 'Wind Speed (mph) MIN',
    'Pressure (in) MAX', 'Pressure (in) MIN'
], inplace=True)

# Process data for small aerosols (predicting PM2.5)
small_aerosols = merged_df.drop(columns=['pm10', 'o3', 'no2', 'so2', 'co'])
small_aerosols['pm25'] = small_aerosols['pm25'].fillna(small_aerosols['pm25'].mean())
features = small_aerosols.drop(['pm25'], axis=1)
label = small_aerosols['pm25']

# Split data for training
X_train, X_test, y_train, y_test = train_test_split(features, label, test_size=0.25, random_state=424)

# Define a parameter grid for RandomForestRegressor
parameters = {
    'n_estimators': [15, 20, 25],
    'max_depth': [1, 2, 3],
    'min_samples_split': [2, 3],
    'min_samples_leaf': [1, 2]
}

grid_search = GridSearchCV(estimator=RandomForestRegressor(), param_grid=parameters, cv=5)
grid_search.fit(X_train, y_train)

# Build a DataFrame for prediction with placeholder values for some features
data_for_prediction = pd.DataFrame({
    "Temperature (°F) AVG": [temperature],
    "Dew Point (°F) AVG": [0],           # Placeholder
    "Humidity (%) AVG": [humidity],
    "Wind Speed (mph) AVG": [wind_speed],
    "Pressure (in) AVG": [0],           # Placeholder
    "Precipitation": [precipitation]
})

prediction_pm25 = grid_search.predict(data_for_prediction)[0]

# Function to calculate AQI using U.S. EPA breakpoints for PM2.5
def calculate_aqi(concentration, breakpoints):
    for i in range(len(breakpoints) - 1):
        C_low, C_high = breakpoints[i][0], breakpoints[i + 1][0]
        I_low, I_high = breakpoints[i][1], breakpoints[i + 1][1]
        if C_low <= concentration <= C_high:
            return round(((I_high - I_low) / (C_high - C_low)) * (concentration - C_low) + I_low)
    return None

AQI_BREAKPOINTS_PM25 = [
    (0.0, 0), (12.0, 50), (35.4, 100), (55.4, 150),
    (150.4, 200), (250.4, 300), (350.4, 400), (500.4, 500)
]
aqi_pm25 = calculate_aqi(prediction_pm25, AQI_BREAKPOINTS_PM25)

# Determine the AQI category based on the calculated value
if aqi_pm25 <= 50:
    category = "Good"
elif aqi_pm25 <= 100:
    category = "Moderate"
elif aqi_pm25 <= 150:
    category = "Unhealthy for Sensitive Groups"
elif aqi_pm25 <= 200:
    category = "Unhealthy"
elif aqi_pm25 <= 300:
    category = "Very Unhealthy"
else:
    category = "Hazardous"

# Output the results as JSON for Node.js to read
output = {
    "predicted_pm25": prediction_pm25,
    "aqi_pm25": aqi_pm25,
    "category": category
}
print(json.dumps(output))
