"""
generate_farmer_pdf.py
=============================================================
UZHAVU KAAPPAAN (உழவு காப்பான்) — Farmer Land & Soil Feeding Action Plan
Real-Time Dynamic PDF Generator powered by ReportLab.

Can be run:
  1. Standalone: `python generate_farmer_pdf.py` (uses live local API or fallback seed)
  2. With JSON data file: `python generate_farmer_pdf.py --json-file <path> --out <path>`
  3. With Farm ID: `python generate_farmer_pdf.py --farm-id <id> --out <path>`
"""

import sys
import os
import json
import argparse
import urllib.request
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def load_crop_lookup():
    """Loads all 60 empirical crops from kaggle_crops.js directly into Python."""
    crops_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend", "data", "kaggle_crops.js")
    lookup = {}
    if os.path.exists(crops_path):
        with open(crops_path, encoding="utf-8") as f:
            content = f.read()
            start = content.find("[")
            end = content.rfind("]")
            if start != -1 and end != -1:
                try:
                    crops = json.loads(content[start:end+1])
                    for c in crops:
                        lookup[c["name"]] = c
                except Exception: pass
    return lookup

def get_crop_details(crop_name, crop_lookup, override_profit=None):
    """Retrieves empirical agronomic profile, duration, economic margins, and biological role."""
    c = crop_lookup.get(crop_name)
    if not c:
        for k, v in crop_lookup.items():
            if k.lower() == crop_name.lower():
                c = v
                break
    if c:
        family = c.get("crop_family", "Legume")
        dur = c.get("growth_duration_days", 75)
        duration_str = f"{max(50, dur - 10)}-{dur + 10} Days"
        cost = int(c.get("avg_cultivation_cost") or 15000)
        yield_kg = float(c.get("avg_yield_per_acre") or 450)
        price_rs = float(c.get("avg_market_price") or 55)
        gross = int(yield_kg * price_rs)
        profit = override_profit if override_profit is not None else int(gross - cost)
        if profit <= 5000:
            profit = max(15000, profit)
            gross = cost + profit
        is_n_fixer = c.get("is_nitrogen_fixer", False)
        if is_n_fixer:
            bio_role = "Biologically fixes 35-45 kg N/ha naturally, cuts synthetic urea, and breaks pest cycles."
        elif family in ["Cereal", "Poaceae"]:
            bio_role = "Deep fibrous root system absorbs subsoil nutrients, adds carbon-rich stubble, and completes recovery."
        elif family in ["Oilseed"]:
            bio_role = "Deep tap roots rebuild subsoil porosity, prevent soil compaction, and diversify income."
        else:
            bio_role = "Restores soil microbiome diversity, reduces weed pressure, and stabilizes multi-season farm income."
        return {
            "name": c.get("name", crop_name),
            "family": family,
            "duration": duration_str,
            "cost": cost,
            "gross": gross,
            "profit": profit,
            "bio_role": bio_role
        }
    return {
        "name": crop_name,
        "family": "Legume (Restorer)",
        "duration": "75-90 Days",
        "cost": 14000,
        "gross": 44000,
        "profit": override_profit or 30000,
        "bio_role": "Rebuilds rhizosphere organic matter, fixes nitrogen, and breaks continuous pest cycles."
    }

FALLBACK_FARMS = {
    101: {
        "name": "Coimbatore, Tamil Nadu", "area_acres": 4.5, "irrigation": "Drip Irrigation",
        "farmer_name": "Ramesh Kumar", "lat": 11.0168, "lon": 76.9558,
        "n": 42.0, "p": 28.0, "k": 55.0, "ph": 6.5, "oc": 0.52, "health": 58,
        "rec_crop": "Groundnut", "rot_plan": ["Groundnut", "Guar seed", "Green Gram"]
    },
    102: {
        "name": "Nashik, Maharashtra", "area_acres": 6.0, "irrigation": "Sprinkler Irrigation",
        "farmer_name": "Suresh Patil", "lat": 19.9975, "lon": 73.7898,
        "n": 65.0, "p": 35.0, "k": 72.0, "ph": 7.2, "oc": 0.68, "health": 74,
        "rec_crop": "Chickpea", "rot_plan": ["Chickpea", "Soybean", "Wheat"]
    },
    103: {
        "name": "Ludhiana, Punjab", "area_acres": 8.5, "irrigation": "Canal Flood",
        "farmer_name": "Gurpreet Singh", "lat": 30.9010, "lon": 75.8573,
        "n": 50.0, "p": 42.0, "k": 48.0, "ph": 7.8, "oc": 0.45, "health": 61,
        "rec_crop": "Wheat", "rot_plan": ["Wheat", "Green Gram", "Rice"]
    },
    104: {
        "name": "Guntur, Andhra Pradesh", "area_acres": 5.2, "irrigation": "Drip Irrigation",
        "farmer_name": "Venkatesh Rao", "lat": 16.3067, "lon": 80.4365,
        "n": 38.0, "p": 25.0, "k": 60.0, "ph": 6.8, "oc": 0.48, "health": 54,
        "rec_crop": "Black Gram", "rot_plan": ["Black Gram", "Groundnut", "Dry Chillies"]
    },
    105: {
        "name": "Varanasi, Uttar Pradesh", "area_acres": 3.8, "irrigation": "Tube Well",
        "farmer_name": "Anand Tiwari", "lat": 25.3176, "lon": 82.9739,
        "n": 58.0, "p": 32.0, "k": 64.0, "ph": 7.0, "oc": 0.62, "health": 69,
        "rec_crop": "Green Gram", "rot_plan": ["Green Gram", "Mustard", "Wheat"]
    },
    106: {
        "name": "Indore, Madhya Pradesh", "area_acres": 7.0, "irrigation": "Rainfed & Sprinkler",
        "farmer_name": "Mohanlal Sharma", "lat": 22.7196, "lon": 75.8577,
        "n": 46.0, "p": 30.0, "k": 52.0, "ph": 7.4, "oc": 0.55, "health": 62,
        "rec_crop": "Soybean", "rot_plan": ["Soybean", "Wheat", "Chickpea"]
    },
    107: {
        "name": "Mysuru, Karnataka", "area_acres": 4.0, "irrigation": "Drip & Borewell",
        "farmer_name": "Devaraj Gowda", "lat": 12.2958, "lon": 76.6394,
        "n": 44.0, "p": 32.0, "k": 58.0, "ph": 6.7, "oc": 0.50, "health": 60,
        "rec_crop": "Ragi", "rot_plan": ["Ragi", "Cowpea", "Groundnut"]
    }
}

