# backend\scripts\airquality_regression.py
import os
import sys
import json
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from collections import Counter
import logging

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor
from sklearn.neighbors import KNeighborsRegressor
from xgboost import XGBRegressor
from sklearn.svm import SVR
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score

# Configure logging for deployment
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# Use environment variables for flexibility during deployment
DATA_FILE = os.environ.get("DATA_FILE") or os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'AllYearsAirQualityCalculations.csv')
# PLOTS_DIR will hold our generated plots; this directory must be served statically by our Node server.
PLOTS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'plots')
os.makedirs(PLOTS_DIR, exist_ok=True)

# Helper function to return URL-friendly relative paths for plots.
def get_relative_plot_path(filename):
    return f"/plots/{filename}"

def get_aqi_category(pm25_value):
    if pm25_value <= 50:
        return "Good"
    elif pm25_value <= 100:
        return "Moderate"
    elif pm25_value <= 150:
        return "Unhealthy for Sensitive Groups"
    elif pm25_value <= 200:
        return "Unhealthy"
    elif pm25_value <= 300:
        return "Very Unhealthy"
    else:
        return "Hazardous"

def load_data(file_path):
    try:
        df = pd.read_csv(file_path)
        logging.info("Data loaded successfully.")
        return df
    except Exception as e:
        error_msg = json.dumps({"error": "Failed to load dataset", "details": str(e)})
        print(error_msg)
        sys.exit(1)

def preprocess_data(df):
    df = df.dropna()
    y = df['pm25_concentration']
    X = df.drop(columns=['pm25_concentration', 'geoid', 'geoid20'])
    return X, y, df

def split_and_scale_data(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    return X_train_scaled, X_test_scaled, y_train, y_test

def train_and_evaluate_models(X_train, X_test, y_train, y_test):
    models = {
        "Random Forest": RandomForestRegressor(n_estimators=100, random_state=42),
        "XGBoost": XGBRegressor(n_estimators=100, random_state=42),
        "KNN Regressor": KNeighborsRegressor(n_neighbors=5),
        "SVR": SVR(kernel='rbf'),
        "Linear Regression": LinearRegression()
    }
    
    results = {}
    trained_models = {}
    for name, model in models.items():
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)
        mae = mean_absolute_error(y_test, y_pred)
        mse = mean_squared_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        results[name] = {"MAE": mae, "MSE": mse, "R2": r2}
        trained_models[name] = model
        logging.info(f"{name} trained with R2: {r2:.3f}")
    return results, trained_models

def plot_model_performance(results):
    results_df = pd.DataFrame(results).T
    plt.figure(figsize=(12, 6))
    results_df[['MAE', 'MSE', 'R2']].plot(kind='bar', colormap='viridis')
    plt.title("Model Performance Comparison")
    plt.ylabel("Score")
    plt.xticks(rotation=45)
    filename = 'model_performance.png'
    full_path = os.path.join(PLOTS_DIR, filename)
    plt.tight_layout()
    plt.savefig(full_path)
    plt.close()
    return get_relative_plot_path(filename)

def plot_actual_vs_predicted(y_test, y_pred):
    plt.figure(figsize=(10, 6))
    sns.scatterplot(x=y_test, y=y_pred)
    plt.xlabel("Actual PM2.5 Concentration")
    plt.ylabel("Predicted PM2.5 Concentration")
    plt.title("Actual vs Predicted PM2.5 Concentration")
    filename = 'actual_vs_predicted.png'
    full_path = os.path.join(PLOTS_DIR, filename)
    plt.tight_layout()
    plt.savefig(full_path)
    plt.close()
    return get_relative_plot_path(filename)

def plot_feature_importance(model, feature_names, model_name):
    if not hasattr(model, "feature_importances_"):
        return None

    importance = model.feature_importances_
    importance_df = pd.DataFrame({'Feature': feature_names, 'Importance': importance})
    importance_df = importance_df.sort_values(by='Importance', ascending=False)

    plt.figure(figsize=(12, 6))
    # Note: A FutureWarning may occur here; it's safe to ignore or adjust if needed.
    sns.barplot(x=importance_df['Importance'], y=importance_df['Feature'], palette='viridis')
    plt.title(f"Feature Importance ({model_name})")
    plt.xlabel("Importance")
    plt.ylabel("Feature")
    filename = 'feature_importance.png'
    full_path = os.path.join(PLOTS_DIR, filename)
    plt.tight_layout()
    plt.savefig(full_path)
    plt.close()
    return get_relative_plot_path(filename)

def plot_pm25_distribution(df):
    plt.figure(figsize=(10, 6))
    sns.histplot(df['pm25_concentration'], bins=30, kde=True, color='blue')
    plt.title("Distribution of PM2.5 Concentration")
    plt.xlabel("PM2.5 Concentration")
    plt.ylabel("Frequency")
    filename = 'pm25_distribution.png'
    full_path = os.path.join(PLOTS_DIR, filename)
    plt.tight_layout()
    plt.savefig(full_path)
    plt.close()
    return get_relative_plot_path(filename)

def main():
    df = load_data(DATA_FILE)
    X, y, full_df = preprocess_data(df)
    X_train, X_test, y_train, y_test = split_and_scale_data(X, y)
    results, trained_models = train_and_evaluate_models(X_train, X_test, y_train, y_test)
    
    best_model_name = max(results, key=lambda k: results[k]['R2'])
    best_model = trained_models[best_model_name]
    y_pred_best = best_model.predict(X_test)
    
    aqi_categories = [get_aqi_category(val) for val in y_pred_best]
    category_distribution = dict(Counter(aqi_categories))
    
    performance_plot = plot_model_performance(results)
    scatter_plot = plot_actual_vs_predicted(y_test, y_pred_best)
    feat_imp_plot = None
    if best_model_name in ["Random Forest", "XGBoost"]:
        feat_imp_plot = plot_feature_importance(best_model, X.columns, best_model_name)
    distribution_plot = plot_pm25_distribution(full_df)
    
    output = {
        "model_performance": results,
        "best_model": best_model_name,
        "aqi_category_distribution": category_distribution,
        "plots": {
            "model_performance": performance_plot,
            "actual_vs_predicted": scatter_plot,
            "feature_importance": feat_imp_plot,
            "pm25_distribution": distribution_plot
        }
    }
    print(json.dumps(output))

if __name__ == "__main__":
    main()
