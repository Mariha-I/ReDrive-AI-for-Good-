from model import predict_channel


# ---------------------------------------------------------
# PROTOTYPE ASSUMPTIONS
# These are NOT official ACV or Copart fees.
# ---------------------------------------------------------

ACV_FEE_RATE = 0.02
COPART_FEE_RATE = 0.04

ACV_TRANSPORT_COST = 250
COPART_TRANSPORT_COST = 350


def clamp(value, minimum, maximum):
    return max(minimum, min(value, maximum))


def estimate_acv_sale_price(vehicle):
    market_value = vehicle["market_value"]
    condition = vehicle["condition_score"]
    damage = vehicle["damage_severity"]
    mileage = vehicle["mileage"]
    salvage_title = vehicle["salvage_title"]

    multiplier = 0.94

    multiplier += (condition - 75) * 0.002
    multiplier -= damage * 0.04

    if mileage > 100000:
        multiplier -= 0.05

    if mileage > 150000:
        multiplier -= 0.08

    if salvage_title:
        multiplier -= 0.30

    multiplier = clamp(multiplier, 0.25, 1.00)

    return market_value * multiplier


def estimate_copart_sale_price(vehicle):
    market_value = vehicle["market_value"]
    condition = vehicle["condition_score"]
    damage = vehicle["damage_severity"]
    salvage_title = vehicle["salvage_title"]

    multipliers = {
        0: 0.68,
        1: 0.64,
        2: 0.58,
        3: 0.48,
        4: 0.40
    }

    multiplier = multipliers.get(damage, 0.45)

    multiplier += (condition - 50) * 0.001

    if salvage_title:
        multiplier += 0.04

    multiplier = clamp(multiplier, 0.20, 0.80)

    return market_value * multiplier


def calculate_range(net, uncertainty):
    """
    Turn one prototype estimate into an uncertainty range.

    p10 = conservative outcome
    p50 = expected outcome
    p90 = optimistic outcome
    """

    p10 = max(0, net * (1 - uncertainty))
    p50 = max(0, net)
    p90 = max(0, net * (1 + uncertainty * 0.65))

    return {
        "p10": round(p10),
        "p50": round(p50),
        "p90": round(p90)
    }


def acv_explanation(vehicle, ml):
    if vehicle["salvage_title"]:
        return (
            "Dealer demand is limited by title and condition risk, "
            "which reduces expected wholesale proceeds."
        )

    if vehicle["condition_score"] >= 75:
        return (
            "The vehicle's condition, title profile and dealer-market "
            "suitability support a stronger wholesale outcome."
        )

    return (
        "Wholesale remains viable, but condition and reconditioning "
        "costs reduce dealer bidding strength."
    )


def copart_explanation(vehicle, ml):
    if vehicle["salvage_title"] or vehicle["damage_severity"] >= 3:
        return (
            "Selling as-is avoids heavy reconditioning costs and gives "
            "the vehicle access to salvage, rebuilder and dismantler demand."
        )

    return (
        "The salvage channel provides a reliable as-is exit, but buyers "
        "discount vehicles that still have strong wholesale utility."
    )


def calculate_acv_route(vehicle, ml):
    expected_price = estimate_acv_sale_price(vehicle)

    fees = expected_price * ACV_FEE_RATE
    transport = ACV_TRANSPORT_COST
    recon = vehicle["repair_cost"]

    holding = 150 + vehicle["age"] * 10

    # ML suitability helps determine uncertainty/risk.
    risk = (
        (1 - ml["acv_probability"]) * 1500
        + vehicle["damage_severity"] * 150
    )

    net = (
        expected_price
        - fees
        - transport
        - recon
        - holding
        - risk
    )

    uncertainty = (
        0.05
        + vehicle["damage_severity"] * 0.025
        + (1 - ml["acv_probability"]) * 0.08
    )

    uncertainty = clamp(uncertainty, 0.05, 0.25)

    return {
        "channel": "acv_wholesale",

        "net": calculate_range(net, uncertainty),

        "breakdown": {
            "expected_price": round(expected_price),
            "fees": round(fees),
            "transport": round(transport),
            "recon": round(recon),
            "holding": round(holding),
            "risk": round(risk)
        },

        "days_to_sell": round(
            clamp(
                5 + vehicle["damage_severity"] + vehicle["age"] * 0.1,
                4,
                14
            )
        ),

        "explanation": acv_explanation(vehicle, ml)
    }


def calculate_copart_route(vehicle, ml):
    expected_price = estimate_copart_sale_price(vehicle)

    fees = expected_price * COPART_FEE_RATE
    transport = COPART_TRANSPORT_COST

    # Sold as-is.
    recon = 0

    holding = 200

    risk = (
        (1 - ml["copart_probability"]) * 700
    )

    net = (
        expected_price
        - fees
        - transport
        - recon
        - holding
        - risk
    )

    uncertainty = (
        0.07
        + (1 - ml["copart_probability"]) * 0.07
    )

    uncertainty = clamp(uncertainty, 0.06, 0.22)

    return {
        "channel": "copart_salvage",

        "net": calculate_range(net, uncertainty),

        "breakdown": {
            "expected_price": round(expected_price),
            "fees": round(fees),
            "transport": round(transport),
            "recon": round(recon),
            "holding": round(holding),
            "risk": round(risk)
        },

        "days_to_sell": round(
            clamp(
                9 - vehicle["damage_severity"] * 0.4,
                6,
                12
            )
        ),

        "explanation": copart_explanation(vehicle, ml)
    }


def analyze_vehicle(vehicle, seller_type):
    """
    Return output matching the frontend API contract.
    """

    ml = predict_channel(vehicle)

    all_routes = [
        calculate_acv_route(vehicle, ml),
        calculate_copart_route(vehicle, ml)
    ]

    # Frontend contract:
    # individuals can only use Copart.
    if seller_type == "individual":
        eligible_routes = [
            route
            for route in all_routes
            if route["channel"] == "copart_salvage"
        ]
    else:
        eligible_routes = all_routes

    eligible_routes.sort(
        key=lambda route: route["net"]["p50"],
        reverse=True
    )

    recommended = eligible_routes[0]["channel"]

    if len(eligible_routes) > 1:
        delta = (
            eligible_routes[0]["net"]["p50"]
            - eligible_routes[1]["net"]["p50"]
        )
    else:
        delta = None

    return {
        "vehicle": {
            "vin": vehicle["vin"],
            "year": vehicle["year"],
            "make": vehicle["make"],
            "model": vehicle["model"],
            "trim": vehicle["trim"],
            "mileage": vehicle["mileage"]
        },

        "damage": vehicle["damage"],

        "routes": eligible_routes,

        "recommended": recommended,

        "delta_vs_next_best": delta,

        # Internal/debug information.
        # Frontend safely ignores extra JSON fields.
        "model_debug": {
            "classifier_prediction": ml["prediction"],
            "acv_probability": round(
                ml["acv_probability"],
                4
            ),
            "copart_probability": round(
                ml["copart_probability"],
                4
            )
        }
    }