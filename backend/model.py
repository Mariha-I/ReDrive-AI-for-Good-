import joblib
import pandas as pd


MODEL_PATH = "redrive_classifier.joblib"


model = joblib.load(MODEL_PATH)


FEATURES = [
    "age",
    "mileage",
    "condition_score",
    "damage_severity",
    "repair_cost",
    "market_value",
    "salvage_title"
]


def predict_channel(vehicle):
    """
    Predict whether a vehicle is better suited for
    ACV wholesale or Copart salvage.
    """

    input_data = pd.DataFrame(
        [[vehicle[feature] for feature in FEATURES]],
        columns=FEATURES
    )

    prediction = model.predict(input_data)[0]

    probabilities = model.predict_proba(input_data)[0]

    classes = model.classes_

    probability_map = {
        classes[i]: float(probabilities[i])
        for i in range(len(classes))
    }

    return {
        "prediction": prediction,
        "acv_probability": probability_map.get("ACV", 0.0),
        "copart_probability": probability_map.get("COPART", 0.0)
    }


if __name__ == "__main__":

    test_vehicle = {
    "age": 14,
    "mileage": 180000,
    "condition_score": 28,
    "damage_severity": 4,
    "repair_cost": 12000,
    "market_value": 15000,
    "salvage_title": 1
}

    result = predict_channel(test_vehicle)

    print("\nReDrive ML Classification")
    print("-------------------------")
    print("Prediction:", result["prediction"])
    print(
        "ACV probability:",
        f'{result["acv_probability"]:.1%}'
    )
    print(
        "Copart probability:",
        f'{result["copart_probability"]:.1%}'
    )