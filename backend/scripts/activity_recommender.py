# backend/scripts/activity_recommender.py
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
DATA_FILE = os.path.join(BASE_DIR, '..', 'data', '10K_Activity_Dataset.csv')

# -------------- Load Dataset --------------
try:
    df = pd.read_csv(DATA_FILE)
except Exception as e:
    print(json.dumps({"error": "Failed to load dataset", "details": str(e)}))
    sys.exit(1)

# -------------- Encode Categorical Variables --------------
# Encode Time_of_Day, AQI_Category, and Suggested_Activity
label_encoders = {}
categorical_columns = ['Time_of_Day', 'AQI_Category', 'Suggested_Activity']
for col in categorical_columns:
    try:
        le = LabelEncoder()
        df[col] = le.fit_transform(df[col])
        label_encoders[col] = le
    except Exception as e:
        print(json.dumps({"error": f"Failed to encode column {col}", "details": str(e)}))
        sys.exit(1)

# -------------- Feature Engineering --------------
# For training, consider outdoor-friendly if AQI < 50 and Time_of_Day is between 8 and 18
df['Outdoor_Friendly'] = ((df['AQI'] < 50) & (df['Time_of_Day'].between(8, 18))).astype(int)

# -------------- Data Preparation --------------
FEATURES = ['Age', 'Time_of_Day', 'AQI', 'Temperature', 'Precipitation', 'Outdoor_Friendly']
TARGET = 'Suggested_Activity'

X = df[FEATURES]
y = df[TARGET]

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

# Print model accuracy to stderr for debugging purposes
print(f"Model Accuracy: {accuracy:.2f}", file=sys.stderr)

# -------------- Activity Recommendation Function --------------
def recommend_activity(age, time_of_day, aqi, temperature, precipitation):
    """
    Recommend an activity based on user input features.
    
    Parameters:
      age (float): Age of the user.
      time_of_day (str): Input time of day (e.g., "14") as expected by the model.
      aqi (float): Air Quality Index.
      temperature (float): Temperature value.
      precipitation (float): Precipitation value.
    
    Returns:
      str: The recommended activity (decoded from the label encoder).
    """
    try:
        # Encode the input time_of_day using the Time_of_Day label encoder
        time_of_day_encoded = label_encoders['Time_of_Day'].transform([time_of_day])[0]
    except Exception as e:
        return json.dumps({"error": "Invalid time_of_day value", "details": str(e)})
    
    try:
        # Calculate outdoor-friendly condition:
        # Set to 1 if AQI < 100 and time between 6 and 20, else 0.
        outdoor_friendly = int((aqi < 100) and (6 <= int(time_of_day) <= 20))
    except Exception as e:
        return json.dumps({"error": "Error calculating outdoor_friendly", "details": str(e)})
    
    input_data = pd.DataFrame({
        'Age': [age],
        'Time_of_Day': [time_of_day_encoded],
        'AQI': [aqi],
        'Temperature': [temperature],
        'Precipitation': [precipitation],
        'Outdoor_Friendly': [outdoor_friendly]
    })
    
    predicted_activity_encoded = best_model.predict(input_data)[0]
    predicted_activity = label_encoders['Suggested_Activity'].inverse_transform([predicted_activity_encoded])[0]
    return predicted_activity

# -------------- Main Execution Block --------------
if __name__ == "__main__":
    # If command-line parameters are provided, use them as user input.
    if len(sys.argv) == 6:
        try:
            age = float(sys.argv[1])
            time_of_day = sys.argv[2]
            aqi = float(sys.argv[3])
            temperature = float(sys.argv[4])
            precipitation = float(sys.argv[5])
        except Exception as e:
            print(json.dumps({"error": "Invalid input parameters", "details": str(e)}))
            sys.exit(1)
        result = recommend_activity(age, time_of_day, aqi, temperature, precipitation)
        print(json.dumps({
            "user_input": {
                "age": age,
                "time_of_day": time_of_day,
                "aqi": aqi,
                "temperature": temperature,
                "precipitation": precipitation
            },
            "recommended_activity": result
        }))
    else:
        # If no command-line parameters are provided, print a usage message.
        print(json.dumps({"message": "Please provide 5 parameters: age, time_of_day, aqi, temperature, precipitation"}))
