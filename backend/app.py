from fastapi import FastAPI, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from engine import analyze_vehicle
from feature_builder import build_vehicle_features


app = FastAPI(
    title="ReDrive Routing API",
    version="0.1.0"
)


# Allow Next.js frontend to call the Python backend locally.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


@app.get("/")
def root():
    return {
        "message": "ReDrive backend is running"
    }


@app.post("/route")
async def route_vehicle(
    request: Request,
    seller_type: str = Form(...),
    vin: str = Form(...),
    mileage: int = Form(...),
    zip: str = Form(...)
):
    # -----------------------------------------------------
    # Read optional multipart fields manually.
    #
    # This lets us safely accept:
    # - zero photos
    # - multiple photos
    # - zero OBD codes
    # - multiple OBD codes
    # -----------------------------------------------------

    form = await request.form()

    raw_photos = form.getlist("photos")

    photos = [
        item
        for item in raw_photos
        if getattr(item, "filename", None)
    ]

    obd_codes = [
        str(code).strip().upper()
        for code in form.getlist("obd_codes")
        if str(code).strip()
    ]

    # -----------------------------------------------------
    # Validation
    # -----------------------------------------------------

    if seller_type not in {
        "individual",
        "business",
        "dealer"
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid seller_type."
        )

    vin = vin.strip().upper()

    if len(vin) != 17:
        raise HTTPException(
            status_code=400,
            detail="VIN must contain 17 characters."
        )

    if mileage < 0:
        raise HTTPException(
            status_code=400,
            detail="Mileage cannot be negative."
        )

    # -----------------------------------------------------
    # ReDrive analysis
    # -----------------------------------------------------

    try:
        vehicle = build_vehicle_features(
            vin=vin,
            mileage=mileage,
            obd_codes=obd_codes
        )

        result = analyze_vehicle(
            vehicle=vehicle,
            seller_type=seller_type
        )

        result["prototype_meta"] = {
            "zip": zip,
            "photos_received": len(photos),
            "obd_codes_received": len(obd_codes),
            "pricing_data": "synthetic prototype assumptions"
        }

        return result

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )