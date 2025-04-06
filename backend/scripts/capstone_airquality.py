# backend\scripts\capstone_airquality.py
import os
import sys
import json
import pandas as pd
import numpy as np
import xgboost as xgb
from sklearn.metrics import mean_squared_error

# Determine the directory of this script and the data folder relative to it
base_dir = os.path.dirname(os.path.abspath(__file__))
data_dir = os.path.join(base_dir, '..', 'data')

# Build full paths for the CSV files (adjust filenames as needed)
aqe_csv = os.path.join(data_dir, 'AQE.csv')
aqw_csv = os.path.join(data_dir, 'AQW.csv')

# Read input parameters for forecast dates (expected format: YYYY-MM-DD)
try:
    forecast_start = sys.argv[1]  # e.g., '2024-11-30'
    forecast_end = sys.argv[2]    # e.g., '2025-11-01'
except Exception as e:
    # Use default forecast range if parameters are not provided
    forecast_start = '2024-11-30'
    forecast_end = '2025-11-01'

# Load datasets with error handling
try:
    df_aqe = pd.read_csv(aqe_csv)
    df_aqw = pd.read_csv(aqw_csv)
except Exception as e:
    print(json.dumps({"error": "Failed to load CSV files", "details": str(e)}))
    sys.exit(1)

# Convert date columns to datetime format
try:
    df_aqe['Date'] = pd.to_datetime(df_aqe['Date'], format='%m/%d/%Y')
    df_aqw['Time'] = pd.to_datetime(df_aqw['Time'], format='%Y/%m/%d')
except Exception as e:
    print(json.dumps({"error": "Failed to convert date columns", "details": str(e)}))
    sys.exit(1)

# Merge the dataframes on the standardized date columns
df_merged = pd.merge(df_aqe, df_aqw, left_on='Date', right_on='Time', how='inner')

# Drop unwanted columns
cols_to_drop = [
    'Source', 'Site ID', 'Daily Obs Count', 'Percent Complete',
    'AQS Parameter Code', 'AQS Parameter Description', 'Method Code',
    'CBSA Code', 'CBSA Name', 'State FIPS Code', 'State', 'County FIPS Code',
    'County', 'Site Latitude', 'Site Longitude', 'Units', 'Local Site Name',
    'POC', 'Daily AQI Value'
]
df_merged.drop(columns=cols_to_drop, inplace=True, errors='ignore')

# Set index to Date and ensure datetime format
data = df_merged.copy()
data.set_index('Date', inplace=True)
data.index = pd.to_datetime(data.index)

# ---------------- Feature Engineering Functions ----------------

def create_features(df):
    df = df.copy()
    df['dayofweek'] = df.index.dayofweek
    df['quarter'] = df.index.quarter
    df['month'] = df.index.month
    df['year'] = df.index.year
    df['dayofyear'] = df.index.dayofyear
    df['dayofmonth'] = df.index.day
    # For compatibility with older pandas versions, convert weekofyear via isocalendar if available
    try:
        df['weekofyear'] = df.index.isocalendar().week
    except AttributeError:
        df['weekofyear'] = df.index.week
    return df

def add_lags(df):
    df = df.copy()
    target_map = df['Daily Max 1-hour NO2 Concentration'].to_dict()
    df['lag1'] = (df.index - pd.Timedelta('7 days')).map(target_map)
    df['lag2'] = (df.index - pd.Timedelta('14 days')).map(target_map)
    df['lag3'] = (df.index - pd.Timedelta('31 days')).map(target_map)
    df['lag4'] = (df.index - pd.Timedelta('92 days')).map(target_map)
    df['lag5'] = (df.index - pd.Timedelta('364 days')).map(target_map)
    df['lag6'] = (df.index - pd.Timedelta('728 days')).map(target_map)
    return df

# ---------------- Data Preparation ----------------

# Apply feature engineering
data = create_features(data)
data = add_lags(data)

# Define target and feature columns
TARGET = 'Daily Max 1-hour NO2 Concentration'
FEATURES = [
    'dayofyear', 'dayofweek', 'quarter', 'month', 'year',
    'lag1', 'lag2', 'lag3', 'lag4', 'lag5', 'lag6',
    'Temperature (°F) MAX', 'Temperature (°F) AVG', 'Temperature (°F) MIN',
    'Dew Point (°F) MAX', 'Dew Point (°F) AVG', 'Dew Point (°F) MIN',
    'Humidity (%) MAX', 'Humidity (%) AVG', 'Humidity (%) MIN',
    'Wind Speed (mph) MAX', 'Wind Speed (mph) AVG', 'Wind Speed (mph) MIN',
    'Pressure (in) AVG', 'Pressure (in) MIN', 'Precipitation'
]

# Drop rows with missing values in any of the required columns
data = data.dropna(subset=FEATURES + [TARGET])

# ---------------- Model Training ----------------

# Train final model on all available data
X_all = data[FEATURES]
y_all = data[TARGET]

model = xgb.XGBRegressor(
    base_score=0.5,
    booster='gbtree',
    n_estimators=500,
    early_stopping_rounds=50,
    objective='reg:linear',
    max_depth=3,
    learning_rate=0.01
)

# Use the entire dataset for training (using eval_set for logging; verbosity turned off)
model.fit(X_all, y_all, eval_set=[(X_all, y_all)], verbose=False)

# ---------------- Future Prediction ----------------

# Create future dataframe based on forecast_start and forecast_end
try:
    future_dates = pd.date_range(start=forecast_start, end=forecast_end)
except Exception as e:
    print(json.dumps({"error": "Invalid forecast date range", "details": str(e)}))
    sys.exit(1)

future_data = pd.DataFrame(index=future_dates)
future_data['isFuture'] = True
data['isFuture'] = False

# Concatenate historical data and future dates to apply feature engineering uniformly
data_and_future = pd.concat([data, future_data])
data_and_future = create_features(data_and_future)
data_and_future = add_lags(data_and_future)

# Select only future rows
future_w_features = data_and_future[data_and_future['isFuture'] == True].copy()

# Fill missing values in future data (using forward fill as a simple strategy)
future_w_features = future_w_features.fillna(method='ffill')

# Predict future NO2 concentrations
future_w_features['predicted_NO2'] = model.predict(future_w_features[FEATURES])

# Prepare forecast output as a list of dictionaries with date and prediction
forecast_results = []
for date, row in future_w_features.iterrows():
    forecast_results.append({
        "date": date.strftime('%Y-%m-%d'),
        "predicted_NO2": row['predicted_NO2']
    })

# Output the results as JSON for Node.js to read
output = {
    "forecast": forecast_results
}
print(json.dumps(output))
