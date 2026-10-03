# ReDrive: Highest-and-Best-Use Router

Hackathon project for ACV Auctions + Copart (Copart is acquiring ACV; deal expected to close end of 2026).

## What we're building
A tool that takes one or more vehicles (VIN, photos, mileage, location, optional OBD codes) and recommends
which disposition channel maximizes net proceeds, with a plain-English explanation. Sellers first say what
kind of seller they are; that decides which channels they can use.

Channels offered (the only two the product shows):
- `acv_wholesale`: dealer-to-dealer digital auction (ACV). UI label: "Dealer Wholesale Auction"
- `copart_salvage`: salvage auction (Copart). UI label: "Salvage Auction"

Seller types and eligible channels:
- `individual`: `copart_salvage` only
- `business`: `acv_wholesale`, `copart_salvage`
- `dealer`: `acv_wholesale`, `copart_salvage`

Net proceeds = expected_price × P(sale) − fees − transport − reconditioning − holding_cost − risk_adjustment

## Stack
- Frontend: Next.js (App Router) + TypeScript + Tailwind CSS + Recharts
- Backend (separate, built in parallel): Python FastAPI at `http://localhost:8000`
- Until the backend exists, the frontend uses mock data from `/frontend/mocks/` behind a single
  API client module (`/frontend/lib/api.ts`) with a `USE_MOCKS` flag. Never call fetch directly from components.

## API contract (frontend codes against this)

### POST /route (single vehicle)
Multipart: seller_type, vin, mileage, zip, photos[], obd_codes[] optional

Response:
```json
{
  "vehicle": { "vin": "1FTFW1E50NFA00000", "year": 2022, "make": "Ford", "model": "F-150", "trim": "XLT", "mileage": 161000 },
  "damage": {
    "summary": "Flood indicators on interior carpet and seat rails; moderate front bumper damage.",
    "items": [ { "panel": "front_bumper", "severity": 3, "structural": false } ],
    "flood_risk": true, "airbags_deployed": false, "confidence": 0.82
  },
  "routes": [
    {
      "channel": "copart_salvage",
      "net": { "p10": 8000, "p50": 9300, "p90": 10400 },
      "breakdown": { "expected_price": 11800, "fees": 950, "transport": 350, "recon": 0, "holding": 300, "risk": 900 },
      "days_to_sell": 10,
      "explanation": "US rebuilders will buy it, but a flood history plus 161k miles limits how much they can resell it for after repair."
    }
  ],
  "recommended": "copart_salvage",
  "delta_vs_next_best": 2050
}
```
- `routes` contains only channels eligible for `seller_type`, sorted by `net.p50` descending.
- `delta_vs_next_best` is `null` when only one route is eligible.

### POST /route/batch (multiple vehicles)
Multipart: seller_type, vehicles (JSON string: `[{ "vin", "mileage", "zip", "obd_codes": [] }]`),
and photos for vehicle *i* under the field `photos_{i}`.

Response:
```json
{
  "results": [ /* one /route response per vehicle, same order as the request */ ],
  "summary": {
    "units": 3,
    "total_net": { "p10": 51500, "p50": 55000, "p90": 57800 },
    "days_to_sell_all": 10,
    "by_channel": [
      { "channel": "acv_wholesale", "units": 2, "net": { "p10": 43500, "p50": 45700, "p90": 47400 } }
    ]
  }
}
```
Summary uses each vehicle's recommended route. `by_channel` is sorted by `net.p50` descending.

### POST /recondition (repairs and upgrades for one vehicle)
Multipart: seller_type, vin, mileage, zip, photos[], obd_codes[] optional

Response:
```json
{
  "vehicle": { "vin": "1HGCV1F34LA000002", "year": 2020, "make": "Honda", "model": "Accord", "trim": "Sport", "mileage": 64000 },
  "items": [
    {
      "id": "pdr", "name": "Paintless dent repair (hood, roof, trunk lid)", "kind": "repair",
      "description": "PDR technician removes hail dents without repainting.",
      "cost": 2400, "value_lift": 3900, "net_gain": 1500, "days_added": 5,
      "recommended": true, "reason": "Removes the hail disclosure entirely, so buyers bid it as a clean car."
    }
  ],
  "scenarios": [
    {
      "channel": "acv_wholesale",
      "as_is": { "p10": 15400, "p50": 16500, "p90": 17300 },
      "reconditioned": {
        "net": { "p10": 17000, "p50": 18150, "p90": 19000 },
        "breakdown": { "expected_price": 22150, "fees": 450, "transport": 250, "recon": 2700, "holding": 450, "risk": 150 },
        "days_to_sell": 11
      },
      "net_change": 1650,
      "explanation": "With the hail removed, this sells as a clean-title, clean-body Accord."
    }
  ],
  "recommended_channel": "acv_wholesale",
  "verdict": "recondition",
  "package_cost": 2700
}
```
- `items` lists every candidate repair (`kind: "repair"`) or upgrade (`kind: "upgrade"`), recommended or not.
  Item figures (`value_lift`, `net_gain`) are for `recommended_channel`.
- `scenarios` covers eligible channels only, assuming the recommended items are done, sorted by
  `reconditioned.net.p50` descending. `net_change` = reconditioned p50 − as-is p50.
- `verdict` is `"sell_as_is"` (and no item is recommended, `package_cost` 0) when reconditioning doesn't pay
  off in any eligible channel.

## UI requirements
- Screen 1: seller type picker (Individual / Business / Dealer).
- Screen 2: left panel intake form (one or more vehicles: VIN, mileage, ZIP, photo drag-and-drop with thumbnails,
  optional OBD codes); right panel results.
  - Single vehicle: hero card (recommended route, median net, "+$X vs next best"), range chart, selectable
    route cards with an expandable cost breakdown, damage summary card.
  - Multiple vehicles: fleet totals, selectable per-channel groups, per-vehicle table with drill-down.
  - A "Start Selling" button acts on the selected option and redirects to the ACV or Copart website.
  - Below the sale options, a visually distinct "Analyze Reconditioning Options" card links to `/recondition`:
    a page listing repairs/upgrades with cost, value added and net gain, an as-is vs reconditioned comparison
    per channel with cost breakdowns, and its own Start Selling bar.
- Loading state that feels intentional (stepwise: "Decoding VIN… Reading damage… Pricing routes…").
- Responsive; must look good projected on a screen for judges. Clean, professional, automotive feel.
- Brand: "ReDrive". Never show ACV or Copart names or logos in the UI.

## Demo vehicles (one mock response each)
1. Clean 2023 Toyota RAV4, 28k miles → `acv_wholesale`
2. Hail-damaged 2020 Honda Accord, 64k miles → `acv_wholesale` with disclosure beats salvage
3. Flooded 2022 Ford F-150, 161k miles → `copart_salvage`
The "Load demo vehicle" dropdown fills the form and returns the matching mock, plus a fleet option that loads all three.

## Conventions
- TypeScript strict mode; shared types in `/frontend/lib/types.ts` mirroring the contract above.
- Format money with Intl.NumberFormat (USD, no cents).
- Keep components small; one component per file in `/frontend/components/`.
- Do not put pricing math in the frontend. It only displays what the API returns.
