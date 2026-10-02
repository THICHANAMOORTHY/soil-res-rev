// ============================================================
// i18n.js — Comprehensive Multi-Language Support (English & Tamil தமிழ்)
// ============================================================

const TRANSLATIONS = {
  en: {
    // Brand & Nav
    brandSubtitle: "UZHAVU KAAPPAAN · Soil Restorer",
    navMain: "Main",
    navAnalysis: "Analysis",
    navOutput: "Output",
    navDashboard: "Dashboard",
    navSoilAnalysis: "Soil Analysis",
    navCropHistory: "Crop History",
    navEvaluation: "Crop Evaluation",
    navRotation: "Rotation Optimizer",
    navSimulation: "Soil Simulation",
    navPrecision: "Precision Agronomy",
    navGpsZones: "GPS Zone Allocation",
    navGpsZonesShort: "GPS Zones",
    navLivestock: "Livestock & Feed (IFS)",
    navDairyFeed: "Dairy & Silage Feeder",
    navEnterprise: "B2B Enterprise",
    navB2B: "FPO Command Center",
    b2bTitle: "FPO & Agribusiness Command Center",
    btnExportFPO: "Export FPO Intelligence",
    lblTotalFarmers: "Registered Farmers",
    lblManagedFarms: "Managed Farms",
    lblCultivatedArea: "Cultivated Acreage",
    lblIoTFleet: "IoT Telemetry Nodes",
    lblClusters: "Across 3 Village Clusters",
    lblRegionalSoilHealth: "Regional Soil Health Distribution",
    lblCropDistMandi: "Crop Distribution & Harvest Demand",
    dairyFeedTitle: "Dairy Feeder & Silage Quality Hub",
    dairyFeedSubtitle: "Precision Silage Fermentation Screening, IoT Telemetry, Herd Feed Planning & Soil Nutrient Recycling",
    btnRunSilageTest: "Run Silage Test",
    btnSimulateBatch: "Simulate IoT Batch (DF01/DF02)",
    cardSilageQuality: "Silage Quality Tier",
    cardFermentationScore: "Fermentation Index",
    cardSpoilageRisk: "Spoilage & Mould Risk",
    cardHerdMilkImpact: "Herd Milk Impact",
    navRecommendation: "Recommendation",
    activeFarm: "Active Farm",
    acresDrip: "4.5 acres · Drip Irrigation",
    sidebarDownloads: "Downloads",
    dlActionPlan: "Action Plan (PDF)",
    dlCropsCsv: "Crops Data (CSV)",
    dlFullJson: "Full Data (JSON)",

    gpsZonesTitle: "GPS Farm Zone Allocation & Spatial Soil Analysis",
    gpsZonesSubtitle: "Precision geofenced micro-zones tailored to localized NPK condition, soil texture, and targeted crop rotation",
    btnDetectGps: "Detect Live GPS Location",

    // Header & Meta
    dashboardTitle: "Farm Dashboard",
    lblFarmer: "Farmer:",
    lblLocation: "Location:",
    btnDownloadPdf: "Download Action Plan (PDF)",

    // Location Selector
    lblFarmLocation: "📍 Farm Location:",
    searchLocationPlaceholder: "Search any city or district (e.g. Pune, Ludhiana)...",
    noLocationsFound: "No locations found.",

    // Live Weather Card
    lblLiveWeather: "LIVE Real-Time Weather",
    btnRefreshWeather: "Refresh",
    connecting: "Connecting…",
    updatedAt: "Updated",
    feelsLike: "Feels like",
    paramHumidity: "💧 Humidity",
    paramPrecip: "🌧️ Precip / Rain",
    paramWind: "💨 Wind Speed",
    paramPressure: "⏱️ Pressure",
    paramLight: "☀️ Sunlight / Light",
    advisorySectionTitle: "🌱 Real-Time Field Advisories",
    forecastSectionTitle: "📅 7-Day Agricultural Forecast",
    today: "Today",

    // Dashboard KPIs
    cardSoilHealth: "Soil Health Score",
    cardAlerts: "Alerts",
    cardRecommendedCrop: "Recommended Crop",
    cardExpectedProfit: "Expected Profit / Acre",
    profit3SeasonTotal: "3-Season Total:",
    cardSoilParams: "Current Soil Parameters",
    chartRecoveryCurve: "Soil Recovery Curve",
    chartRotationPlan: "Recommended Rotation Plan",
    cardWhyThisPlan: "Why This Plan",
    cardRecentCropHistory: "Recent Crop History",
    btnAddHistory: "+ Add History",
    optimalNutrients: "All Nutrients Adequate",
    noHistoryYet: "No history yet. Add crop history to get started.",

    // Table Headers
    thNum: "#",
    thCrop: "Crop",
    thSeason: "Season",
    thYear: "Year",
    thYield: "Yield (kg)",
    thCost: "Cost (₹)",
    thRevenue: "Revenue (₹)",
    thProfit: "Profit (₹)",

    // Soil Analysis View
    soilAnalysisTitle: "Soil Analysis",
    soilAnalysisSubtitle: "Enter your soil test readings to compute health score and detect deficiencies",
    nitrogenLabel: "🌿 Nitrogen (N) <span class=\"unit\">kg/ha · ideal: 80–160</span>",
    phosphorusLabel: "💎 Phosphorus (P) <span class=\"unit\">kg/ha · ideal: 30–60</span>",
    potassiumLabel: "🍌 Potassium (K) <span class=\"unit\">kg/ha · ideal: 60–120</span>",
    phLabel: "⚗️ Soil pH <span class=\"unit\">ideal: 6.0–7.5</span>",
    organicCarbonLabel: "🍂 Organic Carbon <span class=\"unit\">% · ideal: 0.8–1.5</span>",
    btnAnalyseSoil: "🔬 Analyse Soil",
    btnNextCropHistory: "Next: Crop History →",

    // Crop History View
    cropHistoryTitle: "Crop History",
    cropHistorySubtitle: "Record past crops to detect rotation issues and guide recommendations",
    recordedHistoryTitle: "Recorded History",
    addCropHistoryTitle: "Add Crop History",
    btnAddRow: "+ Add Row",
    btnSaveHistory: "💾 Save History",
    btnNextEvaluation: "Next: Evaluate Crops →",

    // Crop Evaluation View
    evalTitle: "Crop Evaluation",
    evalSubtitle: "Select candidate crops to score across 6 dimensions and rank the best options",
    lblSeason: "Season:",
    candidateCropsTitle: "Candidate Crops",
    candidateSelectHint: "Click crops to select them for evaluation",
    selectedChip: "selected",
    excludedCropsTitle: "Excluded Crops (with reasons)",
    btnRunEval: "🚀 Run Evaluation",
    cropRadarTitle: "Crop Score Radar",
    legendTitle: "Score Breakdown Legend",
    leaderboardTitle: "Evaluation Leaderboard",
    btnNextRotation: "⚡ Optimize Rotation →",

    // Rotation Optimizer View
    rotationTitle: "Rotation Optimizer",
    rotationSubtitle: "Generate and compare 3 multi-season rotation plans with profit and soil projections",
    genPlansTitle: "Generate Rotation Plans",
    genPlansDesc: "Analyzes evaluated crops and generates optimized 3-season rotation plans",
    btnOptimizeRotation: "⚡ Optimize Rotation",
    loadingRotationPlans: "Generating optimal rotation plans…",
    profitCompTitle: "3-Season Profit Comparison",
    btnNextSimulation: "🔮 Run Soil Simulation →",
    planRecommended: "Recommended Plan",
    planAlternative: "Alternative Plan",

    // Soil Simulation View
    simTitle: "Soil Simulation",
    simSubtitle: "Watch how soil nutrients evolve season-by-season under the recommended rotation plan",
    btnBackPlans: "← Back to Plans",
    btnNextRecommendation: "⭐ View Recommendation →",

    // Final Recommendation View
    recTitle: "Final Recommendation",
    recSubtitle: "AI-powered crop + rotation recommendation for your farm",
    whyThisCrop: "Why This Crop?",
    projectedSoilRecovery: "Projected Soil Recovery",
    recommendedRotation: "Recommended 4-Season Rotation",
    btnBackDashboard: "📊 Back to Dashboard",
    btnReanalyseSoil: "🔬 Re-analyse Soil",
    btnDownloadPlanPdf: "📄 Download Farmer Action Plan (PDF)",
    profitPerAcre: "Profit per Acre",
    cropDetails: "Crop Details",
    scoreText: "Score",

    // Statuses & Traits
    optimal: "Optimal",
    moderateDepletion: "Moderate Depletion",
    criticalDeficit: "Critical Deficit",
    nitrogenFixer: "N-Fixer",
    nonFixer: "Non-Fixer",
    lowWater: "Low Water",
    mediumWater: "Medium Water",
    highWater: "High Water",
    legume: "Legume",
    cereal: "Cereal",
    fruit: "Fruit",
    vegetable: "Vegetable",
    commercial: "Commercial",
    spices: "Spices",
    oilseed: "Oilseed",
  },

  ta: {
    // Brand & Nav
    brandSubtitle: "உழவு காப்பான் (UZHAVU KAAPPAAN) · மண் வளம் மீட்பு",
    navMain: "முதன்மை",
    navAnalysis: "பகுப்பாய்வு",
    navOutput: "பரிந்துரை",
    navDashboard: "முகப்பு பலகை",
    navSoilAnalysis: "மண் பரிசோதனை",
    navCropHistory: "பயிர் வரலாறு",
    navEvaluation: "பயிர் மதிப்பீடு",
    navRotation: "சுழற்சி உகப்பாக்கி",
    navSimulation: "மண் வளம் உருவகப்படுத்துதல்",
    navPrecision: "துல்லிய வேளாண்மை",
    navGpsZones: "ஜிபிஎஸ் மண்டல ஒதுக்கீடு",
    navGpsZonesShort: "மண்டலங்கள்",
    navLivestock: "கால்நடை & தீவனம் (IFS)",
    navDairyFeed: "கால்நடை தீவனம் & சைலேஜ் தரம்",
    navEnterprise: "B2B நிறுவனம்",
    navB2B: "FPO கட்டுப்பாட்டு மையம்",
    b2bTitle: "FPO மற்றும் வேளாண் வணிக கட்டுப்பாட்டு மையம்",
    btnExportFPO: "FPO அறிக்கை பதிவிறக்கு",
    lblTotalFarmers: "பதிவுசெய்த விவசாயிகள்",
    lblManagedFarms: "நிர்வகிக்கப்படும் பண்ணைகள்",
    lblCultivatedArea: "சாகுபடி பரப்பு",
    lblIoTFleet: "IoT தொலை அளவியல் முனையங்கள்",
    lblClusters: "3 கிராமக் குழுக்களில்",
    lblRegionalSoilHealth: "பிராந்திய மண் வள விநியோகம்",
    lblCropDistMandi: "பயிர் விநியோகம் & சந்தை தேவை",
    dairyFeedTitle: "கால்நடை தீவன மேலாண்மை & சைலேஜ் தர ஆய்வு",
    dairyFeedSubtitle: "துல்லிய சைலேஜ் நொதித்தல் ஆய்வு, IoT சென்சார் தரவு, தீவனத் திட்டம் & மண் சத்து மறுசுழற்சி",
    btnRunSilageTest: "சைலேஜ் சோதனை செய்",
    btnSimulateBatch: "IoT மாதிரி தரவு உருவாக்கு (DF01/DF02)",
    cardSilageQuality: "சைலேஜ் தர நிலை",
    cardFermentationScore: "நொதித்தல் குறியீடு",
    cardSpoilageRisk: "கெடுதல் & பூஞ்சை அபாயம்",
    cardHerdMilkImpact: "பால் உற்பத்தி தாக்கம்",
    navRecommendation: "இறுதி பரிந்துரை",
    activeFarm: "செயலில் உள்ள பண்ணை",
    acresDrip: "4.5 ஏக்கர் · சொட்டு நீர் பாசனம்",
    sidebarDownloads: "பதிவிறக்கங்கள்",
    dlActionPlan: "செயல்திட்ட அறிக்கை (PDF)",
    dlCropsCsv: "பயிர் தரவு (CSV)",
    dlFullJson: "முழு தரவு (JSON)",

    gpsZonesTitle: "ஜிபிஎஸ் பண்ணை மண்டல ஒதுக்கீடு & மண் பகுப்பாய்வு",
    gpsZonesSubtitle: "மண்ணின் சத்து குறைபாடு மற்றும் நிலப்பரப்பிற்கு ஏற்ப துல்லிய பயிர் ஒதுக்கீடு",
    btnDetectGps: "நேரடி ஜிபிஎஸ் கண்டறி",

    // Header & Meta
    dashboardTitle: "பண்ணை முகப்பு பலகை",
    lblFarmer: "விவசாயி:",
    lblLocation: "இருப்பிடம்:",
    btnDownloadPdf: "செயல்திட்ட அறிக்கை (PDF)",

    // Location Selector
    lblFarmLocation: "📍 பண்ணை இருப்பிடம்:",
    searchLocationPlaceholder: "நகரம் அல்லது மாவட்டத்தைத் தேடுங்கள் (எ.கா. கோவை, மதுரை, சேலம்)...",
    noLocationsFound: "இருப்பிடங்கள் எதுவும் கிடைக்கவில்லை.",

    // Live Weather Card
    lblLiveWeather: "நேரலை வானிலை தகவல்",
    btnRefreshWeather: "புதுப்பி",
    connecting: "இணைக்கிறது…",
    updatedAt: "புதுப்பிக்கப்பட்டது",
    feelsLike: "உணரப்படும் வெப்பநிலை",
    paramHumidity: "💧 ஈரப்பதம்",
    paramPrecip: "🌧️ மழைப்பொழிவு",
    paramWind: "💨 காற்றின் வேகம்",
    paramPressure: "⏱️ காற்றழுத்தம்",
    paramLight: "☀️ சூரிய ஒளி / வெளிச்சம்",
    advisorySectionTitle: "🌱 நேரலை கள விவசாய ஆலோசனைகள்",
    forecastSectionTitle: "📅 7-நாள் விவசாய வானிலை முன்னறிவிப்பு",
    today: "இன்று",

    // Dashboard KPIs
    cardSoilHealth: "மண் வள குறியீடு",
    cardAlerts: "எச்சரிக்கைகள்",
    cardRecommendedCrop: "பரிந்துரைக்கப்படும் பயிர்",
    cardExpectedProfit: "எதிர்பார்க்கப்படும் லாபம் / ஏக்கர்",
    profit3SeasonTotal: "3-பருவ மொத்தம்:",
    cardSoilParams: "தற்போதைய மண் சத்து அளவு",
    chartRecoveryCurve: "மண் வளம் மீட்பு பாதை",
    chartRotationPlan: "பரிந்துரைக்கப்பட்ட சுழற்சி திட்டம்",
    cardWhyThisPlan: "ஏன் இந்தத் திட்டம்?",
    cardRecentCropHistory: "சமீபத்திய பயிர் வரலாறு",
    btnAddHistory: "+ வரலாறு சேர்",
    optimalNutrients: "அனைத்து சத்துக்களும் போதுமான அளவில் உள்ளன",
    noHistoryYet: "பயிர் வரலாறு இன்னும் சேர்க்கப்படவில்லை. புதிய வரலாற்றைச் சேர்க்கவும்.",

    // Table Headers
    thNum: "#",
    thCrop: "பயிர்",
    thSeason: "பருவம்",
    thYear: "ஆண்டு",
    thYield: "மகசூல் (கிலோ)",
    thCost: "செலவு (₹)",
    thRevenue: "வருமானம் (₹)",
    thProfit: "லாபம் (₹)",

    // Soil Analysis View
    soilAnalysisTitle: "மண் வள நோயறிதல்",
    soilAnalysisSubtitle: "மண் பரிசோதனை முடிவுகளை உள்ளிட்டு உங்கள் நிலத்தின் ஆரோக்கியத்தை பரிசோதிக்கவும்",
    nitrogenLabel: "🌿 தழைச்சத்து (நைட்ரஜன் - N) <span class=\"unit\">கிலோ/ஹெக்டேர் · உகந்தது: 80–160</span>",
    phosphorusLabel: "💎 மணிச்சத்து (பாஸ்பரஸ் - P) <span class=\"unit\">கிலோ/ஹெக்டேர் · உகந்தது: 30–60</span>",
    potassiumLabel: "🍌 சாம்பல் சத்து (பொட்டாசியம் - K) <span class=\"unit\">கிலோ/ஹெக்டேர் · உகந்தது: 60–120</span>",
    phLabel: "⚗️ மண் கார அமிலத்தன்மை (pH) <span class=\"unit\">உகந்தது: 6.0–7.5</span>",
    organicCarbonLabel: "🍂 மண் கரிம வளம் <span class=\"unit\">% · உகந்தது: 0.8–1.5</span>",
    btnAnalyseSoil: "🔬 மண் பரிசோதனை செய்",
    btnNextCropHistory: "அடுத்து: பயிர் வரலாறு →",

    // Crop History View
    cropHistoryTitle: "பயிர் வரலாறு",
    cropHistorySubtitle: "முந்தைய பயிர்களைப் பதிவு செய்து சுழற்சி பரிந்துரைகளைப் பெறவும்",
    recordedHistoryTitle: "பதிவு செய்யப்பட்ட வரலாறு",
    addCropHistoryTitle: "புதிய பயிர் வரலாறு சேர்",
    btnAddRow: "+ வரிசை சேர்",
    btnSaveHistory: "💾 வரலாற்றைச் சேமி",
    btnNextEvaluation: "அடுத்து: பயிர் மதிப்பீடு →",

    // Crop Evaluation View
    evalTitle: "பயிர் மதிப்பீடு",
    evalSubtitle: "பல்வேறு அளவீடுகளில் பயிர்களை மதிப்பிட்டு சிறந்தவற்றைத் தேர்ந்தெடுக்கவும்",
    lblSeason: "பருவம்:",
    candidateCropsTitle: "பரிசீலனை பயிர்கள்",
    candidateSelectHint: "மதிப்பீட்டிற்கு பயிர்களைக் கிளிக் செய்து தேர்ந்தெடுக்கவும்",
    selectedChip: "தேர்ந்தெடுக்கப்பட்டது",
    excludedCropsTitle: "தவிர்க்கப்பட்ட பயிர்கள் (காரணங்களுடன்)",
    btnRunEval: "🚀 மதிப்பீடு செய்",
    cropRadarTitle: "பயிர் மதிப்பீட்டு ரேடார்",
    legendTitle: "மதிப்பீட்டு அளவீடுகள்",
    leaderboardTitle: "மதிப்பீட்டு தரவரிசை பட்டியல்",
    btnNextRotation: "⚡ சுழற்சியை உகப்பாக்கு →",

    // Rotation Optimizer View
    rotationTitle: "பயிர் சுழற்சி உகப்பாக்கி",
    rotationSubtitle: "மண் வளம் மீட்பு மற்றும் பண்ணை லாபத்தை சமநிலைப்படுத்தும் 3 பருவ சுழற்சி திட்டம்",
    genPlansTitle: "சுழற்சி திட்டங்களை உருவாக்கு",
    genPlansDesc: "மதிப்பிடப்பட்ட பயிர்களை ஆய்வு செய்து 3 பருவ சுழற்சி திட்டங்களை உருவாக்குகிறது",
    btnOptimizeRotation: "⚡ சுழற்சி திட்டத்தை உருவாக்கு",
    loadingRotationPlans: "உகந்த சுழற்சி திட்டங்கள் தயாராகின்றன…",
    profitCompTitle: "3-பருவ லாப ஒப்பீடு",
    btnNextSimulation: "🔮 மண் வளம் உருவகப்படுத்துதல் →",
    planRecommended: "பரிந்துரைக்கப்பட்ட திட்டம்",
    planAlternative: "மாற்றுத் திட்டம்",

    // Soil Simulation View
    simTitle: "மண் வளம் உருவகப்படுத்துதல்",
    simSubtitle: "பரிந்துரைக்கப்பட்ட சுழற்சியில் அடுத்தடுத்த பருவங்களில் மண் சத்துக்கள் உயர்வதை காண்க",
    btnBackPlans: "← திட்டங்களுக்கு திரும்புக",
    btnNextRecommendation: "⭐ இறுதி பரிந்துரை →",

    // Final Recommendation View
    recTitle: "இறுதி பரிந்துரை & செயல்திட்டம்",
    recSubtitle: "செயற்கை நுண்ணறிவு அடிப்படையிலான உகந்த பயிர் மற்றும் சுழற்சி திட்டம்",
    whyThisCrop: "ஏன் இந்த பயிர்?",
    projectedSoilRecovery: "எதிர்பார்க்கப்படும் மண் வளம் மீட்பு",
    recommendedRotation: "பரிந்துரைக்கப்பட்ட 4-பருவ பயிர் சுழற்சி",
    btnBackDashboard: "📊 முகப்பிற்கு திரும்புக",
    btnReanalyseSoil: "🔬 மீண்டும் பரிசோதிக்க",
    btnDownloadPlanPdf: "📄 விவசாயி செயல்திட்ட அறிக்கை (PDF)",
    profitPerAcre: "ஏக்கருக்கு லாபம்",
    cropDetails: "பயிர் விவரங்கள்",
    scoreText: "மதிப்பீடு",

    // Statuses & Traits
    optimal: "சிறந்த நிலை",
    moderateDepletion: "மிதமான சத்து குறைவு",
    criticalDeficit: "தீவிர ஊட்டச்சத்து பற்றாக்குறை",
    nitrogenFixer: "தழைச்சத்து நிலைநிறுத்தி",
    nonFixer: "தழைச்சத்து நிலைநிறுத்தாதது",
    lowWater: "குறைந்த நீர்",
    mediumWater: "மிதமான நீர்",
    highWater: "அதிக நீர்",
    legume: "பயறு வகை",
    cereal: "தானிய வகை",
    fruit: "பழ வகை",
    vegetable: "காய்கறி வகை",
    commercial: "பணப்பயிர்",
    spices: "நறுமணப் பயிர்",
    oilseed: "எண்ணெய் வித்து",
  }
};

