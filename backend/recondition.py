from engine import analyze_vehicle


# ---------------------------------------------------------
# Prototype reconditioning options
#
# value_lifts are prototype assumptions, NOT official
# ACV / Copart pricing data.
# ---------------------------------------------------------

DEMO_RECON_ITEMS = {
    "2T3P1RFV5PW000001": [
        {
            "id": "detail",
            "name": "Professional detail and odor treatment",
            "kind": "repair",
            "description": "Full interior and exterior detail plus odor treatment.",
            "cost": 250,
            "days_added": 1,
            "reason": "Cleaner presentation can improve buyer confidence and bidding.",
            "lifts": {
                "acv_wholesale": 600,
                "copart_salvage": 200,
            },
        },
        {
            "id": "tires",
            "name": "Replace worn tires",
            "kind": "repair",
            "description": "Install four mid-tier all-season tires.",
            "cost": 780,
            "days_added": 1,
            "reason": "Wholesale buyers often discount vehicles that need immediate tire replacement.",
            "lifts": {
                "acv_wholesale": 1100,
                "copart_salvage": 300,
            },
        },
        {
            "id": "seat_bolster",
            "name": "Driver seat bolster repair",
            "kind": "repair",
            "description": "Repair visible wear on the driver's seat bolster.",
            "cost": 180,
            "days_added": 1,
            "reason": "Removes one of the vehicle's few visible condition issues.",
            "lifts": {
                "acv_wholesale": 250,
                "copart_salvage": 50,
            },
        },
        {
            "id": "cargo_liner",
            "name": "Add all-weather mats and cargo liner",
            "kind": "upgrade",
            "description": "Add replacement floor mats and a cargo liner.",
            "cost": 220,
            "days_added": 0,
            "reason": "Accessories add convenience but limited auction value.",
            "lifts": {
                "acv_wholesale": 100,
                "copart_salvage": 30,
            },
        },
    ],

    "1HGCV1F34LA000002": [
        {
            "id": "pdr",
            "name": "Paintless dent repair",
            "kind": "repair",
            "description": "Remove hail dents from the hood, roof and trunk without repainting.",
            "cost": 2400,
            "days_added": 5,
            "reason": "Removing hail damage can materially improve dealer bidding.",
            "lifts": {
                "acv_wholesale": 3900,
                "copart_salvage": 1050,
            },
        },
        {
            "id": "detail",
            "name": "Detail and light paint correction",
            "kind": "repair",
            "description": "Interior detail and light exterior paint correction.",
            "cost": 300,
            "days_added": 1,
            "reason": "Improves presentation after dent repair.",
            "lifts": {
                "acv_wholesale": 450,
                "copart_salvage": 150,
            },
        },
        {
            "id": "hood_replace",
            "name": "Replace and repaint hood",
            "kind": "repair",
            "description": "Replace and repaint the hood instead of using paintless dent repair.",
            "cost": 1900,
            "days_added": 6,
            "reason": "More expensive than the value expected from the repair.",
            "lifts": {
                "acv_wholesale": 1300,
                "copart_salvage": 700,
            },
        },
    ],

    "1FTFW1E50NFA00000": [
        {
            "id": "misfire",
            "name": "Fix engine misfire",
            "kind": "repair",
            "description": "Diagnose the misfire and replace plugs or failed ignition components.",
            "cost": 420,
            "days_added": 1,
            "reason": "A smoothly running vehicle attracts more bidders.",
            "lifts": {
                "acv_wholesale": 700,
                "copart_salvage": 900,
            },
        },
        {
            "id": "bumper",
            "name": "Replace front bumper cover",
            "kind": "repair",
            "description": "Replace the visibly damaged front bumper cover.",
            "cost": 650,
            "days_added": 2,
            "reason": "Visible front-end damage reduces buyer confidence.",
            "lifts": {
                "acv_wholesale": 800,
                "copart_salvage": 900,
            },
        },
        {
            "id": "dryout",
            "name": "Interior dry-out and deodorize",
            "kind": "repair",
            "description": "Remove moisture and treat the interior for odor and mildew.",
            "cost": 180,
            "days_added": 1,
            "reason": "Reducing obvious flood symptoms can improve bidding.",
            "lifts": {
                "acv_wholesale": 300,
                "copart_salvage": 400,
            },
        },
        {
            "id": "flood_full",
            "name": "Full flood remediation",
            "kind": "repair",
            "description": "Replace carpet and damaged interior components and inspect electrical systems.",
            "cost": 3200,
            "days_added": 10,
            "reason": "The flood history remains, so a full restoration is unlikely to pay back.",
            "lifts": {
                "acv_wholesale": 1700,
                "copart_salvage": 1800,
            },
        },
    ],
}


