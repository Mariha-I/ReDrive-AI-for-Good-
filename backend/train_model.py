import random

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split


# Make our synthetic data repeatable
random.seed(42)


def generate_vehicle():
    age = random.randint(0, 20)
    mileage = random.randint(5000, 220000)

    # 0 = excellent, 100 = excellent? No:
    # We use 0 = terrible, 100 = excellent.
    condition_score = random.randint(20, 100)

    # Damage:
    # 0 = none
    # 1 = minor
    # 2 = moderate
    # 3 = severe
    # 4 = very severe / total-loss-like
    damage_severity = random.randint(0, 4)

    market_value = random.randint(4000, 50000)

    # Repair cost tends to increase with damage.
    base_repair = damage_severity * random.randint(800, 4000)
    repair_cost = min(
        market_value,
        max(0, base_repair + random.randint(-500, 1500))
    )

    # Most vehicles have clean titles.
    salvage_title = 1 if random.random() < 0.15 else 0

    repair_ratio = repair_cost / market_value

    # Synthetic labeling logic.
    # COPART is favored when repair economics or condition are poor.
    if (
        salvage_title == 1
        or damage_severity >= 4
        or repair_ratio >= 0.60
        or condition_score <= 35
    ):
        label = "COPART"

    # Borderline damaged vehicles.
    elif (
        damage_severity >= 3
        and repair_ratio >= 0.35
    ):
        label = "COPART"

    else:
        label = "ACV"

    return {
        "age": age,
        "mileage": mileage,
        "condition_score": condition_score,
        "damage_severity": damage_severity,
        "repair_cost": repair_cost,
        "market_value": market_value,
        "salvage_title": salvage_title,
        "label": label
    }


# Generate 2,000 synthetic vehicles
vehicles = [generate_vehicle() for _ in range(2000)]

df = pd.DataFrame(vehicles)

# Save dataset so we can inspect it later
df.to_csv("data/vehicles.csv", index=False)

print("Synthetic dataset created.")
print()
print(df.head())
print()

# Input features
features = [
    "age",
    "mileage",
    "condition_score",
    "damage_severity",
    "repair_cost",
    "market_value",
    "salvage_title"
]

X = df[features]
y = df["label"]

# Split into training and testing portions
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.20,
    random_state=42,
    stratify=y
)

# Create ML model
model = RandomForestClassifier(
    n_estimators=150,
    random_state=42
)

# Train
model.fit(X_train, y_train)

# Test
predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

print(f"Model accuracy on synthetic test data: {accuracy:.2%}")

# Save trained model
joblib.dump(model, "redrive_classifier.joblib")

print("Model saved as redrive_classifier.joblib")