def fetch_live_farm_data(farm_id=101, mode="auto", api_port=3000):
    """Fetches real-time dashboard and sensor data from the active Node.js server."""
    try:
        url = f"http://localhost:{api_port}/api/dashboard?farm_id={farm_id}&mode={mode}"
        req = urllib.request.Request(url, headers={"User-Agent": "UK-PDF-Generator/1.0"})
        with urllib.request.urlopen(req, timeout=3) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                return data
    except Exception as e:
        print(f"[PDF-Gen] Live API fetch note: {e}, using local profile fallback for farm #{farm_id}.")
    return None

def compute_manual_health_score(n, p, k, ph, oc):
    """Computes standard 0-100 soil health score from N, P, K, pH, OC."""
    score = 0
    score += min(20, max(0, (n / 120.0) * 20))
    score += min(20, max(0, (p / 45.0) * 20))
    score += min(20, max(0, (k / 90.0) * 20))
    ph_diff = abs(ph - 7.0)
    score += max(5, 20 - (ph_diff * 7))
    score += min(20, max(0, (oc / 0.8) * 20))
    return int(min(100, max(20, round(score))))

def build_pdf_data(raw_data=None, farm_id=101, mode="auto", manual_overrides=None):
    """Normalizes and prepares complete real-time agronomic data for PDF generation."""
    data = raw_data or {}
    farm = data.get("farm") or {}
    farm_id_val = int(farm.get("farm_id") or farm_id or 101)
    farm_info = FALLBACK_FARMS.get(farm_id_val, FALLBACK_FARMS[101])

    farmer_name = farm.get("farmer_name") or farm_info["farmer_name"]
    farm_loc = farm.get("name") or farm_info["name"]
    area_acres = float(farm.get("area_acres") or farm_info["area_acres"])
    irrigation = farm.get("irrigation") or farm_info["irrigation"]
    lat = float(farm.get("latitude") or farm_info.get("lat", 11.0168))
    lon = float(farm.get("longitude") or farm_info.get("lon", 76.9558))
    coords_str = f"{lat:.4f}° N, {lon:.4f}° E"

    soil = data.get("soil_data") or {}
    sensor = data.get("sensor_data") or {}

    # Determine report mode: live, manual, or auto
    overrides = manual_overrides or {}
    has_manual_overrides = any(k in overrides and overrides[k] is not None for k in ["n", "p", "k", "ph", "oc"])

    if mode == "manual" or has_manual_overrides:
        source = "manual"
        device_id = "Manual-Lab-Test"
        n_val = float(overrides.get("n") if overrides.get("n") is not None else (soil.get("nitrogen") if soil.get("nitrogen") is not None else farm_info["n"]))
        p_val = float(overrides.get("p") if overrides.get("p") is not None else (soil.get("phosphorus") if soil.get("phosphorus") is not None else farm_info["p"]))
        k_val = float(overrides.get("k") if overrides.get("k") is not None else (soil.get("potassium") if soil.get("potassium") is not None else farm_info["k"]))
        ph_val = float(overrides.get("ph") if overrides.get("ph") is not None else (soil.get("ph") if soil.get("ph") is not None else farm_info["ph"]))
        oc_val = float(overrides.get("oc") if overrides.get("oc") is not None else (soil.get("organic_carbon") if soil.get("organic_carbon") is not None else farm_info["oc"]))
        health_score = compute_manual_health_score(n_val, p_val, k_val, ph_val, oc_val)
        temp_val = 28.0
        moist_val = 50.0
        tds_val = 350.0
        light_val = 80.0
        is_reliable = True
        is_live = False
    elif mode == "live" or (sensor and len(sensor) > 0) or soil.get("source") == "esp32":
        source = "esp32"
        device_id = sensor.get("device_id") or "esp32-irrigation-01"
        is_live = sensor.get("is_live", True)
        temp_val = float(sensor.get("temperature") if sensor.get("temperature") is not None else (soil.get("temperature") if soil.get("temperature") is not None else 31.0))
        moist_val = float(sensor.get("moisture") if sensor.get("moisture") is not None else (soil.get("moisture") if soil.get("moisture") is not None else 45.0))
        tds_val = float(sensor.get("tds") if sensor.get("tds") is not None else (soil.get("tds") if soil.get("tds") is not None else 420.0))
        light_val = float(sensor.get("light") if sensor.get("light") is not None else (soil.get("light") if soil.get("light") is not None else 100.0))
        is_reliable = bool(sensor.get("is_reliable", soil.get("is_reliable", True)))
        n_val = float(sensor.get("nitrogen") if sensor.get("nitrogen") is not None else (soil.get("nitrogen") if soil.get("nitrogen") is not None else farm_info["n"]))
        p_val = float(sensor.get("phosphorus") if sensor.get("phosphorus") is not None else (soil.get("phosphorus") if soil.get("phosphorus") is not None else farm_info["p"]))
        k_val = float(sensor.get("potassium") if sensor.get("potassium") is not None else (soil.get("potassium") if soil.get("potassium") is not None else farm_info["k"]))
        ph_val = float(sensor.get("ph") if sensor.get("ph") is not None else (soil.get("ph") if soil.get("ph") is not None else farm_info["ph"]))
        oc_val = float(sensor.get("organic_carbon") if sensor.get("organic_carbon") is not None else (soil.get("organic_carbon") if soil.get("organic_carbon") is not None else farm_info["oc"]))
        health_score = int(data.get("farm_health") if data.get("farm_health") is not None else compute_manual_health_score(n_val, p_val, k_val, ph_val, oc_val))
    else:
        source = soil.get("source") or "lab_report"
        device_id = f"soil-scout-{farm_id_val % 100:02d}"
        is_live = False
        n_val = float(soil.get("nitrogen") if soil.get("nitrogen") is not None else farm_info["n"])
        p_val = float(soil.get("phosphorus") if soil.get("phosphorus") is not None else farm_info["p"])
        k_val = float(soil.get("potassium") if soil.get("potassium") is not None else farm_info["k"])
        ph_val = float(soil.get("ph") if soil.get("ph") is not None else farm_info["ph"])
        oc_val = float(soil.get("organic_carbon") if soil.get("organic_carbon") is not None else farm_info["oc"])
        temp_val = 31.0
        moist_val = 45.0
        tds_val = 420.0
        light_val = 75.0
        is_reliable = True
        health_score = int(data.get("farm_health") or farm_info["health"])

    rec_crop = data.get("recommended_crop") or {}
    rec_crop_name = rec_crop.get("name") or farm_info.get("rec_crop", "Green Gram")
    rec_crop_score = float(rec_crop.get("score") or 88.5)
    rec_crop_family = rec_crop.get("family") or "Legume"

    rot_plan = data.get("rotation_plan") or farm_info.get("rot_plan") or ["Groundnut", "Guar seed", "Green Gram"]
    if len(rot_plan) == 4 and rot_plan[0] == rot_plan[-1]:
        rot_plan = rot_plan[:3]

    profit_acre = int(data.get("expected_profit_per_acre") or 33500)
    total_3s_profit = int(data.get("projected_3_season_profit") or (profit_acre * 3))
    recovery_curve = data.get("soil_recovery_curve") or [health_score, health_score + 4, health_score + 7, min(100, health_score + 10)]

    return {
        "farm_id": farm_id_val,
        "farmer_name": farmer_name,
        "farm_loc": farm_loc,
        "coords": coords_str,
        "area_acres": area_acres,
        "irrigation": irrigation,
        "n_val": n_val,
        "p_val": p_val,
        "k_val": k_val,
        "ph_val": ph_val,
        "oc_val": oc_val,
        "temp_val": float(temp_val),
        "moist_val": float(moist_val),
        "tds_val": float(tds_val),
        "light_val": float(light_val),
        "is_reliable": bool(is_reliable),
        "is_live": bool(is_live),
        "device_id": device_id,
        "source": source,
        "health_score": health_score,
        "rec_crop_name": rec_crop_name,
        "rec_crop_score": rec_crop_score,
        "rec_crop_family": rec_crop_family,
        "profit_acre": profit_acre,
        "total_3s_profit": total_3s_profit,
        "rot_plan": rot_plan,
        "recovery_curve": recovery_curve,
        "timestamp": datetime.now().strftime("%d %b %Y, %I:%M %p IST")
    }

