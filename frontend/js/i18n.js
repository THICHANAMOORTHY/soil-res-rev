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
    // Mobile Bottom Navigation Labels (Clean & Single-line)
    mbNavDashboard: "Dashboard",
    mbNavSoil: "Soil",
    mbNavAnalysis: "Analysis",
    mbNavDairy: "Dairy",
    mbNavRotation: "Rotation",
    mbNavB2B: "FPO",
    b2bTitle: "FPO & Agribusiness Command Center",
    btnExportFPO: "Export FPO Intelligence",
    b2bNavOverview: "Command Center",
    b2bNavMembers: "Members",
    b2bNavClusters: "Clusters",
    b2bNavFarms: "Farms",
    b2bNavSoil: "Soil Intelligence",
    b2bNavCrops: "Crop Intelligence",
    b2bNavIoT: "IoT Fleet",
    b2bNavIFS: "IFS / Dairy",
    b2bNavAction: "Action Center",
    b2bNavAdvisories: "Advisories",
    b2bNavReports: "Reports",
    b2bNavSettings: "Organization Settings",
    b2bSwitchToFPO: "Switch to FPO Command Center",
    b2bSwitchToFarmer: "Switch to Farmer Platform",
    b2bSwitchRole: "Switch Role",
    b2bExportReport: "Export Report",
    b2bPushTelemetry: "Push Live Telemetry Packet",
    b2bInspectFarm: "Inspect Farm & Soil Sensors →",
    b2bAssignTask: "Assign Field Task",
    b2bDispatchAdvisory: "Send Direct Advisory",
    b2bLiveSyncActive: "● Live Stream Active",
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

    // Hub & Navigation
    navHome: "Home & Portal Hub",
    navPrecisionBadge: "PRECISION",
    navIfsBadge: "NEW · IFS",
    navNewBadge: "NEW",
    navEnterpriseNode: "ENTERPRISE NODE",
    lblFpoMember: "Member of Kovai Farmer Producer Organization (Kovai FPO)",
    lblFpoDetails: "Cluster-wide NPK monitoring · IoT Fleet Active · Collective Mandi Bargaining",
    btnOpenFpo: "Open FPO Command Center →",
    lblSensorTable: "Live Sensor Readings",
    lblAwaitingSensor: "Awaiting sensor reading",
    lblLiveProbe: "Live Sensor Probe",

    // Soil Analysis & Sensor
    btnManualMode: "Manual Entry",
    btnLiveMode: "Live Sensor",
    lblSoilTemp: "Temperature",
    lblSoilMoisture: "Soil Moisture",
    lblSoilLight: "Sunlight / Light",
    lblSoilTds: "Soil TDS",
    lblSensorStatus: "Sensor Status",
    lblReliability: "Reliability Check",
    lblPredictorTitle: "Live Sensor AI Crop Predictor",
    lblPredictorDesc: "Predicts best crops in real time directly from your Soil Scout sensor values",
    lblBtnPredict: "⚡ Predict Suitable Crops",
    lblProbeWarning: "Probe Reading Warning:",

    // Crop Evaluation Table & Legend
    thRank: "Rank",
    thCropCol: "Crop",
    thSoilSuit: "Soil Suit.",
    thRotation: "Rotation",
    thWater: "Water",
    thProfit: "Profit",
    thRisk: "Risk",
    thScore: "Score",
    legSoilSuit: "1. Soil Suitability",
    legSeasonSuit: "2. Season Suitability",
    legRotScore: "3. Rotation Score",
    legWaterScore: "4. Water Score",
    legProfitScore: "5. Profit Score",
    legRiskScore: "6. Risk Score",

    // Dairy & Silage IFS
    dfNoBatches: "0 batches recorded",
    dfAwaitingTest: "Awaiting Test",
    dfRunProbe: "Run screening probe",
    dfNoTestData: "No Test Data",
    dfSensorIdle: "Sensor monitoring idle",
    dfHerdRation: "Calculated from herd ration",
    dfIfsBadge: "🔄 INTEGRATED FARMING SYSTEM (IFS)",
    dfIfsTitle: "Farm Rotation ↔ Dairy Feed & Soil Restorer Loop",
    dfIfsDesc: "Crop rotation produces high-energy fodder biomass. Silage quality screening protects cattle health, maximizing daily milk yield. Cattle produce Farmyard Manure (FYM) that restores Nitrogen and Organic Carbon back to the soil for the next rotation cycle!",
    dfHerdSize: "Dairy Herd Size",
    dfLactatingCows: "Lactating Cows",
    dfRotationFodder: "Rotation Fodder",
    dfSelectFodder: "Select fodder...",
    dfTotalSilage: "Total Silage Produced",
    dfFeedSecurity: "Feed Security Duration",
    dfDailyFeed: "Daily Ration Required",
    dfManureRecycled: "Manure (FYM) Recycled",
    dfFertilizerSaved: "Chemical Fertilizer Saved",
    dfQualityTier: "Silage Quality Tier",
    dfFermentationScore: "Fermentation Index",
    dfSpoilageRisk: "Spoilage & Mold Risk",
    dfMilkImpact: "Herd Milk Impact",
    dfBtnRunTest: "Run Silage Test",
    dfBtnSimulate: "Simulate IoT Batch (DF01/DF02)",
    dfAdvisoryTitle: "🌾 Veterinary & Agronomic Advisory",
    dfLowRisk: "Low Risk ✓",
    dfMediumRisk: "Medium Risk ◉",
    dfHighRisk: "High Risk ⚠",
    dfTonnes: "Tonnes",
    dfMonths: "Months",
    dfKgDay: "kg/day",

    // Additional Dairy & Silage IFS keys
    dairyRefreshBtn: "🔄 Refresh Telemetry",
    dairySubScreening: "Run screening probe",
    dairySubMonitoringIdle: "Sensor monitoring idle",
    dairySubCalcRation: "Calculated from herd ration",
    dairyFarmAreaLabel: "Farm Area (ac)",
    dairyStep1Badge: "Step 1 · Rotation Biomass",
    dairyStep1Title: "🌾 Fodder Harvest",
    dairyStep1Desc: "Ensiled fodder biomass from rotation",
    dairyStep2Badge: "Step 2 · Herd Ration",
    dairyStep2Title: "🐄 Feed Security",
    dairyStep2Desc: "Daily herd silage ration",
    dairyStep3Badge: "Step 3 · Dairy Output",
    dairyStep3Title: "🥛 Milk Yield Boost",
    dairyStep3Desc: "Projected herd milk yield revenue gain",
    dairyStep4Badge: "Step 4 · Soil Restorer",
    dairyStep4Title: "🌱 Recycled Dung (FYM)",
    dairyStep4Desc: "Organic nutrients recycled to soil",
    dairyScreenerTitle: "Rapid Silage Quality Screener",
    dairyScreenerSubtitle: "Supports Manual Data Entry & Live IoT ESP32 Sensor Telemetry",
    dairyHardwareOnline: "Hardware Node: Online",
    dairyTabManual: "Manual Data Entry (கைமுறை பதிவு)",
    dairyTabEsp: "Live ESP32 Telemetry (ESP32 நேரலை)",
    dairyQuickPresets: "Quick Presets:",
    dairyPresetGood: "🟢 Optimal Silage (Good)",
    dairyPresetMod: "🟡 Heating Pit (Moderate)",
    dairyPresetPoor: "🔴 Spoiled / High Moisture (Poor)",
    dairyTargetNode: "Target Silage Node",
    dairyForageCrop: "Forage Crop Type",
    dairyPhSensor: "Silage pH Sensor",
    dairyIdealPh: "Ideal: 3.8 – 4.4",
    dairyMoisture: "Moisture %",
    dairyIdealMoisture: "Ideal: 60% – 70%",
    dairyCoreTemp: "Internal Core Temp (°C)",
    dairyProbeDs18: "Probe DS18B20",
    dairyAmbientTemp: "Ambient Shed Temp (°C)",
    dairyAirBaseline: "Air Baseline",
    dairyColorSensor: "TCS3200 Optical Color Sensor (RGB Spectrum)",
    dairyRed: "Red (R)",
    dairyGreen: "Green (G)",
    dairyBlue: "Blue (B)",
    dairyMouldCheck: "Mould Check",
    dairyBtnSubmit: "Save & Evaluate Manual Batch",
    dairyEspProbeDF01: "ESP32 Silage Probe (DF01)",
    dairyEspOnline: "ONLINE",
    dairyEspBroadcasting: "Broadcasting telemetry live",
    dairySimulateIngestion: "Simulate ESP32 Ingestion:",
    dairySimGood: "⚡ Good Stream",
    dairySimHeating: "⚡ Heating Stream",
    dairySimSour: "⚡ Sour Stream",
    dairyMeterPh: "⚗️ SILAGE pH",
    dairyAwaitingTelemetry: "Awaiting Telemetry",
    dairyMeterMoisture: "💧 MOISTURE",
    dairyIdeal6070: "Ideal 60–70%",
    dairyMeterTemp: "🌡️ CORE TEMP",
    dairyMeterColor: "🎨 TCS3200 RGB",
    dairyOpticalSensor: "Optical Sensor",
    dairyActiveIoTNode: "Active IoT Node",
    dairyForageCropBatch: "Forage Crop Batch",
    dairyBtnCaptureEsp: "Capture & Evaluate Live ESP Reading",
    dairyPort3000Ready: "Port 3000 Ready",
    dairyTestDiagResult: "Test Diagnostics Result",
    dairyVetAdvisory: "🌾 Veterinary & Agronomic Advisory",
    dairyBenchmarksTitle: "Silage Agronomic Benchmarks",
    dairyBenchIdealPh: "Ideal Silage pH:",
    dairyBenchIdealMoist: "Ideal Moisture Range:",
    dairyBenchMaxTemp: "Max Core Temp Rise (ΔT):",
    dairyBenchTempDesc: "< 3.0°C over ambient",
    dairyBenchColor: "Optimal Olive Green RGB:",
    dairyBenchColorDesc: "R:130-150 · G:125-145 · B:40-60",
    dairyBatchLogTitle: "Silage Batch Log & Sensor Telemetry",
    dairyBatchLogSubtitle: "Live historical tests synced from ESP32 Sensor & Camera nodes",
    dairyThSampleId: "Sample ID",
    dairyThNode: "Node",
    dairyThCrop: "Silage Crop",
    dairyThPh: "pH",
    dairyThMoisture: "Moisture",
    dairyThTempRise: "Temp Rise",
    dairyThScore: "Score",
    dairyThTier: "Quality Tier",
    dairyThAction: "Action",
    dairyLoadingTelemetry: "Loading telemetry data…",

    // Dashboard & Status keys
    loadingFarmData: "Loading farm data…",
    loadingWeather: "Loading weather…",
    feelsLikeLoading: "Feels like --°C",
    sensorTable: "Sensor Table",
    fetchingFarmData: "Fetching farm data…",
    idealPpm: "ideal: 300–700 ppm",
    lblProbeDryDesc: "Soil moisture is 0.00% (too dry). Electrochemical probes cannot conduct ions without moisture, leading to 0 TDS/NPK and uncalibrated pH. Moisten your soil sample for true field readings.",
    initSimulation: "Initializing simulation…",
    generatingRec: "Generating recommendation…",

    // Landing & Gateway keys
    landingAgIntel: "AG-INTEL",
    landingSoilRestorer: "UZHAVU KAAPPAAN · Soil Restorer & Enterprise FPO",
    landingStreamingNodes: "420 Nodes Streaming",
    landingSignIn: "🔑 Sign In",
    landingLaunchApp: "🚀 Launch App",
    landingCooperativeMgmt: "Enterprise Cooperative Management",
    landingHeroDesc: "From individual 4.5-acre precision NPK telemetry and restorative crop rotation optimizers to enterprise Farmer Producer Organizations managing 1,250+ growers across 18 regional clusters — unified on a single real-time intelligence platform.",
    landingTelemetryStream: "LIVE HARDWARE TELEMETRY STREAM · ESP32-SOIL-101",
    landingPushPulse: "⚡ Push Telemetry Pulse",
    landingOptimalTier: "● Optimal Tier",
    landingBalancedBuffer: "● Balanced Buffer",
    landingPostHarvest: "● Post-Harvest Restored",
    landingDripSync: "● Drip Synchronized",
    landingNeutralFlora: "● Neutral Active Flora",
    landingActiveFarmers: "Active Farmers",
    landingAcresPrecision: "Acres Under Precision",
    landingAgClusters: "Agronomic Clusters",
    landingIotSensors: "IoT Soil Sensors",
    landingTelemetryUptime: "Telemetry Uptime",
    landingRestorativeCrops: "Restorative Crops",
    landingGatewaysTitle: "Two Specialized Agricultural Gateways",
    landingGatewaysSubtitle: "Whether you're an individual grower striving for soil fertility or an agribusiness executive coordinating an entire regional value chain, UZHAVU KAAPPAAN provides bespoke operational power.",
    landingIndividualHub: "Individual Grower Hub",
    landingFarmerPlatform: "Farmer Platform",
    landingFarmerPlatformDesc: "Precision agronomy designed for local growers. Continuous soil NPK sensing, tailored multi-year restorative crop rotation, GPS micro-zones, and dairy ration balancing.",
    landingFpoPlatform: "Enterprise FPO Command",
    landingFpoPlatformDesc: "End-to-end command center for FPO executives. Manage multi-cluster farm distribution, aggregate soil health maps, dispatch agronomic advisories, and track Mandi market quotas.",

    // Login keys
    loginEdgeActive: "Live Edge IoT Active · Supabase Cloud Synced",
    loginSubtitle: "Next-generation precision agriculture platform connecting individual farmers with enterprise FPOs.",
    loginQuote: "\"UZHAVU KAAPPAAN lowered our 18-cluster chemical fertilizer costs by 28% and boosted restorative legume adoption in the first season.\"",
    loginQuoteAuthor: "— Kovai Farmers Producer Organization (Executive Committee)",
    loginEncryption: "256-Bit Cryptographic Session Encryption",
    loginRbac: "Role-Based Access Control (RBAC Enforced)",
    loginZeroLag: "Live IoT Telemetry Stream (Zero Lag)",
    loginBilingual: "Bilingual Support: English & தமிழ்",
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
    // Mobile Bottom Navigation Labels (Clean & Single-line)
    mbNavDashboard: "முகப்பு",
    mbNavSoil: "மண்",
    mbNavAnalysis: "ஆய்வு",
    mbNavDairy: "பால்வளம்",
    mbNavRotation: "சுழற்சி",
    mbNavB2B: "FPO",
    b2bTitle: "FPO மற்றும் வேளாண் வணிக கட்டுப்பாட்டு மையம்",
    btnExportFPO: "FPO அறிக்கை பதிவிறக்கு",
    b2bNavOverview: "கட்டளை மையம்",
    b2bNavMembers: "உறுப்பினர்கள்",
    b2bNavClusters: "கிளஸ்டர்கள்",
    b2bNavFarms: "பண்ணைகள்",
    b2bNavSoil: "மண் நுண்ணறிவு",
    b2bNavCrops: "பயிர் நுண்ணறிவு",
    b2bNavIoT: "IoT சென்சார்கள்",
    b2bNavIFS: "IFS / பால்வளம்",
    b2bNavAction: "செயல் மையம்",
    b2bNavAdvisories: "அறிவுரைகள்",
    b2bNavReports: "அறிக்கைகள்",
    b2bNavSettings: "நிறுவன அமைப்புகள்",
    b2bSwitchToFPO: "FPO கட்டளை மையத்திற்கு மாறு",
    b2bSwitchToFarmer: "விவசாயி தளத்திற்கு திரும்பு",
    b2bSwitchRole: "பங்கை மாற்று",
    b2bExportReport: "அறிக்கை பதிவிறக்கு",
    b2bPushTelemetry: "நேரடி சென்சார் தரவு அனுப்பு",
    b2bInspectFarm: "பண்ணை & சென்சார் ஆய்வு →",
    b2bAssignTask: "களப் பணியை ஒதுக்கு",
    b2bDispatchAdvisory: "நேரடி அறிவுரை அனுப்பு",
    b2bLiveSyncActive: "● நேரடி ஸ்ட்ரீம் செயலில் உள்ளது",
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

    // Hub & Navigation
    navHome: "முகப்பு & போர்டல் மையம்",
    navPrecisionBadge: "துல்லியம்",
    navIfsBadge: "புதியது · IFS",
    navNewBadge: "புதியது",
    navEnterpriseNode: "நிறுவன மையம்",
    lblFpoMember: "கோவை உழவர் உற்பத்தியாளர் நிறுவனத்தின் உறுப்பினர் (கோவை FPO)",
    lblFpoDetails: "கிளஸ்டர் அளவிலான NPK கண்காணிப்பு · நேரலை IoT சென்சார்கள் · கூட்டு சந்தை விற்பனை",
    btnOpenFpo: "FPO கட்டளை மையத்தைத் திற →",
    lblSensorTable: "நேரலை சென்சார் அளவீடுகள்",
    lblAwaitingSensor: "சென்சார் அளவீட்டிற்காக காத்திருக்கிறது",
    lblLiveProbe: "நேரடி சென்சார் அளவீடு",

    // Soil Analysis & Sensor
    btnManualMode: "கைமுறை உள்ளீடு",
    btnLiveMode: "நேரலை சென்சார்",
    lblSoilTemp: "வெப்பநிலை",
    lblSoilMoisture: "மண் ஈரப்பதம்",
    lblSoilLight: "சூரிய ஒளி / வெளிச்சம்",
    lblSoilTds: "மண் உப்புத்தன்மை (TDS)",
    lblSensorStatus: "சென்சார் நிலை",
    lblReliability: "நம்பகத்தன்மை சரிபார்ப்பு",
    lblPredictorTitle: "நேரடி சென்சார் AI பயிர் கணிப்பான்",
    lblPredictorDesc: "உங்கள் சென்சார் அளவீடுகளின் அடிப்படையில் உகந்த பயிர்களை உடனுக்குடன் கணிக்கிறது",
    lblBtnPredict: "⚡ உகந்த பயிர்களைக் கணி",
    lblProbeWarning: "சென்சார் அளவீட்டு எச்சரிக்கை:",

    // Crop Evaluation Table & Legend
    thRank: "வரிசை",
    thCropCol: "பயிர்",
    thSoilSuit: "மண் பொருத்தம்",
    thRotation: "சுழற்சி",
    thWater: "நீர்",
    thProfit: "லாபம்",
    thRisk: "அபாயம்",
    thScore: "மதிப்பெண்",
    legSoilSuit: "1. மண் பொருத்தம்",
    legSeasonSuit: "2. பருவப் பொருத்தம்",
    legRotScore: "3. சுழற்சி மதிப்பு",
    legWaterScore: "4. நீர் தேவை மதிப்பு",
    legProfitScore: "5. லாப மதிப்பு",
    legRiskScore: "6. அபாயக் குறைவு",

    // Dairy & Silage IFS
    dfNoBatches: "பதிவு செய்யப்பட்ட தொகுதிகள் இல்லை",
    dfAwaitingTest: "பரிசோதனை நிலுவை",
    dfRunProbe: "ஆய்வு செய்ய தொடங்குங்கள்",
    dfNoTestData: "சோதனை தரவு இல்லை",
    dfSensorIdle: "சென்சார் கண்காணிப்பு தயார் நிலையில் உள்ளது",
    dfHerdRation: "கால்நடை தீவன விகிதத்திலிருந்து கணக்கிடப்பட்டது",
    dfIfsBadge: "🔄 ஒருங்கிணைந்த பண்ணை முறை (IFS)",
    dfIfsTitle: "பயிர் சுழற்சி ↔ கால்நடை தீவனம் & மண் வளம் மீட்பு சுழற்சி",
    dfIfsDesc: "பயிர் சுழற்சி அதிக ஆற்றல் கொண்ட பசுந்தீவனத்தை உருவாக்குகிறது. தரமான சைலேஜ் கால்நடைகளின் ஆரோக்கியத்தைப் பாதுகாத்து தினசரி பால் உற்பத்தியை அதிகரிக்கிறது. கால்நடைகளின் தொழுஉரம் அடுத்த பயிர் சுழற்சிக்குத் தேவையான தழைச்சத்து மற்றும் கரிம வளத்தை மீண்டும் மண்ணிற்கு வழங்குகிறது!",
    dfHerdSize: "கால்நடைகளின் எண்ணிக்கை",
    dfLactatingCows: "பால் கறக்கும் மாடுகள்",
    dfRotationFodder: "சுழற்சி தீவனப் பயிர்",
    dfSelectFodder: "தீவனத்தைத் தேர்வு செய்க...",
    dfTotalSilage: "உற்பத்தி செய்யப்படும் மொத்த சைலேஜ்",
    dfFeedSecurity: "தீவன பாதுகாப்பு காலம்",
    dfDailyFeed: "தினசரி தேவைப்படும் தீவனம்",
    dfManureRecycled: "மண் வளம் மீட்கும் தொழுஉரம்",
    dfFertilizerSaved: "சேமிக்கப்பட்ட ரசாயன உரம்",
    dfQualityTier: "சைலேஜ் தர நிலை",
    dfFermentationScore: "நொதித்தல் குறியீடு",
    dfSpoilageRisk: "கெடுதல் & பூஞ்சை அபாயம்",
    dfMilkImpact: "பால் உற்பத்தி தாக்கம்",
    dfBtnRunTest: "சைலேஜ் சோதனை செய்",
    dfBtnSimulate: "IoT மாதிரி தரவு உருவாக்கு",
    dfAdvisoryTitle: "🌾 கால்நடை மருத்துவ & வேளாண் ஆலோசனை",
    dfLowRisk: "குறைந்த அபாயம் ✓",
    dfMediumRisk: "மிதமான அபாயம் ◉",
    dfHighRisk: "அதிக அபாயம் ⚠",
    dfTonnes: "டன்கள்",
    dfMonths: "மாதங்கள்",
    dfKgDay: "கிலோ/நாள்",

    // Additional Dairy & Silage IFS keys
    dairyRefreshBtn: "🔄 தொலைஅளவியல் புதுப்பி",
    dairySubScreening: "பரிசோதனை செய்ய தொடங்கு",
    dairySubMonitoringIdle: "சென்சார் காத்திருப்பு நிலை",
    dairySubCalcRation: "கால்நடை தீவன விகிதத்திலிருந்து கணக்கிடப்பட்டது",
    dairyFarmAreaLabel: "பண்ணை பரப்பளவு (ஏக்கர்)",
    dairyStep1Badge: "படி 1 · பயிர் சுழற்சி தீவன பயிர்",
    dairyStep1Title: "🌾 பசுந்தீவன அறுவடை",
    dairyStep1Desc: "சுழற்சி மூலம் கிடைக்கும் சேமிக்கப்பட்ட தீவன அளவு",
    dairyStep2Badge: "படி 2 · கால்நடை தீவன தேவை",
    dairyStep2Title: "🐄 தீவன பாதுகாப்பு",
    dairyStep2Desc: "தினசரி மந்தைக்கான சைலேஜ் தீவன அளவு",
    dairyStep3Badge: "படி 3 · பால் உற்பத்தி அதிகரிப்பு",
    dairyStep3Title: "🥛 பால் உற்பத்தி ஊக்கம்",
    dairyStep3Desc: "எதிர்பார்க்கப்படும் கூடுதல் பால் உற்பத்தி வருவாய்",
    dairyStep4Badge: "படி 4 · மண் வள மீட்சி",
    dairyStep4Title: "🌱 உரம் மற்றும் சாண மறுசுழற்சி (FYM)",
    dairyStep4Desc: "மண்ணிற்கு மறுசுழற்சி செய்யப்படும் இயற்கை உரம்",
    dairyScreenerTitle: "விரைவு சைலேஜ் தரப் பரிசோதனை",
    dairyScreenerSubtitle: "கைமுறை பதிவு மற்றும் நேரடி IoT ESP32 சென்சார் தொடர்பு ஆதரவு",
    dairyHardwareOnline: "வன்பொருள் முனையம்: நேரலை",
    dairyTabManual: "✍️ கைமுறை பதிவு (Manual)",
    dairyTabEsp: "⚡ ESP32 நேரலை தொலைஅளவியல்",
    dairyQuickPresets: "விரைவு முன்னமைப்புகள்:",
    dairyPresetGood: "🟢 உகந்த சைலேஜ் (நன்று)",
    dairyPresetMod: "🟡 சூடாகும் குழி (மிதமானது)",
    dairyPresetPoor: "🔴 கெட்டுப்போனது / அதிக ஈரம் (மோசம்)",
    dairyTargetNode: "இலக்கு சைலேஜ் முனையம்",
    dairyForageCrop: "தீவனப் பயிர் வகை",
    dairyPhSensor: "சைலேஜ் pH சென்சார்",
    dairyIdealPh: "உகந்தது: 3.8 – 4.4",
    dairyMoisture: "ஈரப்பதம் %",
    dairyIdealMoisture: "உகந்தது: 60% – 70%",
    dairyCoreTemp: "உள் மைய வெப்பநிலை (°C)",
    dairyProbeDs18: "ஆய்வுமுனை DS18B20",
    dairyAmbientTemp: "சுற்றுப்புற வெப்பநிலை (°C)",
    dairyAirBaseline: "காற்று அடிப்படை",
    dairyColorSensor: "TCS3200 ஆப்டிகல் நிற சென்சார் (RGB நிறமாலை)",
    dairyRed: "சிவப்பு (R)",
    dairyGreen: "பச்சை (G)",
    dairyBlue: "நீலம் (B)",
    dairyMouldCheck: "பூஞ்சை ஆய்வு",
    dairyBtnSubmit: "சேமித்து மதிப்பிடுக",
    dairyEspProbeDF01: "ESP32 சைலேஜ் ஆய்வுமுனை (DF01)",
    dairyEspOnline: "நேரலை",
    dairyEspBroadcasting: "நேரலை தரவு பெறப்படுகிறது",
    dairySimulateIngestion: "ESP32 தரவு உருவகப்படுத்துதல்:",
    dairySimGood: "⚡ சிறந்த தரம்",
    dairySimHeating: "⚡ சூடாகும் தரம்",
    dairySimSour: "⚡ புளித்த தரம்",
    dairyMeterPh: "⚗️ சைலேஜ் pH",
    dairyAwaitingTelemetry: "தொலைஅளவியல் காத்திருக்கிறது",
    dairyMeterMoisture: "💧 ஈரப்பதம்",
    dairyIdeal6070: "உகந்தது 60–70%",
    dairyMeterTemp: "🌡️ உள் வெப்பநிலை",
    dairyMeterColor: "🎨 நிற சென்சார் RGB",
    dairyOpticalSensor: "ஆப்டிகல் சென்சார்",
    dairyActiveIoTNode: "செயலில் உள்ள IoT முனையம்",
    dairyForageCropBatch: "தீவனப் பயிர் தொகுதி",
    dairyBtnCaptureEsp: "நேரலை ESP தரவை பெற்று மதிப்பிடு",
    dairyPort3000Ready: "போர்ட் 3000 தயார்",
    dairyTestDiagResult: "பரிசோதனை பகுப்பாய்வு முடிவு",
    dairyVetAdvisory: "🌾 கால்நடை & வேளாண்மை ஆலோசனை",
    dairyBenchmarksTitle: "சைலேஜ் வேளாண் தரநிலைகள்",
    dairyBenchIdealPh: "உகந்த சைலேஜ் pH:",
    dairyBenchIdealMoist: "உகந்த ஈரப்பதம் வரம்பு:",
    dairyBenchMaxTemp: "அதிகபட்ச வெப்பநிலை உயர்வு (ΔT):",
    dairyBenchTempDesc: "சுற்றுப்புறத்தை விட < 3.0°C",
    dairyBenchColor: "உகந்த ஆலிவ் பச்சை RGB:",
    dairyBenchColorDesc: "R:130-150 · G:125-145 · B:40-60",
    dairyBatchLogTitle: "சைலேஜ் தொகுதி பதிவு & சென்சார் தொலைஅளவியல்",
    dairyBatchLogSubtitle: "ESP32 சென்சார் முனையங்களிலிருந்து பெறப்பட்ட வரலாற்றுப் பதிவுகள்",
    dairyThSampleId: "மாதிரி எண்",
    dairyThNode: "முனையம்",
    dairyThCrop: "சைலேஜ் பயிர்",
    dairyThPh: "pH கார அமிலத்தன்மை",
    dairyThMoisture: "ஈரப்பதம்",
    dairyThTempRise: "வெப்பநிலை உயர்வு",
    dairyThScore: "மதிப்பெண்",
    dairyThTier: "தர நிலை",
    dairyThAction: "நடவடிக்கை",
    dairyLoadingTelemetry: "தொலைஅளவியல் தரவு ஏற்றப்படுகிறது…",

    // Dashboard & Status keys
    loadingFarmData: "பண்ணைத் தரவு ஏற்றப்படுகிறது…",
    loadingWeather: "வானிலை ஏற்றப்படுகிறது…",
    feelsLikeLoading: "உணரப்படுவது --°C",
    sensorTable: "சென்சார் அட்டவணை",
    fetchingFarmData: "பண்ணை விவரங்கள் பெறப்படுகின்றன…",
    idealPpm: "உகந்தது: 300–700 ppm",
    lblProbeDryDesc: "மண் ஈரப்பதம் 0.00% (மிகவும் உலர்வாக உள்ளது). ஈரப்பதம் இல்லாமல் எலக்ட்ரோகெமிக்கல் சென்சார் அயனிகளை கடத்த முடியாது, இதனால் TDS/NPK பூஜ்ஜியமாகவும் pH அளவீடு தவறாகவும் இருக்கும். சரியான அளவீட்டிற்கு மண் மாதிரியில் சிறிதளவு நீர் சேர்க்கவும்.",
    initSimulation: "உருவகப்படுத்துதல் தொடங்குகிறது…",
    generatingRec: "பரிந்துரை உருவாக்கப்படுகிறது…",

    // Landing & Gateway keys
    landingAgIntel: "வேளாண் நுண்ணறிவு",
    landingSoilRestorer: "உழவு காப்பான் · மண் வள மீட்பு & FPO கட்டுப்பாட்டு மையம்",
    landingStreamingNodes: "420 சென்சார் முனையங்கள் நேரலையில்",
    landingSignIn: "🔑 உள்நுழைய",
    landingLaunchApp: "🚀 செயலியைத் தொடங்குக",
    landingCooperativeMgmt: "விவசாய உற்பத்தியாளர் கூட்டுறவு மேலாண்மை",
    landingHeroDesc: "தனிநபர் 4.5 ஏக்கர் துல்லிய NPK தொலைஅளவியல் மற்றும் மண் வளம் மீட்கும் பயிர் சுழற்சி முதல், 18 பிராந்திய கிளஸ்டர்களில் 1,250+ விவசாயிகளை நிர்வகிக்கும் FPO நிறுவனங்கள் வரை — அனைத்தும் ஒரே நிகழ்நேர நுண்ணறிவு தளத்தில்.",
    landingTelemetryStream: "நேரடி வன்பொருள் தொலைஅளவியல் ஒளிபரப்பு · ESP32-SOIL-101",
    landingPushPulse: "⚡ தொலைஅளவியல் துடிப்பை அனுப்புக",
    landingOptimalTier: "● உகந்த நிலை",
    landingBalancedBuffer: "● சமநிலையான அளவு",
    landingPostHarvest: "● அறுவடைக்கு பின் மீட்கப்பட்டது",
    landingDripSync: "● சொட்டுநீருடன் ஒருங்கிணைக்கப்பட்டது",
    landingNeutralFlora: "● நடுநிலையான மண் நுண்ணுயிரிகள்",
    landingActiveFarmers: "செயலில் உள்ள விவசாயிகள்",
    landingAcresPrecision: "துல்லிய வேளாண்மை பரப்பு (ஏக்கர்)",
    landingAgClusters: "வேளாண் கிளஸ்டர்கள்",
    landingIotSensors: "IoT மண் சென்சார்கள்",
    landingTelemetryUptime: "நேரலை இயக்க நேரம்",
    landingRestorativeCrops: "மண் வள மீட்பு பயிர்கள்",
    landingGatewaysTitle: "இரு சிறப்பு வேளாண் நுழைவாயில்கள்",
    landingGatewaysSubtitle: "நீங்கள் மண் வளத்தை மேம்படுத்த விரும்பும் தனிப்பட்ட விவசாயியாக இருந்தாலும், அல்லது முழு பிராந்திய மதிப்புச் சங்கிலியை ஒருங்கிணைக்கும் வேளாண்மை நிர்வாகியாக இருந்தாலும், உழவு காப்பான் முழு ஆற்றலை வழங்குகிறது.",
    landingIndividualHub: "தனிநபர் விவசாயி மையம்",
    landingFarmerPlatform: "விவசாயி தளம்",
    landingFarmerPlatformDesc: "உள்ளூர் விவசாயிகளுக்கான துல்லிய வேளாண்மை. தொடர்ச்சியான மண் NPK உணர்தல், பல ஆண்டு மீட்பு சுழற்சி பயிர் பரிந்துரை, ஜிபிஎஸ் குறுக்கு மண்டலங்கள் மற்றும் கால்நடை தீவன சமநிலை.",
    landingFpoPlatform: "நிறுவன FPO கட்டுப்பாட்டு மையம்",
    landingFpoPlatformDesc: "FPO நிர்வாகிகளுக்கான விரிவான கட்டளை மையம். பல கிராம கிளஸ்டர் பண்ணை விநியோகத்தை நிர்வகித்தல், ஒருங்கிணைந்த மண் வள வரைபடம், கள விவசாய ஆலோசனைகளை அனுப்புதல் மற்றும் மண்டி சந்தை ஒதுக்கீட்டைக் கண்காணித்தல்.",

    // Login keys
    loginEdgeActive: "நேரடி எட்ஜ் IoT இயங்குகிறது · கிளவுட் ஒத்திசைவு",
    loginSubtitle: "தனிப்பட்ட விவசாயிகளையும் நிறுவன விவசாய அமைப்புகளையும் (FPO) இணைக்கும் அடுத்த தலைமுறை துல்லிய வேளாண்மை தளம்.",
    loginQuote: "\"உழவு காப்பான் எங்களது 18 கிளஸ்டர்களில் ரசாயன உரச் செலவை 28% குறைத்துள்ளதுடன், முதல் பருவத்திலேயே பயறு வகை மீட்புப் பயிர்களை விவசாயிகள் பயிரிட உதவியது.\"",
    loginQuoteAuthor: "— கோவை விவசாயிகள் உற்பத்தியாளர் நிறுவனம் (நிர்வாகக் குழு)",
    loginEncryption: "256-பிட் பாதுகாப்பு குறியாக்கம்",
    loginRbac: "பங்கு அடிப்படையிலான அணுகல் கட்டுப்பாடு (RBAC)",
    loginZeroLag: "நேரலை IoT தொலைஅளவியல் (தாமதமின்றி)",
    loginBilingual: "இருமொழி ஆதரவு: English & தமிழ்",
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
  "Castor seed": "ஆமணக்கு",
  "Dry chillies": "காய்ந்த மிளகாய்",
  "Guar seed": "கொத்தவரை",
  "Khesari": "கேசரி பருப்பு",
  "Linseed": "ஆளி விதை",
  "Mesta": "புளிச்சக்கீரை நார்",
  "Muskmelon": "முலாம் பழம்",
  "Niger seed": "பேயெள்ளு",
  "Orange": "ஆரஞ்சு",
  "Safflower": "குங்குமப்பூ விதை",
  "Sannhamp": "சணப்பை",
  "Sunn hemp": "சணப்பை",
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

  // Portal switcher button in sidebar footer
  const portalBtn = document.getElementById('btn-portal-switch');
  if (portalBtn) {
    const isB2B = document.body.classList.contains('portal-b2b');
    if (isB2B) {
      portalBtn.innerHTML = `🌾 <span>${t('b2bSwitchToFarmer')}</span>`;
    } else {
      portalBtn.innerHTML = `🏢 <span>${t('b2bSwitchToFPO')}</span>`;
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