// ── Pure Tamil Crop Names (No English collision) ─────────────
const CROP_TRANSLATIONS_TA = {
  "Tomato": "தக்காளி",
  "Green Gram": "பாசிப்பயறு",
  "Black Gram": "உளுந்து",
  "Blackgram": "உளுந்து",
  "Groundnut": "வேர்க்கடலை",
  "Rice": "நெல்",
  "Wheat": "கோதுமை",
  "Maize": "மக்காச்சோளம்",
  "Cotton": "பருத்தி",
  "Sugarcane": "கரும்பு",
  "Banana": "வாழை",
  "Coconut": "தென்னை",
  "Onion": "வெங்காயம்",
  "Potato": "உருளைக்கிழங்கு",
  "Chickpea": "கொண்டைக்கடலை",
  "Pigeon Pea": "துவரம்பருப்பு",
  "Soybean": "சோயாபீன்",
  "Mustard": "கடுகு",
  "Garlic": "பூண்டு",
  "Ginger": "இஞ்சி",
  "Turmeric": "மஞ்சள்",
  "Dry Chillies": "காய்ந்த மிளகாய்",
  "Apple": "ஆப்பிள்",
  "Mango": "மாம்பழம்",
  "Pomegranate": "மாதுளை",
  "Watermelon": "தர்பூசணி",
  "Grapes": "திராட்சை",
  "Papaya": "பப்பாளி",
  "Sweet Potato": "சர்க்கரைவள்ளிக்கிழங்கு",
  "Tapioca": "மரவள்ளிக்கிழங்கு",
  "Jute": "சணல்",
  "Coffee": "காபி",
  "Tobacco": "புகையிலை",
  "Sunflower": "சூரியகாந்தி",
  "Sesamum": "எள்",
  "Bajra": "கம்பு",
  "Jowar": "சோளம்",
  "Ragi": "கேழ்வரகு",
  "Barley": "பார்லி",
  "Small millets": "சிறு தானியங்கள்",
  "Kidney Bean": "ராஜ்மா",
  "Red Lentil": "மைசூர் பருப்பு",
  "Moth Bean": "நரிப்பயறு",
  "Peas & Beans": "பீன்ஸ்",
  "Cowpea": "தட்டப்பயறு",
  "Horse-gram": "கொள்ளு",
  "Cardamom": "ஏலக்காய்",
  "Black pepper": "கருப்பு மிளகு",
  "Coriander": "கொத்தமல்லி",
  "Cashewnut": "முந்திரி",
  "Arecanut": "பாக்கு",
};

