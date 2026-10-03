from model import predict_channel


# ---------------------------------------------------------
# DEMO ASSUMPTIONS
# These are prototype assumptions, NOT official ACV/Copart fees.
# In production, these values would come from real company data.
# ---------------------------------------------------------

ACV_FEE_RATE = 0.02
COPART_FEE_RATE = 0.025

ACV_TRANSPORT_COST = 250
COPART_TRANSPORT_COST = 350


def estimate_acv_sale_price(vehicle):
    """
    Estimate expected ACV wholesale sale price.

    This is a prototype heuristic.
    """

    market_value = vehicle["market_value"]
    condition = vehicle["condition_score"]
    damage = vehicle["damage_severity"]
    mileage = vehicle["mileage"]
    salvage_title = vehicle["salvage_title"]

    multiplier = 0.90

    # Better condition helps ACV wholesale value
    multiplier += (condition - 70) * 0.002

    # Damage reduces wholesale value
    multiplier -= damage * 0.04

    # Very high mileage reduces demand
    if mileage > 120000:
        multiplier -= 0.05

    if mileage > 180000:
        multiplier -= 0.05

    # Salvage title hurts dealer-wholesale economics heavily
    if salvage_title == 1:
        multiplier -= 0.25

    # Prevent unrealistic values
    multiplier = max(0.30, min(multiplier, 1.00))

    return market_value * multiplier


def estimate_copart_sale_price(vehicle):
    """
    Estimate expected Copart salvage sale price.

    This is a prototype heuristic.
    """

    market_value = vehicle["market_value"]
    condition = vehicle["condition_score"]
    damage = vehicle["damage_severity"]
    salvage_title = vehicle["salvage_title"]

    # Salvage recovery percentage of market value
    salvage_multipliers = {
        0: 0.70,
        1: 0.65,
        2: 0.55,
        3: 0.45,
        4: 0.35
    }

    multiplier = salvage_multipliers.get(damage, 0.40)

    # Better condition slightly increases salvage auction value
    multiplier += (condition - 50) * 0.001

    # Salvage title is less damaging inside a salvage marketplace
    if salvage_title == 1:
        multiplier += 0.03

    multiplier = max(0.20, min(multiplier, 0.80))

    return market_value * multiplier


def calculate_acv_net(vehicle):
    expected_sale_price = estimate_acv_sale_price(vehicle)

    fee = expected_sale_price * ACV_FEE_RATE

    # Assume some reconditioning may be needed for wholesale
    reconditioning_cost = vehicle["repair_cost"]

    net = (
        expected_sale_price
        - fee
        - ACV_TRANSPORT_COST
        - reconditioning_cost
    )

    return {
        "expected_sale_price": round(expected_sale_price, 2),
        "fee": round(fee, 2),
        "transport_cost": ACV_TRANSPORT_COST,
        "repair_cost": round(reconditioning_cost, 2),
        "net_proceeds": round(net, 2)
    }


def calculate_copart_net(vehicle):
    expected_sale_price = estimate_copart_sale_price(vehicle)

    fee = expected_sale_price * COPART_FEE_RATE

    # Salvage route assumes vehicle is sold as-is
    repair_cost = 0

    net = (
        expected_sale_price
        - fee
        - COPART_TRANSPORT_COST
    )

    return {
        "expected_sale_price": round(expected_sale_price, 2),
        "fee": round(fee, 2),
        "transport_cost": COPART_TRANSPORT_COST,
        "repair_cost": repair_cost,
        "net_proceeds": round(net, 2)
    }


def analyze_vehicle(vehicle):
    """
    Complete ReDrive analysis:
    1. ML suitability
    2. Economic calculations
    3. Final recommendation based on seller net proceeds
    """

    ml_result = predict_channel(vehicle)

    acv = calculate_acv_net(vehicle)
    copart = calculate_copart_net(vehicle)

    if acv["net_proceeds"] >= copart["net_proceeds"]:
        recommendation = "ACV"
        advantage = acv["net_proceeds"] - copart["net_proceeds"]
    else:
        recommendation = "COPART"
        advantage = copart["net_proceeds"] - acv["net_proceeds"]

    return {
        "recommendation": recommendation,
        "net_advantage": round(advantage, 2),
        "ml": ml_result,
        "acv": acv,
        "copart": copart
    }


if __name__ == "__main__":

    test_vehicles = [
        {
            "name": "Good condition vehicle",
            "age": 5,
            "mileage": 65000,
            "condition_score": 85,
            "damage_severity": 1,
            "repair_cost": 800,
            "market_value": 22000,
            "salvage_title": 0
        },

        {
            "name": "Heavily damaged vehicle",
            "age": 10,
            "mileage": 135000,
            "condition_score": 30,
            "damage_severity": 4,
            "repair_cost": 11000,
            "market_value": 15000,
            "salvage_title": 1
        }
    ]

    for vehicle in test_vehicles:

        print("\n===================================")
        print(vehicle["name"])
        print("===================================")

        result = analyze_vehicle(vehicle)

        print("\nML Suitability:")
        print(
            f"ACV: {result['ml']['acv_probability']:.1%}"
        )
        print(
            f"Copart: {result['ml']['copart_probability']:.1%}"
        )

        print("\nACV:")
        print(
            f"Expected sale: ${result['acv']['expected_sale_price']:,.2f}"
        )
        print(
            f"Net proceeds:  ${result['acv']['net_proceeds']:,.2f}"
        )

        print("\nCopart:")
        print(
            f"Expected sale: ${result['copart']['expected_sale_price']:,.2f}"
        )
        print(
            f"Net proceeds:  ${result['copart']['net_proceeds']:,.2f}"
        )

        print("\nFINAL RECOMMENDATION:")
        print(result["recommendation"])

        print(
            f"Estimated seller advantage: "
            f"${result['net_advantage']:,.2f}"
        )