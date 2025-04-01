import folium
from folium.plugins import HeatMap
import json

# Load the GeoJSON file containing Los Angeles district boundaries
geojson_path = "map.geojson"  # Make sure this file is in the same directory
with open(geojson_path, "r", encoding="utf-8") as f:
    geojson_data = json.load(f)

# Sample air quality data (replace this with real AQI data)
air_quality_data = [
    [34.0522, -118.2437, 45],  # Downtown LA
    [34.0520, -118.2500, 100], # Another area in LA
    [34.0600, -118.2300, 150], # Poor air quality area
]

# Create the map centered around Los Angeles
m = folium.Map(location=[34.0522, -118.2437], zoom_start=10)    

# Prepare the heatmap data (latitude, longitude, and AQI as weight)
heatmap_data = [[lat, lon, aqi] for lat, lon, aqi in air_quality_data]
HeatMap(heatmap_data).add_to(m)

# Add the choropleth map using real district boundaries
folium.Choropleth(
    geo_data=geojson_data,
    name="AQI",
    data={f"District {i+1}": air_quality_data[i][2] for i in range(len(air_quality_data))},  # Mapping AQI values to districts
    key_on="feature.properties.name",  # Ensure the GeoJSON file has a "name" property for districts
    fill_opacity=0.7,
    fill_color="YlOrRd",  # Yellow-Orange-Red color scheme
    line_opacity=0.2,
    legend_name="Air Quality Index (AQI)",
).add_to(m)

# Save the map to an HTML file
m.save("la_air_quality_map.html")

print("Map saved as la_air_quality_map.html. Open it in your browser.")