// ── Tamil Weather Conditions ──────────────────────────────────
const WEATHER_CONDITIONS_TA = {
  "clear sky": "தெளிவான வானம்",
  "mainly clear": "பெரும்பாலும் தெளிவான வானம்",
  "partly cloudy": "பகுதியளவு மேகமூட்டம்",
  "overcast": "அடர்ந்த மேகமூட்டம்",
  "fog": "மூடுபனி",
  "depositing rime fog": "கடும் பனிமூட்டம்",
  "light drizzle": "லேசான தூறல் மழை",
  "drizzle": "தூறல் மழை",
  "moderate drizzle": "தூறல் மழை",
  "dense drizzle": "அடர்ந்த தூறல் மழை",
  "slight rain": "லேசான மழை",
  "moderate rain": "மிதமான மழை",
  "heavy rain": "கனமழை",
  "rain": "மழை",
  "slight rain showers": "லேசான சாரல் மழை",
  "moderate rain showers": "சாரல் மழை",
  "violent rain showers": "கடும் பெருமழை",
  "thunderstorm": "இடியுடன் கூடிய மழை",
  "thunderstorm with slight hail": "ஆலங்கட்டி இடிமழை",
  "thunderstorm with heavy hail": "கடும் ஆலங்கட்டி புயல்மழை",
};

