import requests


def decode_vin(vin):
    url = f"https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()

        data = response.json()

        if not data.get("Results"):
            return None

        result = data["Results"][0]

        vehicle = {
            "vin": vin,
            "year": result.get("ModelYear"),
            "make": result.get("Make"),
            "model": result.get("Model"),
            "trim": result.get("Trim"),
            "vehicle_type": result.get("VehicleType"),
            "body_class": result.get("BodyClass"),
            "drive_type": result.get("DriveType"),
            "fuel_type": result.get("FuelTypePrimary"),
            "engine_cylinders": result.get("EngineCylinders"),
            "engine_displacement": result.get("DisplacementL")
        }

        return vehicle

    except requests.RequestException as error:
        print("Error calling vPIC API:", error)
        return None


if __name__ == "__main__":
    test_vin = "3GNDA13D76S000000"

    vehicle = decode_vin(test_vin)

    print("\nVehicle Information")
    print("-------------------")

    if vehicle:
        for key, value in vehicle.items():
            print(f"{key}: {value}")
    else:
        print("Could not decode VIN.")