def generic_items(vehicle):
    """
    Basic fallback for VINs outside the three prepared demo vehicles.
    """

    items = [
        {
            "id": "detail",
            "name": "Professional vehicle detail",
            "kind": "repair",
            "description": "Interior and exterior cleaning before auction.",
            "cost": 250,
            "days_added": 1,
            "reason": "Improved presentation may increase bidder confidence.",
            "lifts": {
                "acv_wholesale": 450,
                "copart_salvage": 120,
            },
        }
    ]

    if vehicle["repair_cost"] > 0:
        repair_cost = min(round(vehicle["repair_cost"]), 1500)

        items.append(
            {
                "id": "mechanical",
                "name": "Address diagnostic issues",
                "kind": "repair",
                "description": "Inspect and address the supplied mechanical or OBD-related issues.",
                "cost": repair_cost,
                "days_added": 2,
                "reason": "Resolving known mechanical issues can reduce buyer uncertainty.",
                "lifts": {
                    "acv_wholesale": round(repair_cost * 1.25),
                    "copart_salvage": round(repair_cost * 0.60),
                },
            }
        )

    return items


def adjusted_range(base_range, net_change):
    """
    Apply the projected improvement to the existing route range.
    """

    return {
        "p10": max(0, round(base_range["p10"] + net_change * 0.85)),
        "p50": max(0, round(base_range["p50"] + net_change)),
        "p90": max(0, round(base_range["p90"] + net_change * 1.10)),
    }


def analyze_reconditioning(vehicle, seller_type):
    """
    Compare selling as-is against performing financially useful
    reconditioning work first.
    """

    route_result = analyze_vehicle(
        vehicle=vehicle,
        seller_type=seller_type,
    )

    templates = DEMO_RECON_ITEMS.get(
        vehicle["vin"],
        generic_items(vehicle),
    )

    scenarios = []

    for route in route_result["routes"]:
        channel = route["channel"]

        candidate_items = []

        for item in templates:
            lift = item["lifts"].get(channel, 0)
            net_gain = lift - item["cost"]

            candidate_items.append(
                {
                    **item,
                    "value_lift": lift,
                    "net_gain": net_gain,
                }
            )

        profitable = [
            item
            for item in candidate_items
            if item["net_gain"] > 0
        ]

        package_cost = sum(
            item["cost"]
            for item in profitable
        )

        total_value_lift = sum(
            item["value_lift"]
            for item in profitable
        )

        days_added = max(
            [item["days_added"] for item in profitable],
            default=0,
        )

        old_breakdown = route["breakdown"]

        old_expected_price = old_breakdown["expected_price"]

        if old_expected_price > 0:
            fee_rate = (
                old_breakdown["fees"]
                / old_expected_price
            )
        else:
            fee_rate = 0

        new_expected_price = (
            old_expected_price
            + total_value_lift
        )

        new_fees = round(
            new_expected_price * fee_rate
        )

        additional_fees = (
            new_fees
            - old_breakdown["fees"]
        )

        # Small prototype holding cost for additional repair time.
        additional_holding = days_added * 20

        # Severe-damage vehicles keep additional uncertainty even
        # after inexpensive cosmetic/mechanical repairs.
        additional_risk = 0

        if vehicle["damage_severity"] >= 4:
            additional_risk = 280

        net_change = round(
            total_value_lift
            - package_cost
            - additional_fees
            - additional_holding
            - additional_risk
        )

        reconditioned_breakdown = {
            "expected_price": round(new_expected_price),
            "fees": round(new_fees),
            "transport": old_breakdown["transport"],
            "recon": round(
                old_breakdown["recon"]
                + package_cost
            ),
            "holding": round(
                old_breakdown["holding"]
                + additional_holding
            ),
            "risk": round(
                old_breakdown["risk"]
                + additional_risk
            ),
        }

        if net_change > 0:
            explanation = (
                "The selected repairs are expected to increase sale "
                "proceeds by more than their combined cost."
            )
        else:
            explanation = (
                "The projected value increase does not fully recover "
                "the repair cost, added time and risk."
            )

        scenarios.append(
            {
                "channel": channel,
                "as_is": route["net"],
                "reconditioned": {
                    "net": adjusted_range(
                        route["net"],
                        net_change,
                    ),
                    "breakdown": reconditioned_breakdown,
                    "days_to_sell": (
                        route["days_to_sell"]
                        + days_added
                    ),
                },
                "net_change": net_change,
                "explanation": explanation,
            }
        )

    scenarios.sort(
        key=lambda scenario:
        scenario["reconditioned"]["net"]["p50"],
        reverse=True,
    )

    best = scenarios[0]

    verdict = (
        "recondition"
        if best["net_change"] > 0
        else "sell_as_is"
    )

    recommended_channel = best["channel"]

    # Item values shown in the UI correspond to the channel
    # that ReDrive recommends after reconditioning.
    output_items = []

    for item in templates:
        lift = item["lifts"].get(
            recommended_channel,
            0,
        )

        net_gain = lift - item["cost"]

        output_items.append(
            {
                "id": item["id"],
                "name": item["name"],
                "kind": item["kind"],
                "description": item["description"],
                "cost": item["cost"],
                "value_lift": lift,
                "net_gain": net_gain,
                "days_added": item["days_added"],
                "recommended": (
                    verdict == "recondition"
                    and net_gain > 0
                ),
                "reason": item["reason"],
            }
        )

    package_cost = sum(
        item["cost"]
        for item in output_items
        if item["recommended"]
    )

    return {
        "vehicle": route_result["vehicle"],
        "items": output_items,
        "scenarios": scenarios,
        "recommended_channel": recommended_channel,
        "verdict": verdict,
        "package_cost": package_cost,
    }