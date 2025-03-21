import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score

# Load dataset
data = pd.read_csv("synthetic_air_quality_data.csv")

# Display first few rows of the dataset
print(data.head())

# Check for missing values
print("\nMissing Values in Dataset:")
print(data.isnull().sum())

# Encode categorical features
data["Day of Week"] = data["Day of Week"].astype("category").cat.codes
data["Season"] = data["Season"].astype("category").cat.codes

# Define function to train model and predict a given target variable
def train_and_predict(target_column):
    features = data.drop(columns=["Date", "PM2.5", "PM10", "NO2", "O3", "CO"])  # Remove target columns and Date
    target = data[target_column]
    
    X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2, random_state=42)
    
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    y_pred = model.predict(X_test)
    mse = mean_squared_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"{target_column} Model Performance:")
    print(f"Mean Squared Error (MSE): {mse}")
    print(f"R-squared (R²) Score: {r2}\n")
    
    return model, features.columns

# Train models for each pollutant
models = {}
feature_names = {}
targets = ["PM2.5", "PM10", "NO2", "O3", "CO"]
for target in targets:
    models[target], feature_names[target] = train_and_predict(target)

# Example new data for prediction
new_data = pd.DataFrame({
    "Temperature (°C)": [15],
    "Humidity (%)": [60],
    "Wind Speed (km/h)": [10],
    "Pressure (hPa)": [1015],
    "Precipitation (mm)": [2],
    "Road Congestion Index": [50],
    "Day of Week": [2],  # Tuesday
    "Hour of Day": [14],
    "Season": [1]  # Spring
})

# Ensure new_data matches training feature names
for target in targets:
    new_data = new_data.reindex(columns=feature_names[target], fill_value=0)

# Make predictions for all pollutants
predictions = {}
for target in targets:
    predictions[target] = models[target].predict(new_data)[0]
    print(f"Predicted {target}: {predictions[target]}")

# Define AQI breakpoints (EPA Standard)
AQI_BREAKPOINTS = {
    "PM2.5": [(0, 12, 50), (12, 35.4, 100), (35.4, 55.4, 150), (55.4, 150.4, 200), (150.4, 250.4, 300), (250.4, 350.4, 400), (350.4, 500.4, 500)],
    "PM10": [(0, 54, 50), (54, 154, 100), (154, 254, 150), (254, 354, 200), (354, 424, 300), (424, 504, 400), (504, 604, 500)],
    "O3": [(0, 54, 50), (54, 70, 100), (70, 85, 150), (85, 105, 200), (105, 200, 300), (200, 300, 400), (300, 400, 500)],
    "NO2": [(0, 53, 50), (53, 100, 100), (100, 360, 150), (360, 649, 200), (649, 1249, 300), (1249, 1649, 400), (1649, 2049, 500)],
    "CO": [(0.0, 4.4, 50), (4.4, 9.4, 100), (9.4, 12.4, 150), (12.4, 15.4, 200), (15.4, 30.4, 300), (30.4, 40.4, 400), (40.4, 50.4, 500)]
}

# Function to calculate AQI based on pollutant values
def calculate_aqi(value, breakpoints):
    for low, high, aqi in breakpoints:
        if low <= value <= high:
            return aqi
    return breakpoints[-1][2]  # Return highest AQI value if out of range

# Calculate AQI for each pollutant
aqi_values = {pollutant: calculate_aqi(predictions[pollutant], AQI_BREAKPOINTS[pollutant]) for pollutant in targets}
valid_aqi_values = [aqi for aqi in aqi_values.values() if aqi is not None]
overall_aqi = max(valid_aqi_values) if valid_aqi_values else 0  # Default AQI if all None

# Determine air quality category
if overall_aqi <= 50:
    category = "Good"
elif overall_aqi <= 100:
    category = "Moderate"
elif overall_aqi <= 150:
    category = "Unhealthy for Sensitive Groups"
elif overall_aqi <= 200:
    category = "Unhealthy"
elif overall_aqi <= 300:
    category = "Very Unhealthy"
else:
    category = "Hazardous"

print(f"Overall AQI: {overall_aqi} - {category}")