// ── Tamil Days of Week ───────────────────────────────────────
const DAYS_TRANSLATIONS_TA = {
  "today": "இன்று",
  "mon": "திங்கள்",
  "tue": "செவ்வாய்",
  "wed": "புதன்",
  "thu": "வியாழன்",
  "fri": "வெள்ளி",
  "sat": "சனி",
  "sun": "ஞாயிறு",
  "monday": "திங்கள்",
  "tuesday": "செவ்வாய்",
  "wednesday": "புதன்",
  "thursday": "வியாழன்",
  "friday": "வெள்ளி",
  "saturday": "சனி",
  "sunday": "ஞாயிறு",
};

// ── Tamil Seasons ────────────────────────────────────────────
const SEASONS_TRANSLATIONS_TA = {
  "kharif": "காரிஃப் (பருவமழை)",
  "rabi": "ரபி (குளிர்காலம்)",
  "zaid": "சையத் (கோடைகாலம்)",
  "summer": "கோடை",
  "winter": "குளிர்",
};

// ── Tamil Soil Alerts Dictionary ─────────────────────────────
const ALERT_TRANSLATIONS_TA = {
  "low nitrogen": "குறைந்த தழைச்சத்து (N)",
  "low organic carbon": "குறைந்த கரிம வளம் (OC)",
  "low phosphorus": "குறைந்த மணிச்சத்து (P)",
  "low potassium": "குறைந்த சாம்பல் சத்து (K)",
  "continuous cultivation": "தொடர் பயிரிடுதல் அபாயம்",
  "continuous cultivation penalty": "தொடர் பயிரிடுதல் அபாயம்",
  "high nitrogen": "அதிகப்படியான தழைச்சத்து",
  "high acidity": "அதிக அமிலத்தன்மை",
  "high alkalinity": "அதிக காரத்தன்மை",
};

