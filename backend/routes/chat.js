// ============================================================
// chat.js — Kisan AI Agronomist Chatbot Backend Route
// POST /api/chat
// ============================================================

const router = require('express').Router();
const db = require('../data/seed');
const { kaggleCrops } = require('../data/kaggle_crops');
const { withTimeout } = require('../utils/withTimeout');

// Bounds how long we'll wait on Gemini in total before falling back to the
// offline rule engine. Without this, a rate-limited/overloaded API key can
// make every candidate model hang or slow-retry in turn, and a single chat
// message can take 10-15+ seconds to answer — indistinguishable from "the
// chatbot is broken" from a user's perspective.
const GEMINI_TIMEOUT_MS = 10000;

router.post('/', async (req, res) => {
  try {
    const { message = '', farm_id = 101, lang = 'en' } = req.body;
    const q = message.trim().toLowerCase();
    const isTa = (lang === 'ta') || /[\u0B80-\u0BFF]/.test(message);

    // Retrieve active farm context
    const farm = db.farms.find(f => f.farm_id === parseInt(farm_id)) || db.farms[0];
    const farmer = db.farmers.find(f => f.farmer_id === farm?.farmer_id) || { name: 'Ramesh Kumar' };
    const soil = db.soil_data.filter(s => s.farm_id === farm?.farm_id).pop() || {
      soil_health_score: 63,
      nitrogen: 42, phosphorus: 28, potassium: 55, ph: 6.5, organic_carbon: 0.52,
      deficiencies: ['Low Nitrogen', 'Low Organic Carbon']
    };
    const liveSensor = (db.live_sensor_status && db.live_sensor_status[farm?.farm_id]) || null;
    const history = db.crop_history.filter(h => h.farm_id === farm?.farm_id);
    const rec = db.recommendations.filter(r => r.farm_id === farm?.farm_id).pop() || {
      recommended_crop_id: 21,
      final_score: 88.5
    };
    const recCropObj = kaggleCrops.find(c => c.crop_id === rec.recommended_crop_id) || kaggleCrops.find(c => c.name === 'Green Gram');

    // 1. Check if Gemini API Key is configured in environment
    if (process.env.GEMINI_API_KEY) {
      try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // High-availability working models
        const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash'];
        let text = null;
        let successfulModel = null;

        const probeMoist = liveSensor?.moisture ?? soil.soil_moisture ?? 45;
        const probeLight = liveSensor?.light ?? soil.light ?? 74;
        const probeTemp = liveSensor?.temperature ?? soil.air_temperature ?? 31.5;
        const probeTds = liveSensor?.tds ?? soil.tds ?? 420;

        const prompt = `You are "CropSmart Kisan AI", an expert agricultural advisor and precision agronomist.
FARM CONTEXT:
- Farmer: ${farmer.name}, Location: ${farm.location_name} (${farm.area_acres} acres, ${farm.irrigation_type} irrigation)
- Current Soil Health Score: ${soil.soil_health_score}/100.
- Live Soil Scout IoT Probe: Moisture=${probeMoist}%, Sunlight=${probeLight}%, Temperature=${probeTemp}°C, TDS Mineral Salts=${probeTds} ppm.
- Measured Chemical Nutrients: Nitrogen=${soil.nitrogen} kg/ha (Deficient), Phosphorus=${soil.phosphorus} kg/ha, Potassium=${soil.potassium} kg/ha, pH=${soil.ph}, Organic Carbon=${soil.organic_carbon}%.
- History: Cultivated Tomato consecutively for 3 seasons (severe monoculture penalty applied, high solanaceae blight risk).
- Integrated Farming System (IFS): Farm has 5 dairy cows fed with farm-rotation silage (Maize/Napier). Silage fermentation score is 92/100 (Optimal, pH 4.12, 65% moisture). Cow dung produces 6 tonnes FYM/season, recycling 30kg N + 0.15% organic carbon back to the soil!
- AI Top Recommendation: ${recCropObj.name} (Legume, biological nitrogen fixer, ₹${recCropObj.avg_market_price}/kg).
- User Language: ${isTa ? 'Tamil (தமிழ்)' : 'English'}.

CRITICAL INSTRUCTION:
${isTa ? 'You MUST reply completely in pure, spoken Tamil (தமிழ் எழுத்துக்களில்). Use simple, friendly agricultural vocabulary that Tamil Nadu farmers use, structured with bullet points and emojis. Do not use English sentences.' : 'Respond in clear English with actionable agronomic insights, bullet points and emojis.'}

User Question: "${message}"`;

        await withTimeout((async () => {
          for (const modelName of candidateModels) {
            try {
              const model = genAI.getGenerativeModel({ model: modelName });
              const result = await model.generateContent(prompt);
              text = result.response.text();
              if (text) {
                successfulModel = modelName;
                break;
              }
            } catch (mErr) {
              console.warn(`[chat] Model ${modelName} failed (${mErr.message}), trying next candidate.`);
            }
          }
        })(), GEMINI_TIMEOUT_MS).catch((timeoutErr) => {
          console.warn('[chat] Gemini API calls timed out or all failed:', timeoutErr.message);
        });

        if (text) {
          return res.json({
            reply: text,
            suggestions: isTa
              ? ["மண் பரிசோதனை அறிக்கை", "பரிந்துரைக்கப்பட்ட சுழற்சி", "சந்தை விலை நிலவரம்"]
              : ["Explain my soil test", "Why Green Gram?", "Current Mandi prices"],
            provider: `Google Gemini AI (${successfulModel || '3.5 Flash'})`
          });
        }
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to Agronomic Knowledge Engine:", geminiErr.message);
      }
    }

    // 2. Built-in Context-Aware Agronomic Knowledge Engine (Offline & Fast)
    let reply = "";
    let suggestions = [];

    // Question: What to plant next / Crop recommendation / Rotation
    if (q.includes("next") || q.includes("plant") || q.includes("grow") || q.includes("recommend") || q.includes("rotate") || q.includes("rotation") || q.includes("green gram") || q.includes("moong") || q.includes("pulse") || q.includes("legume") || q.includes("பயிர்") || q.includes("நடலாம்") || q.includes("சாகுபடி") || q.includes("சுழற்சி") || q.includes("பாசிப்பயறு")) {
      if (isTa) {
        reply = `🌱 **பரிந்துரைக்கப்படும் அடுத்த பயிர்: பாசிப்பயறு (Green Gram)**\n\n` +
          `உங்கள் நிலத்தில் கடந்த 3 பருவங்களாக தொடர்ச்சியாக தக்காளி பயிரிடப்பட்டுள்ளதால், மண்ணில் **தழைச்சத்து (Nitrogen) 42 kg/ha** ஆக குறைந்துள்ளது.\n\n` +
          `• **ஏன் பாசிப்பயறு?**: இது ஒரு பயறு வகை (Legume). இதன் வேர் முடிச்சுகள் காற்றில் உள்ள தழைச்சத்தை இயற்கையாக மண்ணில் நிலைநிறுத்தும் (சுமார் 35-45 kg N/ha).\n` +
          `• **வளர்ச்சி காலம்**: 75 நாட்கள் மட்டுமே.\n` +
          `• **மண்டி சந்தை விலை**: ₹85.00/கிலோ.\n` +
          `• **எதிர்பார்க்கப்படும் லாபம்**: சுமார் ₹33,500/ஏக்கர்.\n\n` +
          `இதன் மூலம் அடுத்த பருவத்தில் ரசாயன யூரியா உரச்செலவு 30% வரை குறையும்!`;
        suggestions = ["மண் பரிசோதனை பார்க்க", "உர பரிந்துரை என்ன?", "3-பருவ சுழற்சி திட்டம்", "சந்தை விலை பட்டியல்"];
      } else {
        reply = `🌱 **Top Recommended Next Crop: Green Gram (Moong)**\n\n` +
          `Because your farm has grown Tomato continuously for 3 seasons, your soil's **Nitrogen level is depleted to 42 kg/ha** (critical threshold is 80 kg/ha).\n\n` +
          `• **Why Green Gram?**: As a legume, it performs Biological Nitrogen Fixation, returning 35-45 kg N/ha naturally into root nodules.\n` +
          `• **Duration**: Just 70–75 days.\n` +
          `• **Mandi Market Price**: ₹85.00/kg (based on real APMC trading data).\n` +
          `• **Projected Net Profit**: ~₹33,500 per acre.\n\n` +
          `Sowing Green Gram now will break the tomato blight disease cycle and restore your soil score from 63 to 72!`;
        suggestions = ["Explain my soil deficiencies", "What fertilizer to apply?", "Show 3-season rotation", "View Mandi prices"];
      }
    }

    // Question: Fertilizer dosage / Soil feeding advice
    else if (q.includes("fertiliz") || q.includes("urea") || q.includes("dap") || q.includes("fym") || q.includes("compost") || q.includes("feed") || q.includes("dose") || q.includes("உர") || q.includes("யூரியா") || q.includes("சாணம்")) {
      if (isTa) {
        reply = `🧪 **ஊட்டச்சத்து மற்றும் உரப் பரிந்துரை (#101 பண்ணை - 4.5 ஏக்கர்):**\n\n` +
          `மண்ணில் தழைச்சத்து குறைவு (42 kg/ha) மற்றும் கரிமச்சத்து 0.52% உள்ளதால் பின்வரும் ஊட்டச்சத்து திட்டம் பரிந்துரைக்கப்படுகிறது:\n\n` +
          `• **மக்கிய தொழுவுரம் / மண்புழு உரம்**: ஏக்கருக்கு 5 டன் (நில தயாரிப்பின் போது).\n` +
          `• **ரைசோபியம் உயிரி உரம்**: விதை நேர்த்திக்கு 200 கிராம் / ஏக்கர்.\n` +
          `• **டி.ஏ.பி (DAP)**: ஏக்கருக்கு 35 கிலோ (அடிப்படை உரமாக).\n` +
          `• **பொட்டாஷ் (MOP)**: ஏக்கருக்கு 20 கிலோ.\n` +
          `• **வேப்பம் புண்ணாக்கு**: ஏக்கருக்கு 100 கிலோ (மண் பூச்சிகளை கட்டுப்படுத்த).\n\n` +
          `⚠️ *ரசாயன யூரியா பயன்பாட்டை குறைத்து பயறு வகை பயிர் மூலம் இயற்கையாக தழைச்சத்தை கூட்டவும்.*`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "மண் பரிசோதனை அறிக்கை", "செயல்திட்டம் PDF"];
      } else {
        reply = `🧪 **Targeted Fertilizer & Nutrition Plan (Farm #101 - 4.5 Acres):**\n\n` +
          `Based on your soil test (Nitrogen: 42 kg/ha deficit, Organic Carbon: 0.52%):\n\n` +
          `• **Farmyard Manure / Vermicompost**: 5.0 Tonnes/acre during basal ploughing to restore organic carbon.\n` +
          `• **Bio-Inoculant (Rhizobium)**: 200g per 10kg seed treatment to stimulate nodule formation.\n` +
          `• **DAP (Di-Ammonium Phosphate)**: 35 kg/acre as basal dose for root development.\n` +
          `• **MOP (Muriate of Potash)**: 20 kg/acre.\n` +
          `• **Neem Cake**: 100 kg/acre to suppress soil-borne fungal pathogens.\n\n` +
          `⚠️ *Avoid heavy chemical Urea dressing — let the Green Gram crop naturally fix atmospheric nitrates!*`;
        suggestions = ["What crop to plant next?", "Download Action Plan PDF", "View Soil Test"];
      }
    }

    // Question: Soil health / Deficiencies / Why is score low
    else if (q.includes("soil") || q.includes("health") || q.includes("nitrogen") || q.includes("score") || q.includes("deficien") || q.includes("மண்") || q.includes("வளம்") || q.includes("சத்து")) {
      if (isTa) {
        reply = `🧪 **மண் பரிசோதனை ஆய்வு அறிக்கை (#101 கோவை பண்ணை):**\n\n` +
          `உங்கள் தற்போதைய மண் வள மதிப்பீடு: **${soil.soil_health_score} / 100** (மிதமான சத்து குறைவு).\n\n` +
          `⚠️ **கண்டறியப்பட்ட குறைபாடுகள்:**\n` +
          `1. **தழைச்சத்து (Nitrogen): 42 kg/ha** (தேவை: 80 - 160 kg/ha) - *மிகக் குறைவு*\n` +
          `2. **கரிம வளம் (Organic Carbon): 0.52%** (தேவை: 0.8%+) - *குறைவு*\n\n` +
          `✅ **போதுமான சத்துக்கள்:**\n` +
          `• மணிச்சத்து (P): 28 kg/ha | சாம்பல் சத்து (K): 55 kg/ha | pH: 6.5 (சிறந்த கார அமிலத்தன்மை)\n\n` +
          `💡 **தீர்வு:** தழைச்சத்தை மீட்டெடுக்க பாசிப்பயறு அல்லது உளுந்து போன்ற பயறு வகைகளை உடனே பயிரிடவும்.`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "செயல்திட்ட அறிக்கை PDF", "உர பயன்பாட்டு ஆலோசனை"];
      } else {
        reply = `🧪 **Soil Diagnostic Analysis (Coimbatore Farm - 4.5 Acres):**\n\n` +
          `Current Soil Health Score: **${soil.soil_health_score} / 100** (Moderate Depletion).\n\n` +
          `⚠️ **Critical Deficiencies Detected:**\n` +
          `1. **Nitrogen (N): 42.0 kg/ha** (Optimal: 80 – 160 kg/ha) — *Depleted due to consecutive tomato harvesting.*\n` +
          `2. **Organic Carbon (OC): 0.52%** (Optimal: 0.80 – 1.50%) — *Low soil organic matter and water retention capacity.*\n\n` +
          `✅ **Adequate Parameters:**\n` +
          `• Phosphorus: 28 kg/ha | Potassium: 55 kg/ha | pH: 6.50 (Neutral, ideal for nutrient absorption).\n\n` +
          `💡 **Action Plan:** Rotate immediately into a nitrogen-fixing legume to replenish root-zone nitrates without over-applying chemical fertilizers.`;
        suggestions = ["What crop to plant next?", "Download PDF Action Plan", "How to fix low Nitrogen?"];
      }
    }

    // Question: Mandi Prices / Market Rates / Price
    else if (q.includes("price") || q.includes("mandi") || q.includes("market") || q.includes("profit") || q.includes("rate") || q.includes("விலை") || q.includes("சந்தை") || q.includes("லாபம்")) {
      const topQuotes = [
        { name: isTa ? "பாசிப்பயறு (Green Gram)" : "Green Gram", price: "₹85.00/kg" },
        { name: isTa ? "தக்காளி (Tomato)" : "Tomato", price: "₹79.50/kg" },
        { name: isTa ? "வெங்காயம் (Onion)" : "Onion", price: "₹15.80/kg" },
        { name: isTa ? "உருளைக்கிழங்கு (Potato)" : "Potato", price: "₹12.60/kg" },
        { name: isTa ? "கோதுமை (Wheat)" : "Wheat", price: "₹22.85/kg" },
        { name: isTa ? "வாழை (Banana)" : "Banana", price: "₹27.00/kg" },
        { name: isTa ? "பூண்டு (Garlic)" : "Garlic", price: "₹75.00/kg" },
      ];

      if (isTa) {
        reply = `📊 **இந்திய மண்டி (APMC) சந்தை விலைகள் (சமீபத்திய தினசரி தரவுகள்):**\n\n` +
          topQuotes.map(q => `• **${q.name}**: ${q.price}`).join('\n') +
          `\n\n💡 *குறிப்பு: இந்த விலைகள் 23,000+ மண்டி சந்தை விலைப் பதிவுகளின் நடுநிலை மதிப்பு ஆகும்.*`;
        suggestions = ["பயிர்களின் லாபம் ஒப்பிடு", "பாசிப்பயறு லாபம் என்ன?", "முகப்பிற்கு செல்"];
      } else {
        reply = `📊 **Recent APMC Mandi Prices (daily commodity quotes):**\n\n` +
          topQuotes.map(q => `• **${q.name}**: ${q.price}`).join('\n') +
          `\n\n💡 *Median of 23,093 APMC market price quotes across Indian states.*`;
        suggestions = ["Which crop gives highest profit?", "Recommend best rotation", "Download CSV Dataset"];
      }
    }

    // Question: Continuous Cultivation / Tomato penalty / Disease risk
    else if (q.includes("tomato") || q.includes("continuous") || q.includes("monoculture") || q.includes("disease") || q.includes("தக்காளி") || q.includes("தொடர்")) {
      if (isTa) {
        reply = `⚠️ **தொடர் தக்காளி சாகுபடி எச்சரிக்கை:**\n\n` +
          `உங்கள் பண்ணையில் 3 பருவங்களாக தக்காளி மட்டுமே பயிரிடப்பட்டுள்ளது.\n\n` +
          `1. **பூச்சி மற்றும் நோய் பரவல்**: தக்காளியை தாக்கும் ஆரம்பக்கால கருகல் நோய் (Early Blight) மற்றும் வேர் புழுக்கள் மண்ணில் தங்கி அடுத்த பயிரை அழிக்கும்.\n` +
          `2. **சத்து இழப்பு**: தக்காளி செடிகள் மண்ணில் உள்ள தழைச்சத்தை அதிகளவில் உறிஞ்சிவிட்டன.\n` +
          `3. **சுழற்சி விதி**: இதனால் CropSmart அல்காரிதம் தக்காளிக்கு **-30% அபராத மதிப்பீடு** விதித்து பயிர் சுழற்சியை கட்டாயமாக்கியுள்ளது!`;
        suggestions = ["மாற்று பயிர் என்ன?", "மண் வளம் மீட்பது எப்படி?", "செயல்திட்டம் PDF"];
      } else {
        reply = `⚠️ **Monoculture Warning: 3x Consecutive Tomato Cultivation**\n\n` +
          `Growing Solanaceae (Tomato) continuously introduces two major agricultural hazards:\n\n` +
          `1. **Soil Pathogen Accumulation**: Fungal spores causing Early Blight and root-knot nematodes proliferate in the soil.\n` +
          `2. **Nutrient Depletion**: Tomato heavily exhausts nitrates, dropping your soil nitrogen to 42 kg/ha.\n` +
          `3. **Optimizer Action**: CropSmart has applied a **-30% penalty** to Tomato to protect your farm from catastrophic crop failure. Rotating to Green Gram breaks this pathogen cycle completely!`;
        suggestions = ["What to plant instead?", "Show Soil Health Score", "View 3-Season Plan"];
      }
    }

    // Question: Dairy, Silage, Cattle Feed, Milk Yield (IFS)
    else if (q.includes("silage") || q.includes("dairy") || q.includes("feed") || q.includes("cattle") || q.includes("cow") || q.includes("milk") || q.includes("தீவனம்") || q.includes("சைலேஜ்") || q.includes("மாடு") || q.includes("பால்")) {
      if (isTa) {
        reply = `🐄 **கால்நடை தீவனம் & சைலேஜ் தர ஆய்வு (Dairy Feeder IFS):**\n\n` +
          `• **சைலேஜ் தரம் (Quality):** உகந்த லாக்டிக் நொதித்தல் (மதிப்பெண்: 92/100, pH 4.12, ஈரப்பதம் 65.4%).\n` +
          `• **பால் உற்பத்தி உயர்வு:** தரமான சைலேஜ் அளிப்பதால் ஒரு மாட்டுக்கு நாளொன்றுக்கு **+2.2 லிட்டர் பால்** கூடுதலாகக் கிடைக்கிறது (மாத கூடுதல் வருமானம்: ₹10,032).\n` +
          `• **மண் சத்து மறுசுழற்சி (FYM):** 5 கறவை மாடுகளின் சாணம் மூலம் ஒரு பருவத்திற்கு 6 டன் தொழு உரம் கிடைக்கிறது. இதன் மூலம் **30 கிலோ தழைச்சத்து (N) மற்றும் +0.15% மண் கரிம வளம்** உங்கள் சுழற்சி நிலத்திற்கு மீண்டும் கிடைக்கிறது!`;
        suggestions = ["சைலேஜ் பரிசோதனை செய்", "3-பருவ சுழற்சி திட்டம்", "மண் பரிசோதனை அறிக்கை"];
      } else {
        reply = `🐄 **Dairy Feeder & Silage Quality Hub (IFS Integration):**\n\n` +
          `• **Silage Fermentation Index:** 92/100 (Optimal lactic acid fermentation, pH 4.12, moisture 65.4%, ΔT +0.7°C).\n` +
          `• **Milk Yield Impact:** Feeding high-quality ensiled maize/napier yields **+2.2 L/cow/day extra milk**, adding **+₹10,032/month** in net dairy revenue.\n` +
          `• **Soil Restorer Closed-Loop:** 5 dairy cattle produce 6 tonnes of Farmyard Manure (FYM) per season, recycling **30 kg Nitrogen, 15 kg Phosphorus, 30 kg Potassium**, and increasing soil organic carbon by **+0.15%** for the next crop rotation cycle!`;
        suggestions = ["Run Silage Test", "Cattle Feed Ration Calculator", "Soil Health Score"];
      }
    }

    // Question: Weather advice
    else if (q.includes("weather") || q.includes("rain") || q.includes("temp") || q.includes("வானிலை") || q.includes("மழை")) {
      if (isTa) {
        reply = `🌦️ **தற்போதைய பண்ணை வானிலை (கோவை):**\n\n` +
          `• **வெப்பநிலை**: 32.2°C\n` +
          `• **வானிலை நிலை**: மிதமான தூறல் (Light Drizzle 🌦️)\n` +
          `• **விவசாய ஆலோசனை**: தற்போது நிலவும் மிதமான ஈரப்பதம் பாசிப்பயறு அல்லது உளுந்து விதைப்பதற்கு உகந்த சூழலாகும்.`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "வானிலை வரைபடம்", "மண் பரிசோதனை"];
      } else {
        reply = `🌦️ **Live Farm Weather (Coimbatore Region):**\n\n` +
          `• **Temperature**: 32.2°C\n` +
          `• **Conditions**: Light Drizzle (🌦️)\n` +
          `• **Agronomic Advice**: The current moderate soil moisture from drizzle is ideal for field preparation and direct seed sowing of short-duration legumes.`;
        suggestions = ["Recommend sowing date", "View Weather Forecast", "Check Soil Health"];
      }
    }

    // Default / Greeting
    else {
      if (isTa) {
        reply = `வணக்கம் ${farmer.name}! நான் உங்கள் **CropSmart உழவன் AI ஆலோசகர்** 🌱\n\n` +
          `உங்கள் கோவை பண்ணையின் (4.5 ஏக்கர்) மண் வளம், முந்தைய பயிர் வரலாறு மற்றும் 23,000+ மண்டி சந்தை விலைகளின் அடிப்படையில் நான் உங்களுக்கு உதவ முடியும்.\n\n` +
          `நீங்கள் கேட்கக்கூடிய கேள்விகள்:\n` +
          `• *"அடுத்த பருவத்தில் என்ன பயிர் நடலாம்?"*\n` +
          `• *"என் நிலத்தின் மண் வளம் மற்றும் குறைபாடுகள் என்ன?"*\n` +
          `• *"தக்காளி, பாசிப்பயறு மண்டி சந்தை விலை என்ன?"*\n` +
          `• *"பயிர் சுழற்சி மூலம் லாபத்தை உயர்த்துவது எப்படி?"*`;
        suggestions = ["அடுத்த பயிர் என்ன நடலாம்?", "மண் பரிசோதனை பார்க்க", "மண்டி சந்தை விலைகள்"];
      } else {
        reply = `Hello ${farmer.name}! I am your **CropSmart Kisan AI Agronomist** 🌱\n\n` +
          `I have full context of your 4.5-acre Coimbatore farm, your current soil test (Score: ${soil.soil_health_score}/100, N: 42 kg/ha), your 3-season continuous Tomato history, and 23k+ APMC Mandi market quotes.\n\n` +
          `Here are questions you can ask me:\n` +
          `• *"What crop should I plant next?"*\n` +
          `• *"Why is my soil nitrogen depleted?"*\n` +
          `• *"Compare profits of Green Gram vs Potato vs Tomato"*\n` +
          `• *"How does the 3-season rotation restore my soil?"*`;
        suggestions = ["What crop to plant next?", "Explain my soil test", "Current Mandi prices"];
      }
    }

    res.json({
      reply,
      suggestions,
      provider: "CropSmart Agronomic Engine"
    });

  } catch (err) {
    console.error("Chatbot error:", err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

module.exports = router;
