import requests
import json
import pandas as pd
import numpy as np
import folium
import geopandas as gpd
import matplotlib.pyplot as plt
from folium.plugins import TimeSliderChoropleth
from datetime import datetime, timedelta
import xgboost as xgb
import pickle

# Load XGBoost model
with open("xgboost_model.pkl", "rb") as f:
    model = pickle.load(f)

# API Request for current AQI data
def get_real_time_aqi():
    url = "https://api.waqi.info/feed/@243/?token=81c67ba3d30ca471cbba827431d92813ebf669a3"
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        return data['data']['aqi']
    return None

# Generate historical and predicted AQI values
def generate_aqi_data():
    today = datetime.today()
    dates = [today - timedelta(days=i) for i in range(7)] + [today] + [today + timedelta(days=i) for i in range(1, 8)]
    aqi_values = np.random.randint(50, 200, len(dates))  # Placeholder for real AQI data
    
    # Predict future AQI using XGBoost
    future_dates = np.array([(date - today).days for date in dates]).reshape(-1, 1)
    predicted_aqi = model.predict(future_dates)
    
    return {str(dates[i].date()): int(predicted_aqi[i]) for i in range(len(dates))}

# Create map with AQI overlay
def create_aqi_map(aqi_data):
    m = folium.Map(location=[34.0522, -118.2437], zoom_start=10)
    
    geojson_data = {
        "type": "FeatureCollection",
        "features": []
    }
    
    for date, aqi in aqi_data.items():
        color = "green" if aqi < 50 else "yellow" if aqi < 100 else "red"
        geojson_data["features"].append({
            "type": "Feature",
            "properties": {"style": {"color": color, "opacity": 0.5}},
            "geometry": {
                "type": "Polygon",
                "coordinates": [[
                    [-118.5, 34.3], [-118.1, 34.3], [-118.1, 33.9], [-118.5, 33.9], [-118.5, 34.3]
                ]]
            }
        })
    
    TimeSliderChoropleth(geojson_data, styledict={
        str(date): {
            "color": "red",
            "opacity": 0.5
        } for date in aqi_data.keys()
    }).add_to(m)
    
    return m

# Run the full pipeline
def main():
    real_time_aqi = get_real_time_aqi()
    print(f"Real-time AQI: {real_time_aqi}")
    
    aqi_data = generate_aqi_data()
    aqi_map = create_aqi_map(aqi_data)
    aqi_map.save("aqi_map.html")
    print("Map saved as aqi_map.html")

if __name__ == "__main__":
    main()