// ── Tamil Reasoning Phrases ──────────────────────────────────
const REASONING_TRANSLATIONS_TA = {
  "improves nitrogen balance": "இயற்கை முறையில் வளிமண்டல தழைச்சத்தை மண்ணில் நிலைநிறுத்துகிறது",
  "breaks repeated cultivation": "தொடர் பயிரிடும் சுழற்சியை உடைத்து மண் வளத்தை மீட்டெடுக்கிறது",
  "lower water requirement": "குறைந்த நீர் தேவை தற்போதைய பாசன வசதிக்கு மிகவும் பொருத்தமானது",
  "good expected profitability": "சந்தை விலைகளின் அடிப்படையில் அதிக லாபம் தரக்கூடியது",
  "suitable for current season": "தற்போதைய பயிர் பருவத்திற்கு மிகவும் ஏற்றது",
  "high market demand": "சந்தையில் நிலையான அதிக தேவை உள்ளது",
  "strong projected profitability": "ஏக்கருக்கு அதிக நிகர லாபம் ஈட்டித் தரும்",
  "low disease risk": "பூச்சி மற்றும் நோய் தாக்குதல் அபாயம் மிகக் குறைவு",
  "breaks continuous cultivation": "தொடர் பயிர் நோய்கள் மற்றும் பூச்சி பரவல் சுழற்சியை உடைக்கிறது",
  "matches current irrigation": "தற்போதைய பாசன வசதி மற்றும் மழைப்பொழிவுக்கு உகந்தது",
};

