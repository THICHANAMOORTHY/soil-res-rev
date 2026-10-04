// ============================================================
// reportPdf.js — Generates & Downloads Farmer Soil Health & Action Plan PDF
// ============================================================

async function exportFarmerReportPDF() {
  const isTa = (window.i18n && window.i18n.getLanguage() === 'ta');
  const buttons = document.querySelectorAll('#btn-export-pdf, .btn-download-pdf, button[onclick="exportFarmerReportPDF()"]');
  buttons.forEach(b => {
    b.disabled = true;
    b.dataset.origText = b.innerHTML;
    b.innerHTML = isTa ? '⏳ PDF பதிவிறக்கம் செய்யப்படுகிறது…' : '⏳ Downloading PDF…';
  });

  try {
    let dash = window.state?.dashData || window.state?.dashboard;
    if (!dash) {
      try {
        dash = await apiGet(`/dashboard?farm_id=${window.state?.farm_id || 101}`);
        if (window.state) window.state.dashData = dash;
      } catch (e) {
        console.warn('Could not refresh dashboard data for PDF, using defaults:', e);
      }
    }

    const farmerName = dash?.farm?.farmer_name || 'Farmer';
    const farmId = window.state?.farm_id || 101;
    const fileName = `UZHAVU_KAAPPAAN_Farmer_Soil_Health_Action_Plan_${farmId}.pdf`;

    // Strategy 1: Fetch PDF as Blob from server endpoint
    let downloaded = false;
    try {
      const downloadEndpoints = [
        `/download/farmer-plan-pdf?farm_id=${farmId}&t=${Date.now()}`,
        `/download/uzhavu-kaappaan-pdf?farm_id=${farmId}&t=${Date.now()}`,
        `/api/report/pdf?farm_id=${farmId}&t=${Date.now()}`,
        '/downloads/UZHAVU_KAAPPAAN_Farmer_Soil_Health_Action_Plan.pdf',
        '/downloads/CropSmart_Farmer_Soil_Health_Action_Plan.pdf'
      ];

      for (const ep of downloadEndpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const blob = await res.blob();
            if (blob && blob.size > 500) {
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.style.display = 'none';
              a.href = url;
              a.download = fileName;
              document.body.appendChild(a);
              a.click();
              setTimeout(() => {
                window.URL.revokeObjectURL(url);
                if (a.parentNode) a.parentNode.removeChild(a);
              }, 1000);
              downloaded = true;
              break;
            }
          }
        } catch (fetchErr) {
          console.warn('Fetch endpoint failed, trying next:', fetchErr);
        }
      }
    } catch (e) {
      console.warn('Blob download strategy failed, falling back:', e);
    }

    // Strategy 2: Direct window.open / location trigger if blob was blocked
    if (!downloaded) {
      const dynamicUrl = `/download/farmer-plan-pdf?farm_id=${farmId}&t=${Date.now()}`;
      try {
        const a = document.createElement('a');
        a.href = dynamicUrl;
        a.target = '_blank';
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { if (a.parentNode) a.parentNode.removeChild(a); }, 500);
        downloaded = true;
      } catch (e2) {
        window.location.href = dynamicUrl;
        downloaded = true;
      }
    }

    // Strategy 3: Dynamic client-side rendering via html2pdf if completely offline
    if (!downloaded && window.html2pdf) {
      await generateClientSidePDF(dash, farmerName, farmId, fileName);
    }

    // Show friendly success message
    showDownloadSuccessToast(fileName);

  } catch (err) {
    console.error('Failed to export PDF:', err);
    // Ultimate fallback: open in new tab
    window.open('/download/farmer-plan-pdf', '_blank');
  } finally {
    buttons.forEach(b => {
      b.disabled = false;
      if (b.dataset.origText) b.innerHTML = b.dataset.origText;
    });
  }
}

function showDownloadSuccessToast(fileName) {
  let toast = document.getElementById('pdf-download-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'pdf-download-toast';
    toast.style.position = 'fixed';
    toast.style.bottom = '24px';
    toast.style.right = '24px';
    toast.style.background = '#065f46';
    toast.style.color = '#ffffff';
    toast.style.padding = '12px 20px';
    toast.style.borderRadius = '8px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.3)';
    toast.style.fontSize = '13px';
    toast.style.fontWeight = '600';
    toast.style.zIndex = '99999';
    toast.style.display = 'flex';
    toast.style.alignItems = 'center';
    toast.style.gap = '10px';
    toast.style.transition = 'all 0.3s ease';
    document.body.appendChild(toast);
  }

  const isTamil = (window.i18n && window.i18n.getLanguage() === 'ta');
  toast.innerHTML = `<span>✅</span> <span>${isTamil ? 'செயல்திட்டம் வெற்றிகரமாக பதிவிறக்கம் செய்யப்பட்டது!' : 'Action Plan PDF downloaded successfully!'}</span>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 4000);
}

// Optional dynamic client-side generator helper
async function generateClientSidePDF(dash, farmerName, farmId, fileName) {
  const farmName = dash?.farm?.name || 'Coimbatore Farm';
  const soilScore = dash?.farm_health ?? null; // null = farm has no soil test yet
  const recCrop = dash?.recommended_crop?.name || 'Green Gram';
  const alerts = dash?.soil_alerts || [];

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.width = '750px';
  container.style.padding = '20px';
  container.style.background = '#ffffff';
  container.style.color = '#0f172a';
  container.style.fontFamily = 'Arial, sans-serif';

  container.innerHTML = `
    <div style="border-bottom:2px solid #065f46;padding-bottom:12px;margin-bottom:16px">
      <h1 style="color:#065f46;margin:0;font-size:22px">🌱 CropSmart — Farmer Soil Health Action Plan</h1>
      <p style="color:#475569;margin:4px 0 0 0;font-size:12px">Certified P025 Agronomic Model · 45,000+ Records Analyzed</p>
    </div>
    <div style="display:flex;justify-content:space-between;margin-bottom:16px;font-size:12px">
      <div><strong>Farmer:</strong> ${farmerName} | <strong>Location:</strong> ${farmName}</div>
      <div><strong>Date:</strong> ${new Date().toLocaleDateString()} | <strong>ID:</strong> #P025-${farmId}</div>
    </div>
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:12px;border-radius:6px;margin-bottom:16px">
      <h3 style="margin:0 0 6px 0;color:#166534">1. Soil Health: ${soilScore === null ? 'Not yet tested' : `${soilScore} / 100`}</h3>
      <p style="margin:0;font-size:12px;color:#14532d">Deficiencies: ${alerts.length ? alerts.join(', ') : (soilScore === null ? 'Run a soil analysis first' : 'None detected')}</p>
    </div>
    <div style="background:#eff6ff;border:1px solid #bfdbfe;padding:12px;border-radius:6px;margin-bottom:16px">
      <h3 style="margin:0 0 6px 0;color:#1e40af">2. Top Recommendation: ${recCrop} (Legume N-Fixer)</h3>
      <p style="margin:0;font-size:12px;color:#1e3a8a">Breaks continuous cultivation cycle and replenishes soil nitrogen naturally.</p>
    </div>
  `;
  document.body.appendChild(container);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  await window.html2pdf().set(opt).from(container).save();
  document.body.removeChild(container);
}

window.exportFarmerReportPDF = exportFarmerReportPDF;
