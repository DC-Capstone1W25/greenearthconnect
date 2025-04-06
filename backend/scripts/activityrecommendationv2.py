# backend\scripts\activityrecommendationv2.py
import os
import sys
import json
import pandas as pd
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import LabelEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# -------------- Setup File Paths --------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, '..', 'data', 'activity_recommendation_dataset.csv')

# -------------- Load Dataset --------------
try:
    df = pd.read_csv(DATA_FILE)
except Exception as e:
    print(json.dumps({"error": "Failed to load dataset", "details": str(e)}))
    sys.exit(1)

# -------------- Clean Column Names --------------
df.columns = df.columns.str.strip()

# -------------- Prepare for Encoding: Compute Default Values --------------
# Compute the mode for each categorical column (without lowercasing)
categorical_columns = [
    "Gender", 
    "Health Condition", 
    "Activity Level", 
    "Preference", 
    "Community Event", 
    "Health Advisory", 
    "Recommended Activity"
]
default_values = {}
for col in categorical_columns:
    # Only strip whitespace—do not force lowercase so that options like "None" remain unchanged.
    df[col] = df[col].astype(str).str.strip()
    default_values[col] = df[col].mode()[0]

# -------------- Encode Categorical Variables --------------
label_encoders = {}
for col in categorical_columns:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# -------------- Define Features and Target --------------
FEATURES = [col for col in df.columns if col not in ["Recommended Activity", "User ID"]]
TARGET = "Recommended Activity"

X = df[FEATURES]
y = df[TARGET]

# -------------- Data Splitting --------------
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# -------------- Hyperparameter Tuning & Model Training --------------
param_grid = {
    'n_estimators': [50, 100, 200],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5, 10]
}
grid_search = GridSearchCV(RandomForestClassifier(random_state=42), param_grid, cv=3)
grid_search.fit(X_train, y_train)
best_model = grid_search.best_estimator_

y_pred = best_model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)
print(f"Model Accuracy: {accuracy:.2f}", file=sys.stderr)

# -------------- Helper Function for Safe Transformation --------------
def safe_transform(encoder, value, field_name, default_value):
    """
    Safely transform a categorical value using the given label encoder.
    If the value (after stripping whitespace) is not found in encoder.classes_,
    the provided default_value is used.
    """
    value_processed = value.strip()  # do not force lowercasing
    if value_processed not in encoder.classes_:
        value_processed = default_value
    return encoder.transform([value_processed])[0]

# -------------- Activity Recommendation Function --------------
def recommend_activity(age, gender, health_condition, activity_level, preference, 
                       temperature, humidity, wind_speed, air_quality_index, 
                       crime_rate, traffic_congestion_index, community_event, health_advisory):
    """
    Recommend an activity based on user input features.
    """
    try:
        gender_encoded = safe_transform(label_encoders["Gender"], gender, "Gender", default_values["Gender"])
        health_condition_encoded = safe_transform(label_encoders["Health Condition"], health_condition, "Health Condition", default_values["Health Condition"])
        activity_level_encoded = safe_transform(label_encoders["Activity Level"], activity_level, "Activity Level", default_values["Activity Level"])
        preference_encoded = safe_transform(label_encoders["Preference"], preference, "Preference", default_values["Preference"])
        community_event_encoded = safe_transform(label_encoders["Community Event"], community_event, "Community Event", default_values["Community Event"])
        health_advisory_encoded = safe_transform(label_encoders["Health Advisory"], health_advisory, "Health Advisory", default_values["Health Advisory"])
    except Exception as e:
        return json.dumps({"error": "Invalid categorical input", "details": str(e)})
    
    # Construct input data ensuring the column order matches training data.
    input_data = pd.DataFrame({
        "Age": [float(age)],
        "Gender": [gender_encoded],
        "Health Condition": [health_condition_encoded],
        "Activity Level": [activity_level_encoded],
        "Preference": [preference_encoded],
        "Temperature (°C)": [float(temperature)],
        "Humidity (%)": [float(humidity)],
        "Wind Speed (km/h)": [float(wind_speed)],
        "Air Quality Index": [float(air_quality_index)],
        "Crime Rate": [float(crime_rate)],
        "Traffic Congestion Index": [float(traffic_congestion_index)],
        "Community Event": [community_event_encoded],
        "Health Advisory": [health_advisory_encoded]
    })
    input_data = input_data[FEATURES]
    
    predicted_encoded = best_model.predict(input_data)[0]
    recommended_activity = label_encoders["Recommended Activity"].inverse_transform([predicted_encoded])[0]
    return recommended_activity

# -------------- Main Execution Block --------------
if __name__ == "__main__":
    # Expect 13 parameters: age, gender, health_condition, activity_level, preference,
    # temperature, humidity, wind_speed, air_quality_index, crime_rate,
    # traffic_congestion_index, community_event, health_advisory.
    if len(sys.argv) == 14:
        try:
            age = float(sys.argv[1])
            gender = sys.argv[2]
            health_condition = sys.argv[3]
            activity_level = sys.argv[4]
            preference = sys.argv[5]
            temperature = float(sys.argv[6])
            humidity = float(sys.argv[7])
            wind_speed = float(sys.argv[8])
            air_quality_index = float(sys.argv[9])
            crime_rate = float(sys.argv[10])
            traffic_congestion_index = float(sys.argv[11])
            community_event = sys.argv[12]
            health_advisory = sys.argv[13]
        except Exception as e:
            print(json.dumps({"error": "Invalid input parameters", "details": str(e)}))
            sys.exit(1)
        result = recommend_activity(
            age, gender, health_condition, activity_level, preference,
            temperature, humidity, wind_speed, air_quality_index,
            crime_rate, traffic_congestion_index, community_event, health_advisory
        )
        print(json.dumps({
            "user_input": {
                "age": age,
                "gender": gender,
                "health_condition": health_condition,
                "activity_level": activity_level,
                "preference": preference,
                "temperature": temperature,
                "humidity": humidity,
                "wind_speed": wind_speed,
                "air_quality_index": air_quality_index,
                "crime_rate": crime_rate,
                "traffic_congestion_index": traffic_congestion_index,
                "community_event": community_event,
                "health_advisory": health_advisory
            },
            "recommended_activity": result
        }))
    else:
        print(json.dumps({
            "message": "Please provide 13 parameters: age, gender, health_condition, activity_level, preference, temperature, humidity, wind_speed, air_quality_index, crime_rate, traffic_congestion_index, community_event, health_advisory"
        }))