// ── Tamil Advisory Titles & Categories & Messages ─────────────
const ADVISORY_TITLES_TA = {
  "rain hazard": "மழை அபாயம்",
  "high wind velocity": "பலத்த காற்று வேகம்",
  "optimal spray window": "மருந்து தெளிக்க உகந்த நேரம்",
  "irrigation suspension": "பாசனம் நிறுத்துதல்",
  "high evapotranspiration": "அதிக நீர் இழப்பு / ஆவியாதல்",
  "normal irrigation schedule": "வழக்கமான பாசன அட்டவணை",
  "high fungal disease risk": "அதிக பூஞ்சை நோய் அபாயம்",
  "moderate pest activity": "மிதமான பூச்சி நடமாட்டம்",
  "low disease pressure": "குறைந்த நோய் அபாயம்",
};

const ADVISORY_CATEGORIES_TA = {
  "spraying": "மருந்து தெளிப்பு",
  "irrigation": "பாசனம்",
  "pest risk": "பூச்சி அபாயம்",
};

const ADVISORY_MESSAGES_TA = {
  "precipitation active": "மழை பெய்கிறது அல்லது மழை பெய்ய 90%க்கும் மேல் வாய்ப்புள்ளது. மருந்து கரைசல் அடித்துச் செல்லப்படுவதைத் தவிர்க்க பூச்சிக்கொல்லி தெளிப்பை ஒத்திவைக்கவும்.",
  "wind speed is": "பலத்த காற்று வீசுவதால் மருந்து தெளிக்கும் போது மருந்து விரயமாவதைத் தவிர்க்கவும்.",
  "calm wind": "தெளிவான வானம் மற்றும் மிதமான காற்று உள்ளதால் பயிர் ஊட்டச்சத்து மற்றும் பாதுகாப்பு தெளிப்புகளுக்கு உகந்த சூழல் உள்ளது.",
  "substantial rain received": "மண்ணில் போதுமான ஈரம் உள்ளது. நீர் தேங்குவதைத் தவிர்க்கவும் வேரழுகல் நோயைத் தடுக்கவும் திட்டமிட்ட பாசனத்தை தற்காலிகமாக நிறுத்துங்கள்.",
  "dry air": "வெப்பநிலை அதிகமாகவும் வறண்ட காற்றும் உள்ளதால் ஈரப்பதத்தை நிலைநிறுத்த சொட்டு நீர் பாசனத்தின் இடைவெளியைக் கூட்டவும்.",
  "moisture loss is balanced": "மண் ஈரப்பத இழப்பு சீராக உள்ளது. வழக்கமான சுழற்சி முறை பாசனத்தைத் தொடரலாம்.",
  "fungal disease": "அதிக ஈரப்பதம் மற்றும் வெப்பம் உள்ளதால் பூஞ்சை மற்றும் கருகல் நோய் பரவ வாய்ப்புள்ளது. பயிர் தளங்களை ஆய்வு செய்யவும்.",
  "elevated humidity": "ஈரப்பதம் அதிகமாக உள்ளது. இலைகளின் அடிப்பகுதி மற்றும் பயறு வகைகளில் அசுவினி/புழுக்கள் உள்ளதா என கண்காணிக்கவும்.",
  "suppress major airborne": "தற்போதைய வெப்பநிலை மற்றும் உலர் வானிலை பூஞ்சை மற்றும் பூச்சித் தாக்குதல்களைக் கட்டுக்குள் வைக்கிறது.",
};