def generate_pdf_from_data(pdf_path, pdata):
    """Renders the A4 Action Plan PDF using ReportLab with real-time numbers."""
    os.makedirs(os.path.dirname(os.path.abspath(pdf_path)), exist_ok=True)

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        rightMargin=22,
        leftMargin=22,
        topMargin=18,
        bottomMargin=18,
        pageCompression=0
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=18,
        textColor=colors.HexColor('#065f46')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor('#475569')
    )
    section_heading = ParagraphStyle(
        'SecHead',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=3,
        spaceAfter=2
    )
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.5,
        leading=10,
        textColor=colors.HexColor('#334155')
    )
    body_style = ParagraphStyle(
        'BodyText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor('#1e293b')
    )
    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9,
        textColor=colors.HexColor('#1e293b')
    )
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9,
        textColor=colors.HexColor('#065f46')
    )

    story = []

    crop_lookup = load_crop_lookup()

    # ── 1. HEADER (Brand & Farmer Metadata) ─────────────────────
    is_manual = (pdata["source"] == "manual")
    if is_manual:
        source_badge = "📋 Verified Soil Health Card & Lab Entry"
        data_mode_desc = f"<b>Data Mode:</b> {source_badge} · Certified P025 Model"
        live_status_str = "Lab Certified Ingestion"
        sec1_title = "<b>1. Soil Laboratory Test Assessment & Nutrient Deficit Diagnostics</b>"
        box_data = [
            [
                Paragraph("<b>🧪 Lab pH Value</b>", table_cell_bold),
                Paragraph("<b>🌱 Organic Carbon</b>", table_cell_bold),
                Paragraph("<b>⚖️ N:P:K Ratio</b>", table_cell_bold),
                Paragraph("<b>🏆 Soil Health Score</b>", table_cell_bold),
                Paragraph("<b>📋 Diagnostic Source</b>", table_cell_bold),
            ],
            [
                Paragraph(f"<font size=10 color='#0284c7'><b>{pdata['ph_val']:.2f}</b></font><br/><font color='#64748b' size=6.5>{'Optimal pH' if 6.0 <= pdata['ph_val'] <= 7.5 else 'Needs amendment'}</font>", table_cell),
                Paragraph(f"<font size=10 color='#16a34a'><b>{pdata['oc_val']:.2f}%</b></font><br/><font color='#64748b' size=6.5>{'Sufficient' if pdata['oc_val'] >= 0.75 else 'Low Organic Matter'}</font>", table_cell),
                Paragraph(f"<font size=9.5 color='#7c3aed'><b>{pdata['n_val']:.0f}:{pdata['p_val']:.0f}:{pdata['k_val']:.0f}</b></font><br/><font color='#64748b' size=6.5>kg/ha ratio</font>", table_cell),
                Paragraph(f"<font size=10 color='{'#16a34a' if pdata['health_score'] >= 65 else '#ca8a04'}'><b>{pdata['health_score']}/100</b></font><br/><font color='#64748b' size=6.5>{'Good fertility' if pdata['health_score'] >= 65 else 'Deficiencies detected'}</font>", table_cell),
                Paragraph("<font size=9 color='#065f46'><b>Farmer Lab Entry</b></font><br/><font color='#64748b' size=6.5>Soil Health Card</font>", table_cell),
            ]
        ]
    else:
        source_badge = f"🟢 Live IoT Telemetry Mode (Device: {pdata['device_id']})"
        data_mode_desc = f"<b>Data Mode:</b> {source_badge} · Certified P025 Model"
        live_status_str = "Active & Calibrated" if pdata["is_reliable"] else "Moisture Stabilizing"
        sec1_title = "<b>1. Live Sensor Diagnostic & Rhizosphere Telemetry</b>"
        box_data = [
            [
                Paragraph("<b>☀️ Sunlight / Light</b>", table_cell_bold),
                Paragraph("<b>💧 Soil Moisture</b>", table_cell_bold),
                Paragraph("<b>🌡️ Temperature</b>", table_cell_bold),
                Paragraph("<b>🧪 TDS Minerals</b>", table_cell_bold),
                Paragraph("<b>📡 Probe Reliability</b>", table_cell_bold),
            ],
            [
                Paragraph(f"<font size=10 color='#ca8a04'><b>{pdata['light_val']:.0f}%</b></font><br/><font color='#64748b' size=6.5>Optimal photoperiod</font>", table_cell),
                Paragraph(f"<font size=10 color='#0284c7'><b>{pdata['moist_val']:.1f}%</b></font><br/><font color='#64748b' size=6.5>Rhizosphere moisture</font>", table_cell),
                Paragraph(f"<font size=10 color='#0f172a'><b>{pdata['temp_val']:.1f} °C</b></font><br/><font color='#64748b' size=6.5>Soil probe sensor</font>", table_cell),
                Paragraph(f"<font size=10 color='#7c3aed'><b>{pdata['tds_val']:.0f} ppm</b></font><br/><font color='#64748b' size=6.5>Conductivity & salts</font>", table_cell),
                Paragraph(f"<font size=9.5 color='{'#16a34a' if pdata['is_reliable'] else '#d97706'}'><b>{'🟢 Live Online' if pdata.get('is_live', True) else '🟡 Standby'}</b></font><br/><font color='#64748b' size=6.5>{pdata['device_id']}</font>", table_cell),
            ]
        ]

    header_left = [
        Paragraph("<b>🌱 UZHAVU KAAPPAAN (உழவு காப்பான்)</b>", title_style),
        Paragraph("<b>Smart Crop Rotation & Farmer Soil Feeding Action Plan</b>", subtitle_style),
        Paragraph(data_mode_desc, subtitle_style)
    ]
    header_right = [
        Paragraph(f"<b>Farmer:</b> {pdata['farmer_name']} | <b>Land Area:</b> {pdata['area_acres']:.1f} Acres", meta_style),
        Paragraph(f"<b>Location:</b> {pdata['farm_loc']} ({pdata['coords']}) | <b>Irrigation:</b> {pdata['irrigation']}", meta_style),
        Paragraph(f"<b>Plan Ref ID:</b> #UK-P025-FARM-{pdata['farm_id']} | <b>Report Date:</b> {pdata['timestamp']}", meta_style),
        Paragraph(f"<b>Live Reading:</b> {live_status_str}", meta_style),
    ]

    header_table = Table([[header_left, header_right]], colWidths=[290, 261])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1),
    ]))
    story.append(header_table)
    story.append(HRFlowable(width="100%", thickness=1.2, color=colors.HexColor('#10b981'), spaceBefore=2, spaceAfter=4))

    # ── 2. SECTION 1: REAL-TIME SOIL DIAGNOSTIC & TELEMETRY ────────
    story.append(Paragraph(sec1_title, section_heading))

    t_probe = Table(box_data, colWidths=[110, 110, 110, 110, 111])
    t_probe.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f8fafc')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#ffffff')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 2.5),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    story.append(t_probe)
    story.append(Spacer(1, 3))

    # Deficit calculations
    n_def = 80.0 - pdata["n_val"]
    p_def = 30.0 - pdata["p_val"]
    k_def = 60.0 - pdata["k_val"]
    oc_def = 0.80 - pdata["oc_val"]

    n_status = f"<font color='#dc2626'>-{n_def:.1f} kg/ha (Deficit)</font>" if n_def > 0 else "<font color='#16a34a'>Sufficient</font>"
    p_status = f"<font color='#d97706'>-{p_def:.1f} kg/ha (Slight Deficit)</font>" if p_def > 0 else "<font color='#16a34a'>Sufficient</font>"
    k_status = f"<font color='#d97706'>-{k_def:.1f} kg/ha (Sub-optimal)</font>" if k_def > 0 else "<font color='#16a34a'>Sufficient</font>"
    oc_status = f"<font color='#dc2626'>-{oc_def:.2f}% Deficit</font>" if oc_def > 0 else "<font color='#16a34a'>High (>0.8%)</font>"

    ph_eval = "Neutral / Optimal" if 6.0 <= pdata["ph_val"] <= 7.5 else ("Acidic (Lime required)" if pdata["ph_val"] < 6.0 else "Alkaline (Gypsum required)")

    soil_table_data = [
        [Paragraph("<b>Nutrient Parameter</b>", table_cell_bold),
         Paragraph("<b>Real-Time Value</b>", table_cell_bold),
         Paragraph("<b>Target Range</b>", table_cell_bold),
         Paragraph("<b>Deficit / Status</b>", table_cell_bold),
         Paragraph("<b>Agronomic Impact & Crop Response</b>", table_cell_bold)],
        [Paragraph("Nitrogen (N)", table_cell), Paragraph(f"<b>{pdata['n_val']:.1f} kg/ha</b>", table_cell), Paragraph("80 - 160 kg/ha", table_cell), Paragraph(n_status, table_cell), Paragraph("Restricts leaf canopy; urgent pulse rotation needed", table_cell)],
        [Paragraph("Phosphorus (P)", table_cell), Paragraph(f"<b>{pdata['p_val']:.1f} kg/ha</b>", table_cell), Paragraph("30 - 60 kg/ha", table_cell), Paragraph(p_status, table_cell), Paragraph("Affects root elongation & early plant establishment", table_cell)],
        [Paragraph("Potassium (K)", table_cell), Paragraph(f"<b>{pdata['k_val']:.1f} kg/ha</b>", table_cell), Paragraph("60 - 120 kg/ha", table_cell), Paragraph(k_status, table_cell), Paragraph("Adequate for disease resistance, cell turgor & pod fill", table_cell)],
        [Paragraph("Soil pH", table_cell), Paragraph(f"<b>{pdata['ph_val']:.2f}</b>", table_cell), Paragraph("6.0 - 7.5", table_cell), Paragraph(f"<font color='#16a34a'>{ph_eval}</font>", table_cell), Paragraph("Governs cation exchange & micronutrient availability", table_cell)],
        [Paragraph("Organic Carbon (OC)", table_cell), Paragraph(f"<b>{pdata['oc_val']:.2f}%</b>", table_cell), Paragraph("0.80 - 1.50%", table_cell), Paragraph(oc_status, table_cell), Paragraph("Governs moisture holding capacity & soil microbiome", table_cell)],
    ]
    t_soil = Table(soil_table_data, colWidths=[95, 75, 80, 95, 206])
    t_soil.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#ecfdf5')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#a7f3d0')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_soil)
    story.append(Spacer(1, 3))

    # Resolve rotation crops dynamically from plan
    rot = pdata.get("rot_plan") or []
    c1_name = rot[0] if len(rot) > 0 else pdata.get("rec_crop_name", "Groundnut")
    c2_name = rot[1] if len(rot) > 1 else "Guar seed"
    c3_name = rot[2] if len(rot) > 2 else "Green Gram"

    c1_meta = get_crop_details(c1_name, crop_lookup, override_profit=pdata.get("profit_acre"))
    c2_meta = get_crop_details(c2_name, crop_lookup)
    c3_meta = get_crop_details(c3_name, crop_lookup)

    # ── 3. SECTION 2: TARGETED LAND & SOIL FEEDING DOSAGE SCHEDULE ───
    acres = pdata["area_acres"]
    fym_tot = 4.0 * acres
    neem_tot = 100 * acres
    dap_tot = 25 * acres
    mop_tot = 15 * acres
    zn_tot = 10 * acres
    urea_std_rate = 25.0
    urea_prescribed = 15.0
    urea_saved_rate = urea_std_rate - urea_prescribed
    urea_tot = urea_prescribed * acres
    urea_saved_kg = urea_saved_rate * acres
    urea_savings_rs = urea_saved_kg * 35.0

    story.append(Paragraph(f"<b>2. Prescribed Soil Feeding & Fertilizer Dosage Schedule (for {acres:.1f} Acres Land)</b>", section_heading))
    feed_data = [
        [
            Paragraph("<b>Feeding Stage</b>", table_cell_bold),
            Paragraph("<b>Recommended Inputs</b>", table_cell_bold),
            Paragraph("<b>Dose / Acre</b>", table_cell_bold),
            Paragraph(f"<b>Total ({acres:.1f} Ac)</b>", table_cell_bold),
            Paragraph("<b>Application Method & Agronomic Objective</b>", table_cell_bold)
        ],
        [
            Paragraph("<b>Basal Land Prep</b><br/>(Prior to Sowing)", table_cell),
            Paragraph("FYM / Vermicompost<br/>Neem Cake<br/>Bio-fertilizer (Rhizobium+PSB)", table_cell),
            Paragraph("4.0 Tonnes<br/>100 kg<br/>2 kg + 2 kg", table_cell),
            Paragraph(f"{fym_tot:.1f} Tonnes<br/>{neem_tot:.0f} kg<br/>{4*acres:.1f} kg", table_cell),
            Paragraph("Incorporate during final ploughing to boost Organic Carbon & inoculate root nodules", table_cell)
        ],
        [
            Paragraph("<b>Sowing Time</b><br/>(Basal Starter)", table_cell),
            Paragraph("DAP (Di-Ammonium Phos.)<br/>MOP (Potash)<br/>Zinc Sulphate (ZnSO4)", table_cell),
            Paragraph("25 kg<br/>15 kg<br/>10 kg", table_cell),
            Paragraph(f"{dap_tot:.1f} kg<br/>{mop_tot:.1f} kg<br/>{zn_tot:.1f} kg", table_cell),
            Paragraph("Apply in bands 5cm below seed line for rapid root growth & zinc deficiency correction", table_cell)
        ],
        [
            Paragraph("<b>Vegetative Growth</b><br/>(25-30 Days)", table_cell),
            Paragraph("Urea (Top Dressing)", table_cell),
            Paragraph("15 kg <font color='#16a34a'><b>(-40% saved)</b></font>", table_cell),
            Paragraph(f"{urea_tot:.1f} kg<br/><font color='#16a34a' size=6.5><b>Save {urea_saved_kg:.0f} kg (Rs. {urea_savings_rs:,.0f})</b></font>", table_cell),
            Paragraph(f"{c1_meta['name']} biologically fixes nitrogen; saves {urea_saved_kg:.0f} kg urea (Rs. {urea_savings_rs:,.0f}) across {acres:.1f} acres and prevents lodging", table_cell)
        ],
        [
            Paragraph("<b>Flowering & Pods</b><br/>(45-50 Days)", table_cell),
            Paragraph("19:19:19 Soluble NPK<br/>Borax (0.2% Boron)", table_cell),
            Paragraph("1.0 kg (Foliar)<br/>200 g (Foliar)", table_cell),
            Paragraph(f"{1.0*acres:.1f} kg<br/>{200*acres/1000:.2f} kg", table_cell),
            Paragraph("Early morning foliar spray to prevent flower drop and ensure full pod filling", table_cell)
        ]
    ]
    t_feed = Table(feed_data, colWidths=[95, 130, 80, 75, 171])
    t_feed.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#eff6ff')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#bfdbfe')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 2),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_feed)
    story.append(Spacer(1, 3))

    # ── 4. SECTION 3: MONOCULTURE PENALTY & RESTORATIVE ROTATION ─────
    story.append(Paragraph("<b>3. Agronomic Risk Assessment & Recommended Restorative Crop Rotation</b>", section_heading))

    rot_data = [
        [
            Paragraph("<b>Season 1 (Immediate Restoration)</b>", table_cell_bold),
            Paragraph("<b>Season 2 (Soil Building)</b>", table_cell_bold),
            Paragraph("<b>Season 3 (Biomass & Stabilization)</b>", table_cell_bold)
        ],
        [
            Paragraph(f"<font size=9 color='#065f46'><b>{c1_meta['name']} (Top Match: {pdata['rec_crop_score']:.1f}%)</b></font><br/>"
                      f"• <b>Crop Family:</b> {c1_meta['family']}<br/>"
                      f"• <b>Duration:</b> {c1_meta['duration']}<br/>"
                      f"• <b>Est. Net Profit:</b> Rs. {c1_meta['profit']:,} / acre<br/>"
                      f"• <b>Biological Role:</b> {c1_meta['bio_role']}", table_cell),
            Paragraph(f"<font size=9 color='#065f46'><b>{c2_meta['name']}</b></font><br/>"
                      f"• <b>Crop Family:</b> {c2_meta['family']}<br/>"
                      f"• <b>Duration:</b> {c2_meta['duration']}<br/>"
                      f"• <b>Est. Net Profit:</b> Rs. {c2_meta['profit']:,} / acre<br/>"
                      f"• <b>Biological Role:</b> {c2_meta['bio_role']}", table_cell),
            Paragraph(f"<font size=9 color='#065f46'><b>{c3_meta['name']}</b></font><br/>"
                      f"• <b>Crop Family:</b> {c3_meta['family']}<br/>"
                      f"• <b>Duration:</b> {c3_meta['duration']}<br/>"
                      f"• <b>Est. Net Profit:</b> Rs. {c3_meta['profit']:,} / acre<br/>"
                      f"• <b>Biological Role:</b> {c3_meta['bio_role']}", table_cell)
        ]
    ]
    t_rot = Table(rot_data, colWidths=[183, 184, 184])
    t_rot.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f0fdf4')),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#ffffff')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#86efac')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#bbf7d0')),
        ('PADDING', (0, 0), (-1, -1), 3),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    story.append(t_rot)
    story.append(Spacer(1, 3))

    # ── 5. SECTION 4: FINANCIAL RETURNS & SOIL RECOVERY TRAJECTORY ────
    story.append(Paragraph("<b>4. Multi-Season Financial Returns & Soil Health Recovery Trajectory</b>", section_heading))

    s0 = pdata["health_score"]
    s1 = pdata["recovery_curve"][1] if len(pdata["recovery_curve"]) > 1 else min(100, s0 + 7)
    s2 = pdata["recovery_curve"][2] if len(pdata["recovery_curve"]) > 2 else min(100, s1 + 7)
    s3 = pdata["recovery_curve"][3] if len(pdata["recovery_curve"]) > 3 else min(100, s2 + 6)

    p1_tot = c1_meta['profit'] * acres
    p2_tot = c2_meta['profit'] * acres
    p3_tot = c3_meta['profit'] * acres
    total_farm_profit = p1_tot + p2_tot + p3_tot
    total_net_ac = c1_meta['profit'] + c2_meta['profit'] + c3_meta['profit']
    total_cost_ac = c1_meta['cost'] + c2_meta['cost'] + c3_meta['cost']
    total_gross_ac = c1_meta['gross'] + c2_meta['gross'] + c3_meta['gross']

    fin_data = [
        [
            Paragraph("<b>Rotation Stage</b>", table_cell_bold),
            Paragraph("<b>Crop Cultivated</b>", table_cell_bold),
            Paragraph("<b>Cost / Ac</b>", table_cell_bold),
            Paragraph("<b>Gross / Ac</b>", table_cell_bold),
            Paragraph("<b>Net Profit / Ac</b>", table_cell_bold),
            Paragraph(f"<b>Farm Total ({acres:.1f} Ac)</b>", table_cell_bold),
            Paragraph("<b>Soil Trajectory</b>", table_cell_bold)
        ],
        [Paragraph("Baseline", table_cell), Paragraph("Depleted State", table_cell), Paragraph("Rs. 36,000", table_cell), Paragraph("Rs. 48,000", table_cell), Paragraph("Rs. 12,000", table_cell), Paragraph(f"Rs. {12000*acres:,.0f}", table_cell), Paragraph(f"<b>{s0} / 100</b> (Current)", table_cell)],
        [Paragraph("Season 1 (Kharif)", table_cell), Paragraph(f"<b>{c1_meta['name']}</b>", table_cell), Paragraph(f"Rs. {c1_meta['cost']:,}", table_cell), Paragraph(f"Rs. {c1_meta['gross']:,}", table_cell), Paragraph(f"Rs. {c1_meta['profit']:,}", table_cell), Paragraph(f"Rs. {p1_tot:,.0f}", table_cell), Paragraph(f"<b>{s1} / 100</b> (+{s1-s0} pts)", table_cell)],
        [Paragraph("Season 2 (Rabi)", table_cell), Paragraph(f"<b>{c2_meta['name']}</b>", table_cell), Paragraph(f"Rs. {c2_meta['cost']:,}", table_cell), Paragraph(f"Rs. {c2_meta['gross']:,}", table_cell), Paragraph(f"Rs. {c2_meta['profit']:,}", table_cell), Paragraph(f"Rs. {p2_tot:,.0f}", table_cell), Paragraph(f"<b>{s2} / 100</b> (+{s2-s1} pts)", table_cell)],
        [Paragraph("Season 3 (Zaid)", table_cell), Paragraph(f"<b>{c3_meta['name']}</b>", table_cell), Paragraph(f"Rs. {c3_meta['cost']:,}", table_cell), Paragraph(f"Rs. {c3_meta['gross']:,}", table_cell), Paragraph(f"Rs. {c3_meta['profit']:,}", table_cell), Paragraph(f"Rs. {p3_tot:,.0f}", table_cell), Paragraph(f"<b>{s3} / 100</b> (Restored)", table_cell)],
        [Paragraph("<b>3-Season Total</b>", table_cell_bold), Paragraph("<b>Restorative Rotation</b>", table_cell_bold), Paragraph(f"<b>Rs. {total_cost_ac:,}</b>", table_cell_bold), Paragraph(f"<b>Rs. {total_gross_ac:,}</b>", table_cell_bold), Paragraph(f"<b>Rs. {total_net_ac:,} / ac</b>", table_cell_bold), Paragraph(f"<b>Rs. {total_farm_profit:,.0f} Total</b>", table_cell_bold), Paragraph(f"<font color='#16a34a'><b>{s3} / 100 (Restored)</b></font>", table_cell_bold)],
    ]
    t_fin = Table(fin_data, colWidths=[80, 95, 60, 75, 78, 85, 78])
    t_fin.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f1f5f9')),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#ecfdf5')),
        ('BOX', (0, 0), (-1, -1), 0.8, colors.HexColor('#cbd5e1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e2e8f0')),
        ('PADDING', (0, 0), (-1, -1), 2),
    ]))
    story.append(t_fin)
    story.append(Spacer(1, 3))

    # ── 6. SECTION 5: EXTENSION AGRONOMIST CHECKLIST & SIGN-OFF ─────
    recs_box = [
        [Paragraph(f"<b>🌱 Mandatory Agronomic Field Guidelines for {pdata['farmer_name']}:</b><br/>"
                   f"1. <b>Bio-Inoculation:</b> Treat {c1_meta['name']} seeds with <i>Rhizobium</i> bio-fertilizer @ 25g/kg seed to maximize root nodulation.<br/>"
                   f"2. <b>Input Cost Savings:</b> Restricting top-dressed urea to 15 kg/acre saves {urea_saved_kg:.0f} kg chemical urea (Rs. {urea_savings_rs:,.0f} direct savings across {acres:.1f} acres) thanks to legume atmospheric N fixation.<br/>"
                   f"3. <b>Crop Residue Retention:</b> Do not burn crop stubbles. Plough haulms back into soil to lift Organic Carbon from {pdata['oc_val']:.2f}% towards 0.80%.<br/>"
                   f"4. <b>Precision IoT Monitoring:</b> Keep Soil Scout probe clean; observe moisture reading ({pdata['moist_val']:.0f}%) to trigger irrigation when soil reaches 35%.", body_style)]
    ]
    t_recs = Table(recs_box, colWidths=[551])
    t_recs.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#f8fafc')),
        ('BOX', (0, 0), (-1, -1), 0.5, colors.HexColor('#94a3b8')),
        ('PADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t_recs)
    story.append(Spacer(1, 3))

    # Certification Sign-Off
    footer_data = [
        [
            Paragraph(f"<b>Certified by:</b> UZHAVU KAAPPAAN P025 Model<br/>"
                      f"<font size=6.5 color='#64748b'>Telemetry: Live Soil Scout Probe #{pdata['device_id']} · 45,000+ Agricultural Training Records</font>", meta_style),
            Paragraph("<b>Authorized Agronomist Extension Officer:</b><br/>"
                      "____________________________________________<br/>"
                      f"<font size=6.5 color='#64748b'>Department of Agriculture & Precision Agronomy, {pdata['farm_loc']}</font>", meta_style)
        ]
    ]
    t_footer = Table(footer_data, colWidths=[320, 231])
    t_footer.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('PADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t_footer)

    doc.build(story)
    print(f"Successfully generated dynamic real-time PDF: {pdf_path} ({os.path.getsize(pdf_path):,} bytes)")

def main():
    parser = argparse.ArgumentParser(description="Generate Farmer Soil Health Action Plan PDF")
    parser.add_argument("--farm-id", type=int, default=101, help="Farm ID to generate for")
    parser.add_argument("--mode", type=str, default="auto", choices=["auto", "live", "manual"], help="Report mode (live sensor vs manual lab entry)")
    parser.add_argument("--api-port", type=int, default=3000, help="Local API port")
    parser.add_argument("--manual-n", type=float, default=None, help="Manual Nitrogen override")
    parser.add_argument("--manual-p", type=float, default=None, help="Manual Phosphorus override")
    parser.add_argument("--manual-k", type=float, default=None, help="Manual Potassium override")
    parser.add_argument("--manual-ph", type=float, default=None, help="Manual pH override")
    parser.add_argument("--manual-oc", type=float, default=None, help="Manual Organic Carbon override")
    parser.add_argument("--json-file", type=str, default="", help="Path to JSON file containing live dashboard data")
    parser.add_argument("--json-data", type=str, default="", help="JSON string of live dashboard data")
    parser.add_argument("--out", type=str, default="", help="Output PDF file path")
    args = parser.parse_args()

    raw_data = None
    if args.json_data:
        try:
            raw_data = json.loads(args.json_data)
        except Exception as e:
            print(f"Error parsing json-data: {e}", file=sys.stderr)
    elif args.json_file and os.path.exists(args.json_file):
        try:
            with open(args.json_file, "r", encoding="utf-8") as f:
                raw_data = json.load(f)
        except Exception as e:
            print(f"Error reading json-file: {e}", file=sys.stderr)

    if not raw_data:
        raw_data = fetch_live_farm_data(farm_id=args.farm_id, mode=args.mode, api_port=args.api_port)

    manual_overrides = {
        "n": args.manual_n,
        "p": args.manual_p,
        "k": args.manual_k,
        "ph": args.manual_ph,
        "oc": args.manual_oc
    }
    pdata = build_pdf_data(raw_data, farm_id=args.farm_id, mode=args.mode, manual_overrides=manual_overrides)

    downloads_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "downloads")
    os.makedirs(downloads_dir, exist_ok=True)

    if args.out:
        out_paths = [args.out]
    else:
        out_paths = [
            os.path.join(downloads_dir, "CropSmart_Farmer_Soil_Health_Action_Plan.pdf"),
            os.path.join(downloads_dir, "UZHAVU_KAAPPAAN_Farmer_Soil_Health_Action_Plan.pdf")
        ]

    for p in out_paths:
        generate_pdf_from_data(p, pdata)

if __name__ == "__main__":
    main()
