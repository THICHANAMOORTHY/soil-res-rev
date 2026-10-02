import urllib.request
import os

for farm_id in [101, 102]:
    url = f"http://localhost:3000/api/report/pdf?farm_id={farm_id}"
    req = urllib.request.Request(url, headers={"User-Agent": "TestClient/1.0"})
    with urllib.request.urlopen(req, timeout=10) as res:
        assert res.status == 200, f"Status code: {res.status}"
        content_type = res.headers.get("Content-Type")
        disposition = res.headers.get("Content-Disposition")
        data = res.read()
        print(f"API /api/report/pdf?farm_id={farm_id}:")
        print(f"  Status: {res.status}")
        print(f"  Content-Type: {content_type}")
        print(f"  Content-Disposition: {disposition}")
        print(f"  Bytes downloaded: {len(data):,}")
        assert "application/pdf" in content_type
        assert len(data) > 10000

print("\nPDF Download API endpoints verified successfully!")