let currentLang = localStorage.getItem('cropsmart_lang') || 'en';

function getLanguage() {
  return currentLang;
}

function setLanguage(lang) {
  currentLang = lang === 'ta' ? 'ta' : 'en';
  localStorage.setItem('cropsmart_lang', currentLang);
  updateLanguageUI();

  // 1. Re-render live weather immediately if we have cached data
  if (window.lastWeatherData && typeof window.renderWeatherCard === 'function') {
    window.renderWeatherCard(window.lastWeatherData);
  }

  // 2. Re-render dashboard if cached data exists
  if (window.state && window.state.dashboard && typeof window.renderDashboard === 'function') {
    window.renderDashboard(window.state.dashboard);
  }

  // 3. Re-render recommendations if cached
  if (window.state && window.state.recData && typeof window.renderRecommendation === 'function') {
    window.renderRecommendation(window.state.recData);
  }

  // 4. Re-render rotation plans if cached
  if (window.state && window.state.plans && typeof window.renderPlans === 'function') {
    window.renderPlans(window.state.plans);
  }

  // 5. Also call active view loader
  const active = (window.state && window.state.activeView) || 'dashboard';
  if (window.VIEW_LOADERS && window.VIEW_LOADERS[active]) {
    window.VIEW_LOADERS[active]();
  }
}

