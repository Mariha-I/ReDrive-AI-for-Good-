from datetime import datetime

from vpic import decode_vin


CURRENT_YEAR = datetime.now().year


# ---------------------------------------------------------
# DEMO PROFILES
# These match the three vehicles already built by frontend.
# Proprietary auction values are prototype assumptions.
# ---------------------------------------------------------

DEMO_PROFILES = {
    "2T3P1RFV5PW000001": {
        "year": 2023,
        "make": "Toyota",
        "model": "RAV4",
        "trim": "XLE",
        "condition_score": 92,
        "damage_severity": 1,
        "repair_cost": 300,
        "market_value": 33000,
        "salvage_title": 0,
        "damage": {
            "summary": (
                "No significant damage detected. Light wear on the "
                "driver seat bolster; all panels appear straight."
            ),
            "items": [
                {
                    "panel": "driver_seat",
                    "severity": 1,
                    "structural": False
                }
            ],
            "flood_risk": False,
            "airbags_deployed": False,
            "confidence": 0.91
        }
    },

    "1HGCV1F34LA000002": {
        "year": 2020,
        "make": "Honda",
        "model": "Accord",
        "trim": "Sport",
        "condition_score": 72,
        "damage_severity": 2,
        "repair_cost": 0,
        "market_value": 20500,
        "salvage_title": 0,
        "damage": {
            "summary": (
                "Widespread cosmetic hail damage across the hood, "
                "roof and trunk. No structural damage indicated."
            ),
            "items": [
                {
                    "panel": "hood",
                    "severity": 3,
                    "structural": False
                },
                {
                    "panel": "roof",
                    "severity": 3,
                    "structural": False
                },
                {
                    "panel": "trunk_lid",
                    "severity": 2,
                    "structural": False
                }
            ],
            "flood_risk": False,
            "airbags_deployed": False,
            "confidence": 0.87
        }
    },

    "1FTFW1E50NFA00000": {
        "year": 2022,
        "make": "Ford",
        "model": "F-150",
        "trim": "XLT",
        "condition_score": 28,
        "damage_severity": 4,
        "repair_cost": 11000,
        "market_value": 30000,
        "salvage_title": 1,
        "damage": {
            "summary": (
                "Flood indicators plus moderate exterior damage. "
                "This vehicle has high reconditioning risk."
            ),
            "items": [
                {
                    "panel": "interior_carpet",
                    "severity": 4,
                    "structural": False
                },
                {
                    "panel": "seat_rails",
                    "severity": 3,
                    "structural": False
                },
                {
                    "panel": "front_bumper",
                    "severity": 3,
                    "structural": False
                }
            ],
            "flood_risk": True,
            "airbags_deployed": False,
            "confidence": 0.82
        }
    }
}


def estimate_market_value(age, mileage):
    """
    Generic fallback estimate for prototype use only.

    Real production values would come from ACV/Copart
    historical transaction and pricing data.
    """

    base_value = 32000

    # Depreciation by vehicle age
    value = base_value * (0.88 ** age)

    # Mileage adjustment
    if mileage > 50000:
        value *= 0.93

    if mileage > 100000:
        value *= 0.85

    if mileage > 150000:
        value *= 0.78

    return max(3000, round(value, 2))


def build_vehicle_features(vin, mileage, obd_codes=None):
    obd_codes = obd_codes or []
    vin = vin.strip().upper()

    # -----------------------------------------------------
    # Known demo vehicle
    # -----------------------------------------------------

    if vin in DEMO_PROFILES:
        profile = DEMO_PROFILES[vin].copy()

        age = max(0, CURRENT_YEAR - profile["year"])

        return {
            "vin": vin,
            "year": profile["year"],
            "make": profile["make"],
            "model": profile["model"],
            "trim": profile["trim"],
            "age": age,
            "mileage": mileage,
            "condition_score": profile["condition_score"],
            "damage_severity": profile["damage_severity"],
            "repair_cost": profile["repair_cost"],
            "market_value": profile["market_value"],
            "salvage_title": profile["salvage_title"],
            "damage": profile["damage"]
        }

    # -----------------------------------------------------
    # Generic vehicle using real vPIC decoding
    # -----------------------------------------------------

    decoded = decode_vin(vin)

    if decoded is None:
        raise ValueError("VIN could not be decoded.")

    year_text = decoded.get("year")

    try:
        year = int(year_text)
    except (TypeError, ValueError):
        year = CURRENT_YEAR

    age = max(0, CURRENT_YEAR - year)

    # Generic prototype condition estimate.
    condition_score = 92

    # Older cars lose some condition score.
    condition_score -= age * 2

    # Mileage adjustment.
    if mileage > 60000:
        condition_score -= 5

    if mileage > 100000:
        condition_score -= 8

    if mileage > 150000:
        condition_score -= 10

    # OBD codes indicate mechanical risk.
    condition_score -= min(len(obd_codes) * 4, 20)

    condition_score = max(20, min(condition_score, 100))

    damage_severity = 0

    # Prototype repair allowance for OBD codes.
    repair_cost = len(obd_codes) * 350

    market_value = estimate_market_value(age, mileage)

    return {
        "vin": vin,
        "year": year,
        "make": decoded.get("make") or "Unknown",
        "model": decoded.get("model") or "Unknown",
        "trim": decoded.get("trim") or "",
        "age": age,
        "mileage": mileage,
        "condition_score": condition_score,
        "damage_severity": damage_severity,
        "repair_cost": repair_cost,
        "market_value": market_value,
        "salvage_title": 0,

        # Low confidence because photos are not analyzed yet.
        "damage": {
            "summary": (
                "No severe damage indicators were supplied to the "
                "prototype analysis. Photo-based AI inspection is "
                "planned as the next model layer."
            ),
            "items": [],
            "flood_risk": False,
            "airbags_deployed": False,
            "confidence": 0.45
        }
    }