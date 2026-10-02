import os
import subprocess

def test_farm_pdf(farm_id, expected_farmer, expected_loc, expected_crop, expected_urea_saved, expected_savings_rs):
    out_path = f"downloads/test_farm_{farm_id}.pdf"
    res = subprocess.run(["python", "generate_farmer_pdf.py", "--farm-id", str(farm_id), "--out", out_path], capture_output=True, text=True)
    assert res.returncode == 0, f"PDF generation failed: {res.stderr}"
    assert os.path.exists(out_path) and os.path.getsize(out_path) > 10000, "PDF file missing or empty"

    with open(out_path, "rb") as f:
        content = f.read().decode("latin1", errors="ignore")

    print(f"\n=======================================================")
    print(f"VERIFYING FARM #{farm_id} PDF DYNAMICS")
    print(f"=======================================================")
    print(f"File size: {os.path.getsize(out_path):,} bytes")

    crop_check = any(c in content for c in (expected_crop if isinstance(expected_crop, (list, tuple)) else [expected_crop]))
    checks = [
        ("Farmer Name", expected_farmer, expected_farmer in content),
        ("Location", expected_loc, expected_loc in content),
        ("Crop Sequence Element", str(expected_crop), crop_check),
        ("Urea Saved (kg)", f"{expected_urea_saved} kg", f"{expected_urea_saved} kg" in content),
        ("Direct Savings (Rs)", f"{expected_savings_rs:,}", f"{expected_savings_rs:,}" in content),
    ]

    for name, value, passed in checks:
        status = "PASS" if passed else "FAIL"
        print(f"  [{status}] {name}: '{value}'")
        assert passed, f"Check failed for {name}"

    pages = content.count('/Type /Page\n') or content.count('/Type /Page ') or content.count('/Type/Page')
    print(f"  [PASS] Page Count: {pages} (strictly 1 page without spillover)")
    assert pages == 1, "PDF spilled over to page 2"

if __name__ == "__main__":
    # Registered Farm 101: Ramesh Kumar, Coimbatore, 4.5 acres -> 45 kg urea, Rs. 1,575 saved
    test_farm_pdf(101, "Ramesh Kumar", "Coimbatore", ["Groundnut", "Cardamom", "Tomato", "Maize", "Sannhamp", "Ragi", "Small millets"], 45, 1575)

    print("\nALL REGISTERED FARM PDF TESTS PASSED WITH 100% PRECISION!\n")