function t(key, fallback = '') {
  const dict = TRANSLATIONS[currentLang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || fallback || key;
}

function tCrop(name) {
  if (!name) return '';
  if (currentLang === 'ta') {
    // If name already contains pure Tamil or is in dictionary
    for (const [enKey, taVal] of Object.entries(CROP_TRANSLATIONS_TA)) {
      if (name.toLowerCase() === enKey.toLowerCase()) {
        return taVal;
      }
    }
  }
  return name;
}

function tWeatherCond(cond) {
  if (!cond) return '';
  if (currentLang === 'ta') {
    const lower = cond.trim().toLowerCase();
    for (const [k, v] of Object.entries(WEATHER_CONDITIONS_TA)) {
      if (lower === k || lower.includes(k)) {
        return v;
      }
    }
  }
  return cond;
}

function tDay(day) {
  if (!day) return '';
  if (currentLang === 'ta') {
    const lower = day.trim().toLowerCase();
    return DAYS_TRANSLATIONS_TA[lower] || day;
  }
  return day;
}

function tSeason(season) {
  if (!season) return '';
  if (currentLang === 'ta') {
    const lower = season.trim().toLowerCase();
    for (const [k, v] of Object.entries(SEASONS_TRANSLATIONS_TA)) {
      if (lower === k || lower.includes(k)) {
        return v;
      }
    }
  }
  return season;
}

function tAlert(alertText) {
  if (!alertText) return '';
  if (currentLang === 'ta') {
    const lower = alertText.toLowerCase();
    for (const [enKey, taVal] of Object.entries(ALERT_TRANSLATIONS_TA)) {
      if (lower.includes(enKey)) {
        return taVal;
      }
    }
  }
  return alertText;
}

function tReason(reasonText) {
  if (!reasonText) return '';
  if (currentLang === 'ta') {
    const lower = reasonText.toLowerCase();
    for (const [enKey, taVal] of Object.entries(REASONING_TRANSLATIONS_TA)) {
      if (lower.includes(enKey) || enKey.includes(lower)) {
        return taVal;
      }
    }
  }
  return reasonText;
}

function tAdvisoryTitle(title) {
  if (!title) return '';
  if (currentLang === 'ta') {
    const lower = title.toLowerCase().trim();
    for (const [k, v] of Object.entries(ADVISORY_TITLES_TA)) {
      if (lower.includes(k) || k.includes(lower)) return v;
    }
  }
  return title;
}

function tAdvisoryCategory(cat) {
  if (!cat) return '';
  if (currentLang === 'ta') {
    const lower = cat.toLowerCase().trim();
    return ADVISORY_CATEGORIES_TA[lower] || cat;
  }
  return cat;
}

function tAdvisoryMessage(msg) {
  if (!msg) return '';
  if (currentLang === 'ta') {
    const lower = msg.toLowerCase();
    for (const [k, v] of Object.entries(ADVISORY_MESSAGES_TA)) {
      if (lower.includes(k)) return v;
    }
  }
  return msg;
}

function updateLanguageUI() {
  // Update toggle button states
  const btnEn = document.getElementById('lang-btn-en');
  const btnTa = document.getElementById('lang-btn-ta');
  if (btnEn && btnTa) {
    if (currentLang === 'ta') {
      btnTa.classList.add('active');
      btnEn.classList.remove('active');
    } else {
      btnEn.classList.add('active');
      btnTa.classList.remove('active');
    }
  }

  // Update elements with data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const text = t(key);
    if (text) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    }
  });

  // Also update chatbot UI language if available
  if (typeof window.updateChatbotLanguage === 'function') {
    window.updateChatbotLanguage(getLanguage());
  }

  // Dynamic farm chip in sidebar
  const fcMeta = document.querySelector('.fc-meta');
  if (fcMeta) {
    fcMeta.textContent = t('acresDrip');
  }

  const fcName = document.querySelector('.fc-name');
  if (fcName) {
    if (currentLang === 'ta') {
      fcName.textContent = 'கோயம்புத்தூர் பண்ணை';
    } else {
      fcName.textContent = 'Coimbatore Farm';
    }
  }

  // Location selector options
  const locSelect = document.getElementById('farm-location-select');
  if (locSelect) {
    Array.from(locSelect.options).forEach(opt => {
      if (opt.value === 'custom') {
        opt.textContent = currentLang === 'ta' ? '🔍 தேடப்பட்ட தனிப்பயன் இடம்...' : '🔍 Custom Searched Location...';
      } else if (currentLang === 'ta' && opt.dataset.name && opt.dataset.name.includes('Coimbatore')) {
        opt.textContent = '📍 கோயம்புத்தூர், தமிழ்நாடு (4.5 ஏக்கர் · சொட்டு நீர் பாசனம்)';
      } else if (currentLang === 'en' && opt.dataset.name && opt.dataset.name.includes('Coimbatore')) {
        opt.textContent = '📍 Coimbatore, Tamil Nadu (4.5 ac · Drip)';
      }
    });
  }

  // Season dropdown in Evaluation view
  const seasonSel = document.getElementById('eval-season-sel');
  if (seasonSel) {
    Array.from(seasonSel.options).forEach(opt => {
      opt.textContent = currentLang === 'ta' ? (tSeason(opt.value) || opt.value) : opt.value;
    });
  }

  // Evaluation breakdown legend
  const legendBox = document.getElementById('eval-legend-box');
  if (legendBox) {
    const legendItems = currentLang === 'ta'
      ? ['1. மண் பொருத்தம்', '2. பருவ பொருத்தம்', '3. பயிர் சுழற்சி மதிப்பீடு', '4. நீர் தேவை குறியீடு', '5. எதிர்பார்க்கப்படும் லாபம்', '6. பூச்சி/நோய் அபாய குறியீடு']
      : ['1. Soil Suitability', '2. Season Suitability', '3. Rotation Score', '4. Water Score', '5. Profit Score', '6. Risk Score'];
    legendBox.innerHTML = legendItems.map(l => `
      <div class="flex justify-between items-center mb-12">
        <span class="text-secondary" style="font-size:13px">${l}</span>
        <span class="chip info" style="font-size:11px">/100</span>
      </div>`).join('');
  }
}

// Expose globally
window.i18n = {
  getLanguage,
  setLanguage,
  t,
  tCrop,
  tWeatherCond,
  tDay,
  tSeason,
  tAlert,
  tReason,
  tAdvisoryTitle,
  tAdvisoryCategory,
  tAdvisoryMessage,
  updateLanguageUI,
};

window.t = t;
window.tCrop = tCrop;
window.tWeatherCond = tWeatherCond;
window.tDay = tDay;
window.tSeason = tSeason;
window.tAlert = tAlert;
window.tReason = tReason;
window.tAdvisoryTitle = tAdvisoryTitle;
window.tAdvisoryCategory = tAdvisoryCategory;
window.tAdvisoryMessage = tAdvisoryMessage;
window.setLanguage = setLanguage;

document.addEventListener('DOMContentLoaded', () => {
  updateLanguageUI();
});
