// ============================================================
//  orgs.js — B2B Multi-Tenant Organization & FPO Command Center
//  Supports FPOs, Agribusinesses, Dairy Cooperatives & Federations
//  Full Enterprise Hierarchy: Org -> Cluster -> Farm -> Farmer -> Fields & IoT
// ============================================================

const express = require('express');
const router = express.Router();
const { farmers, farms, soil_data, crop_history, crops, live_sensor_status } = require('../data/seed');
const dairyFeedRouter = require('./dairyFeed');

// Helper: Get latest crop name for a farm
function getFarmLatestCrop(farmId) {
  const farmHistories = crop_history.filter(h => h.farm_id === farmId);
  if (farmHistories.length > 0) {
    const latest = farmHistories[farmHistories.length - 1];
    const cropObj = crops.find(c => c.crop_id === latest.crop_id);
    if (cropObj) return cropObj.name;
  }
  const defaults = { 101: 'Tomato', 102: 'Coconut', 103: 'Groundnut', 104: 'Cotton', 105: 'Green Gram', 106: 'Sugarcane', 107: 'Tomato', 108: 'Sorghum', 109: 'Green Gram', 110: 'Sunflower', 111: 'Maize' };
  return defaults[farmId] || 'Maize';
}

// Helper: Get latest soil test for a farm
function getFarmLatestSoil(farmId) {
  const readings = soil_data.filter(s => s.farm_id === farmId);
  return readings.length > 0 ? readings[readings.length - 1] : null;
}

// ── Master Organization Templates ────────────────────────────
const orgTemplates = [
  {
    org_id: 1,
    name: 'Kovai Farmer Producer Organization (Kovai FPO)',
    short_name: 'Kovai FPO',
    type: 'FPO',
    region: 'Coimbatore Region, Tamil Nadu',
    season: 'Kharif',
    admin_name: 'Dr. K. Swaminathan',
    admin_title: 'CEO & Agricultural Director',
    admin_email: 'admin@kovaifpo.org',
    admin_phone: '+91 94431 28900',
    headquarters: 'Agronomy Complex, Thadagam Road, Coimbatore - 641013',
    reg_number: 'TN-CBE-FPO-2022-0941',
    founded_year: 2021
  },
  {
    org_id: 2,
    name: 'Aavin Dairy Cooperative Federation',
    short_name: 'Aavin Dairy Coop',
    type: 'Dairy Cooperative',
    region: 'Western Tamil Nadu Milk Shed',
    season: 'Kharif',
    admin_name: 'S. Rajendran',
    admin_title: 'General Manager - Livestock & Fodder',
    admin_email: 'coop@aavin-dairy.org',
    admin_phone: '+91 98421 77654',
    headquarters: 'Cooperative Milk Producers Union, Tiruppur - 641602',
    reg_number: 'TN-MILK-COOP-8821',
    founded_year: 1982
  },
  {
    org_id: 3,
    name: 'Kisan Shakti Agribusiness Consortium',
    short_name: 'Kisan Shakti Agri',
    type: 'Agribusiness',
    region: 'All-India Agri Network',
    season: 'Kharif',
    admin_name: 'Meera Iyer',
    admin_title: 'VP of Procurement & Field Supply',
    admin_email: 'partner@kisanshakticonsortium.in',
    admin_phone: '+91 98110 55432',
    headquarters: 'Agri Innovation Hub, Erode - 638001',
    reg_number: 'CIN-U01100TZ2023PTC039912',
    founded_year: 2023
  }
];

// ── Clusters Data by Organization ────────────────────────────
const orgClusters = {
  1: [
    { cluster_id: 'C-01', name: 'Pollachi Cluster', location: 'Pollachi North & South, Coimbatore', farms: 210, farmers: 210, acreage: 980, main_crops: ['Coconut', 'Maize', 'Groundnut'], soil_score: 82, iot_online: 74, iot_total: 75, alerts: 2, officer: 'Anand Kumar' },
    { cluster_id: 'C-02', name: 'Sulur Cluster', location: 'Sulur & Palladam Border, Coimbatore', farms: 180, farmers: 180, acreage: 720, main_crops: ['Cotton', 'Pulses', 'Maize'], soil_score: 67, iot_online: 60, iot_total: 65, alerts: 8, officer: 'Anand Kumar' },
    { cluster_id: 'C-03', name: 'Annur Cluster', location: 'Annur Semi-Arid Belt, Coimbatore', farms: 165, farmers: 165, acreage: 690, main_crops: ['Sunflower', 'Tomato', 'Maize'], soil_score: 79, iot_online: 58, iot_total: 60, alerts: 3, officer: 'V. Sundaram' },
    { cluster_id: 'C-04', name: 'Thondamuthur Cluster', location: 'Western Ghats Foothills, Coimbatore', farms: 120, farmers: 120, acreage: 540, main_crops: ['Sugarcane', 'Tomato', 'Banana'], soil_score: 54, iot_online: 39, iot_total: 45, alerts: 6, officer: 'Revathi Natarajan' },
    { cluster_id: 'C-05', name: 'Kinathukadavu Cluster', location: 'Kinathukadavu Red Soil Zone', farms: 140, farmers: 140, acreage: 610, main_crops: ['Sorghum', 'Pulses', 'Groundnut'], soil_score: 73, iot_online: 48, iot_total: 50, alerts: 1, officer: 'V. Sundaram' },
    { cluster_id: 'C-06', name: 'Madukkarai Cluster', location: 'Madukkarai Limestone & Agro Belt', farms: 110, farmers: 110, acreage: 490, main_crops: ['Millets', 'Green Gram', 'Maize'], soil_score: 65, iot_online: 38, iot_total: 40, alerts: 2, officer: 'Revathi Natarajan' },
    { cluster_id: 'C-07', name: 'Karamadai Cluster', location: 'Karamadai & Mettupalayam Valley', farms: 125, farmers: 125, acreage: 560, main_crops: ['Tomato', 'Turmeric', 'Coconut'], soil_score: 71, iot_online: 42, iot_total: 45, alerts: 1, officer: 'Anand Kumar' },
    { cluster_id: 'C-08', name: 'Perur Cluster', location: 'Noyyal Basin Agro Belt', farms: 130, farmers: 130, acreage: 830, main_crops: ['Paddy', 'Sugarcane', 'Vegetables'], soil_score: 62, iot_online: 32, iot_total: 40, alerts: 1, officer: 'Revathi Natarajan' }
  ],
  2: [
    { cluster_id: 'C-AAV-01', name: 'Tiruppur Milk Shed Cluster', location: 'Kangeyam & Dharapuram Basin', farms: 190, farmers: 195, acreage: 760, main_crops: ['Maize', 'Sorghum', 'Cowpea'], soil_score: 78, iot_online: 62, iot_total: 65, alerts: 1, officer: 'K. Balu' },
    { cluster_id: 'C-AAV-02', name: 'Pollachi Dairy Cattle Belt', location: 'Anamalai & Pollachi Foothills', farms: 155, farmers: 160, acreage: 610, main_crops: ['Maize', 'Soybean', 'Hybrid Napier'], soil_score: 75, iot_online: 48, iot_total: 50, alerts: 2, officer: 'M. Palani' },
    { cluster_id: 'C-AAV-03', name: 'Bhavani River Silage Cluster', location: 'Bhavani River Irrigation Command', farms: 115, farmers: 125, acreage: 480, main_crops: ['Maize', 'Green Gram', 'Fodder Beet'], soil_score: 80, iot_online: 32, iot_total: 35, alerts: 0, officer: 'K. Balu' }
  ],
  3: [
    { cluster_id: 'C-AGR-01', name: 'Coimbatore North Agro Cluster', location: 'Mettupalayam & Sirumugai Basin', farms: 320, farmers: 340, acreage: 1540, main_crops: ['Tomato', 'Cotton', 'Chillies'], soil_score: 68, iot_online: 110, iot_total: 120, alerts: 5, officer: 'G. Natarajan' },
    { cluster_id: 'C-AGR-02', name: 'Erode Processing Outgrowers', location: 'Bhavanisagar & Perundurai Command', farms: 280, farmers: 290, acreage: 1380, main_crops: ['Sugarcane', 'Turmeric', 'Tapioca'], soil_score: 70, iot_online: 95, iot_total: 100, alerts: 3, officer: 'S. Loganathan' },
    { cluster_id: 'C-AGR-03', name: 'Salem Spices & Sunflower Zone', location: 'Sankari & Omalur Plain', farms: 220, farmers: 230, acreage: 1020, main_crops: ['Sunflower', 'Groundnut', 'Soybean'], soil_score: 65, iot_online: 70, iot_total: 80, alerts: 4, officer: 'K. Venkatesh' }
  ]
};

// ── Officers / Staff Roster ──────────────────────────────────
const orgOfficers = {
  1: [
    { officer_id: 'OFF-01', name: 'Dr. K. Swaminathan', role: 'fpo_admin', role_title: 'FPO Administrator / CEO', phone: '+91 94431 28900', email: 'admin@kovaifpo.org', assigned_clusters: ['All 18 Clusters'], status: 'Active', experience: '18 yrs agronomy' },
    { officer_id: 'OFF-02', name: 'P. Selvan', role: 'fpo_manager', role_title: 'FPO Operations Manager', phone: '+91 98422 33445', email: 'manager@kovaifpo.org', assigned_clusters: ['All Clusters'], status: 'Active', experience: '12 yrs FPO management' },
    { officer_id: 'OFF-03', name: 'Anand Kumar', role: 'field_officer', role_title: 'Senior Field Officer', phone: '+91 97890 12456', email: 'officer.anand@kovaifpo.org', assigned_clusters: ['Pollachi Cluster', 'Sulur Cluster', 'Karamadai Cluster'], status: 'Active', experience: '7 yrs field extension' },
    { officer_id: 'OFF-04', name: 'Revathi Natarajan', role: 'field_officer', role_title: 'Field Operations Officer', phone: '+91 99443 32211', email: 'officer.revathi@kovaifpo.org', assigned_clusters: ['Thondamuthur Cluster', 'Madukkarai Cluster', 'Perur Cluster'], status: 'Active', experience: '5 yrs soil testing' },
    { officer_id: 'OFF-05', name: 'V. Sundaram', role: 'field_officer', role_title: 'Field Officer', phone: '+91 97890 12345', email: 'officer.sundaram@kovaifpo.org', assigned_clusters: ['Annur Cluster', 'Kinathukadavu Cluster'], status: 'Active', experience: '6 yrs crop inspection' },
    { officer_id: 'OFF-06', name: 'Dr. Priya Balan', role: 'agronomist', role_title: 'Lead Agronomist & Soil Specialist', phone: '+91 99441 12233', email: 'agronomy.priya@kovaifpo.org', assigned_clusters: ['Organization Wide'], status: 'Active', experience: '14 yrs TNAU research' },
    { officer_id: 'OFF-07', name: 'Karthik Raja', role: 'iot_technician', role_title: 'IoT & Telemetry Systems Engineer', phone: '+91 96541 23890', email: 'iot.karthik@kovaifpo.org', assigned_clusters: ['Hardware & Gateway Fleet'], status: 'Active', experience: '8 yrs embedded & LoRaWAN' }
  ],
  2: [
    { officer_id: 'OFF-AAV-01', name: 'S. Rajendran', role: 'fpo_admin', role_title: 'General Manager', phone: '+91 98421 77654', email: 'coop@aavin-dairy.org', assigned_clusters: ['All Milk Sheds'], status: 'Active' },
    { officer_id: 'OFF-AAV-02', name: 'K. Balu', role: 'field_officer', role_title: 'Livestock Field Officer', phone: '+91 94432 11223', email: 'balu@aavin-dairy.org', assigned_clusters: ['Tiruppur Milk Shed Cluster', 'Bhavani River Silage Cluster'], status: 'Active' },
    { officer_id: 'OFF-AAV-03', name: 'M. Palani', role: 'field_officer', role_title: 'Dairy Silage Field Supervisor', phone: '+91 98425 66778', email: 'palani@aavin-dairy.org', assigned_clusters: ['Pollachi Dairy Cattle Belt'], status: 'Active' }
  ],
  3: [
    { officer_id: 'OFF-AGR-01', name: 'Meera Iyer', role: 'fpo_admin', role_title: 'VP Operations', phone: '+91 98110 55432', email: 'partner@kisanshakticonsortium.in', assigned_clusters: ['Consortium Wide'], status: 'Active' },
    { officer_id: 'OFF-AGR-02', name: 'G. Natarajan', role: 'field_officer', role_title: 'North Cluster Officer', phone: '+91 94431 99887', email: 'natarajan@kisanshakticonsortium.in', assigned_clusters: ['Coimbatore North Agro Cluster'], status: 'Active' },
    { officer_id: 'OFF-AGR-03', name: 'S. Loganathan', role: 'field_officer', role_title: 'Processing Supply Officer', phone: '+91 98423 44556', email: 'loganathan@kisanshakticonsortium.in', assigned_clusters: ['Erode Processing Outgrowers'], status: 'Active' }
  ]
};

// ── In-Memory Organization Advisories & Tasks State ─────────
const orgAdvisories = [
  {
    advisory_id: 'ADV-101',
    org_id: 1,
    title: 'Urgent: Low Nitrogen Remediation Directive',
    category: 'Nutrient Deficiency',
    target_type: 'Cluster',
    target_name: 'Sulur Cluster (24 Affected Farms)',
    affected_count: 24,
    channels: ['In-App Notification', 'SMS', 'WhatsApp'],
    created_at: '2026-10-02T10:30:00Z',
    author: 'Dr. Priya Balan (Agronomist)',
    status: 'Delivered',
    read_count: 21,
    acknowledged_count: 18,
    message: 'Soil telemetry indicates critical nitrogen depletion (<45 kg/ha). Apply split dose urea (35 kg/acre) or deploy Green Gram / Cowpea restorative cover crop ahead of next irrigation.',
    priority: 'Critical'
  },
  {
    advisory_id: 'ADV-102',
    org_id: 1,
    title: 'Kharif Harvest Window & Aggregation Center Slots',
    category: 'Harvest & Mandi',
    target_type: 'Crop Group',
    target_name: 'Maize Outgrowers (1,200 Acres)',
    affected_count: 210,
    channels: ['In-App Notification', 'SMS', 'WhatsApp', 'Push Notification'],
    created_at: '2026-09-28T14:15:00Z',
    author: 'P. Selvan (Operations Manager)',
    status: 'Delivered',
    read_count: 194,
    acknowledged_count: 172,
    message: 'Kovai FPO Mandi aggregation center opens Oct 15. Moisture testing slots now active. Please book transport vehicle batch with your assigned field officer.',
    priority: 'Normal'
  },
  {
    advisory_id: 'ADV-103',
    org_id: 1,
    title: 'Silage Fermentation Probe Temperature Warning',
    category: 'Livestock & Feed',
    target_type: 'Selected Farms',
    target_name: 'Bunk Silage Hubs (Pollachi & Sulur)',
    affected_count: 7,
    channels: ['SMS', 'In-App Notification'],
    created_at: '2026-10-01T08:00:00Z',
    author: 'Dr. K. Swaminathan (CEO)',
    status: 'Action In Progress',
    read_count: 7,
    acknowledged_count: 7,
    message: 'IoT Silage Probe DF03 core temperature reading +3.2°C higher than optimal. Re-compact bunk pit edge and inspect polyethylene oxygen barrier seal immediately.',
    priority: 'Warning'
  }
];

const orgTasks = [
  {
    task_id: 'TSK-201',
    org_id: 1,
    farm_id: 104,
    farmer_name: 'V. Sundaram',
    cluster: 'Sulur Cluster',
    type: 'Field Inspection',
    title: 'Inspect Low Nitrogen & Leaf Yellowing on Farm #104',
    assigned_to: 'Anand Kumar',
    due_date: '2026-10-05',
    priority: 'High',
    status: 'In Progress',
    notes: 'Verify soil sensor reading with handheld NPK kit and advise on bio-fertilizer.'
  },
  {
    task_id: 'TSK-202',
    org_id: 1,
    farm_id: 106,
    farmer_name: 'K. Chinnasamy',
    cluster: 'Thondamuthur Cluster',
    type: 'Soil Sampling',
    title: 'Validate Acidic Soil pH & Recommend Lime Application',
    assigned_to: 'Revathi Natarajan',
    due_date: '2026-10-06',
    priority: 'High',
    status: 'Scheduled',
    notes: 'pH reading 5.4 in cane zone; check calcium carbonate requirement.'
  },
  {
    task_id: 'TSK-203',
    org_id: 1,
    farm_id: 108,
    farmer_name: 'Senthil Velan',
    cluster: 'Kinathukadavu Cluster',
    type: 'IoT Maintenance',
    title: 'Battery replacement on RS485 Gateway #GW-09',
    assigned_to: 'Karthik Raja',
    due_date: '2026-10-04',
    priority: 'Medium',
    status: 'Pending',
    notes: 'Device battery at 18%, telemetry intermittent.'
  }
];

// ── In-Memory Organization Action Alerts ─────────────────────
const orgAlerts = [
  {
    alert_id: 'ALT-01',
    level: 'CRITICAL',
    title: '24 farms have low nitrogen (<45 kg/ha)',
    affected_count: 24,
    cluster: 'Sulur Cluster',
    category: 'Soil Deficiency',
    recommended_action: 'Broadcast targeted N-fertilizer / pulse rotation advisory to Sulur Cluster',
    affected_farm_ids: [104, 105, 114, 115, 118, 120, 122, 124, 126, 128, 130, 132, 134, 136, 138, 140, 142, 144, 146, 148, 150, 152, 154, 156],
    created_at: '2026-10-02T08:30:00Z',
    status: 'Active'
  },
  {
    alert_id: 'ALT-02',
    level: 'WARNING',
    title: '7 IoT devices offline for >24 hours',
    affected_count: 7,
    cluster: 'Thondamuthur & Sulur',
    category: 'Hardware & Telemetry',
    recommended_action: 'Dispatch IoT Technician Karthik Raja for battery check & antenna alignment',
    affected_farm_ids: [106, 108, 112, 119, 125, 131, 145],
    created_at: '2026-10-02T12:00:00Z',
    status: 'Active'
  },
  {
    alert_id: 'ALT-03',
    level: 'ATTENTION',
    title: '18 farms require crop rotation review (Monoculture risk)',
    affected_count: 18,
    cluster: 'Pollachi & Annur',
    category: 'Agronomic Practice',
    recommended_action: 'Enforce 3-season restorative rotation plan with cowpea/legume cycle',
    affected_farm_ids: [101, 102, 107, 110, 116, 121, 127, 133, 137, 141, 147, 151, 155, 159, 163, 167, 171, 175],
    created_at: '2026-10-01T15:00:00Z',
    status: 'Active'
  },
  {
    alert_id: 'ALT-04',
    level: 'CRITICAL',
    title: 'Soil pH below 5.5 (Acidic Stress) on 12 sugarcane plots',
    affected_count: 12,
    cluster: 'Thondamuthur Cluster',
    category: 'Soil Deficiency',
    recommended_action: 'Distribute agricultural lime (dolomite) at 250 kg/acre before next irrigation',
    affected_farm_ids: [106, 107, 113, 117, 123, 129, 135, 139, 143, 149, 153, 157],
    created_at: '2026-10-03T04:10:00Z',
    status: 'Active'
  }
];

// Dynamic Org Intelligence Calculator
function computeOrgIntelligence(orgId) {
  const oId = parseInt(orgId, 10) || 1;

  // ── ORGANIZATION 2: Aavin Dairy Cooperative Federation ────────
  if (oId === 2) {
    return {
      metrics: {
        total_farmers: 480,
        total_farms: 460,
        total_area_acres: 1850.0,
        average_farm_size_acres: 4.0,
        active_clusters: 8,
        active_iot_devices: 142,
        total_iot_devices: 150,
        critical_alerts: 5
      },
      soil_health_distribution: {
        healthy_pct: 65,
        moderate_pct: 30,
        poor_pct: 5,
        average_health_score: 76.5,
        primary_deficiencies: [
          { nutrient: 'Organic Carbon (OC)', affected_farms: 42, affected_farms_pct: 9 },
          { nutrient: 'Phosphorus (P)', affected_farms: 38, affected_farms_pct: 8 }
        ]
      },
      crop_distribution: [
        { crop: 'Maize (Fodder)', percentage: 42, acreage: 777.0, expected_harvest_tons: 9324, avg_mandi_price_rs_quintal: 2800 },
        { crop: 'Sorghum (Chari)', percentage: 28, acreage: 518.0, expected_harvest_tons: 6216, avg_mandi_price_rs_quintal: 2400 },
        { crop: 'Green Gram', percentage: 18, acreage: 333.0, expected_harvest_tons: 299, avg_mandi_price_rs_quintal: 7200 },
        { crop: 'Soybean', percentage: 12, acreage: 222.0, expected_harvest_tons: 199, avg_mandi_price_rs_quintal: 4600 }
      ],
      iot_fleet: {
        total_devices: 150,
        online: 142,
        offline: 5,
        maintenance: 3,
        last_sync: new Date().toISOString()
      },
      dairyfeed_silage_telemetry: {
        total_batches_tested: 48,
        quality_breakdown: { good_pct: 92, moderate_pct: 8, poor_pct: 0 },
        active_silage_probes: 24,
        estimated_monthly_fodder_yield_tons: 1850.0,
        cattle_dairy_demand_tons: 1620.0,
        fodder_gap_tons: 0,
        fym_manure_return_tons: 3200.0,
        soil_restoration_status: 'Optimal (Closed Loop Healthy)'
      },
      villages: orgClusters[2] || [],
      action_alerts: [
        { level: 'WARNING', title: 'Silage Fermentation Alert: Pit DF03 Core Temp +3.2°C', count: 2, recommended_action: 'Compact bunk pit and inspect oxygen barrier seal on DF03 probe node' },
        { level: 'INFO', title: 'Cattle Feed Ration Directives: Kharif Silage Harvest Available', count: 48, recommended_action: 'Allocate 18 kg/cow/day maize silage + 2 kg cowpea legume residue for milk fat boost' }
      ]
    };
  }

  // ── ORGANIZATION 3: Kisan Shakti Agribusiness Consortium ───────
  if (oId === 3) {
    return {
      metrics: {
        total_farmers: 860,
        total_farms: 820,
        total_area_acres: 3940.0,
        average_farm_size_acres: 4.8,
        active_clusters: 12,
        active_iot_devices: 275,
        total_iot_devices: 300,
        critical_alerts: 14
      },
      soil_health_distribution: {
        healthy_pct: 48,
        moderate_pct: 40,
        poor_pct: 12,
        average_health_score: 69.2,
        primary_deficiencies: [
          { nutrient: 'Nitrogen (N)', affected_farms: 180, affected_farms_pct: 22 },
          { nutrient: 'Organic Carbon (OC)', affected_farms: 145, affected_farms_pct: 18 },
          { nutrient: 'Phosphorus (P)', affected_farms: 98, affected_farms_pct: 12 }
        ]
      },
      crop_distribution: [
        { crop: 'Tomato', percentage: 30, acreage: 1182.0, expected_harvest_tons: 18912, avg_mandi_price_rs_quintal: 3200 },
        { crop: 'Cotton', percentage: 25, acreage: 985.0, expected_harvest_tons: 1477, avg_mandi_price_rs_quintal: 6400 },
        { crop: 'Sugarcane', percentage: 22, acreage: 866.8, expected_harvest_tons: 34672, avg_mandi_price_rs_quintal: 350 },
        { crop: 'Sunflower', percentage: 13, acreage: 512.2, expected_harvest_tons: 460, avg_mandi_price_rs_quintal: 5800 },
        { crop: 'Soybean', percentage: 10, acreage: 394.0, expected_harvest_tons: 354, avg_mandi_price_rs_quintal: 4800 }
      ],
      iot_fleet: {
        total_devices: 300,
        online: 275,
        offline: 18,
        maintenance: 7,
        last_sync: new Date().toISOString()
      },
      dairyfeed_silage_telemetry: {
        total_batches_tested: 18,
        quality_breakdown: { good_pct: 85, moderate_pct: 15, poor_pct: 0 },
        active_silage_probes: 12,
        estimated_monthly_fodder_yield_tons: 840.0,
        cattle_dairy_demand_tons: 720.0,
        fodder_gap_tons: 0,
        fym_manure_return_tons: 1500.0,
        soil_restoration_status: 'Good'
      },
      villages: orgClusters[3] || [],
      action_alerts: [
        { level: 'WARNING', title: 'Export Compliance: Pre-Harvest Interval Active (Tomato 42 ac)', count: 8, recommended_action: 'Cease pesticide sprays 7 days ahead of processing pickup; inspect residue lab tests' },
        { level: 'INFO', title: 'Mandi Forward Contract Quota: Kharif Delivery Commencing', count: 14, recommended_action: 'Broadcast harvest batch slots to contracted farmers via SMS and WhatsApp' }
      ]
    };
  }

  // ── ORGANIZATION 1: Kovai Farmer Producer Organization (Kovai FPO) ─
  // Master KPI figures as defined in Section 9 & 10 of Master Prompt:
  // 1,250 Farmers · 1,180 Farms · 5,420 Managed Acres · 420 Active IoT Devices (391 Online, 21 Offline, 8 Maint) · 18 Clusters · 24 Critical Alerts
  const regFarms = farms || [];
  const primaryDeficiencies = [
    { nutrient: 'Nitrogen (N)', affected_farms: 312, affected_farms_pct: 26 },
    { nutrient: 'Organic Carbon (OC)', affected_farms: 248, affected_farms_pct: 21 },
    { nutrient: 'Phosphorus (P)', affected_farms: 186, affected_farms_pct: 16 },
    { nutrient: 'Potassium (K)', affected_farms: 112, affected_farms_pct: 9 },
    { nutrient: 'Low Soil pH (Acidic)', affected_farms: 84, affected_farms_pct: 7 },
    { nutrient: 'High Soil pH (Alkaline)', affected_farms: 45, affected_farms_pct: 4 }
  ];

  const cropDistribution = [
    { crop: 'Maize', percentage: 22, acreage: 1200.0, expected_harvest_tons: 7200, avg_mandi_price_rs_quintal: 2650 },
    { crop: 'Pulses (Gram)', percentage: 17, acreage: 900.0, expected_harvest_tons: 810, avg_mandi_price_rs_quintal: 7400 },
    { crop: 'Sugarcane', percentage: 16, acreage: 850.0, expected_harvest_tons: 34000, avg_mandi_price_rs_quintal: 360 },
    { crop: 'Tomato', percentage: 14, acreage: 750.0, expected_harvest_tons: 12000, avg_mandi_price_rs_quintal: 3100 },
    { crop: 'Groundnut', percentage: 11, acreage: 620.0, expected_harvest_tons: 682, avg_mandi_price_rs_quintal: 6800 },
    { crop: 'Cotton', percentage: 11, acreage: 600.0, expected_harvest_tons: 900, avg_mandi_price_rs_quintal: 6200 },
    { crop: 'Sorghum', percentage: 9, acreage: 500.0, expected_harvest_tons: 3000, avg_mandi_price_rs_quintal: 2400 }
  ];

  const villages = orgClusters[1] || [];

  return {
    metrics: {
      total_farmers: 1250,
      total_farms: 1180,
      total_area_acres: 5420.0,
      average_farm_size_acres: 4.6,
      active_clusters: 18,
      active_iot_devices: 391,
      total_iot_devices: 420,
      critical_alerts: 24
    },
    soil_health_distribution: {
      healthy_pct: 42,
      moderate_pct: 38,
      poor_pct: 20,
      average_health_score: 68.0,
      primary_deficiencies: primaryDeficiencies
    },
    crop_distribution: cropDistribution,
    iot_fleet: {
      total_devices: 420,
      online: 391,
      offline: 21,
      maintenance: 8,
      last_sync: new Date().toISOString()
    },
    dairyfeed_silage_telemetry: {
      total_batches_tested: 36,
      quality_breakdown: { good_pct: 88, moderate_pct: 12, poor_pct: 0 },
      active_silage_probes: 16,
      estimated_monthly_fodder_yield_tons: 2450.0,
      cattle_dairy_demand_tons: 2100.0,
      fodder_gap_tons: 0,
      fym_manure_return_tons: 4800.0,
      soil_restoration_status: 'Active Silage Recycling & FYM Carbon Restoration'
    },
    villages,
    action_alerts: orgAlerts.map(a => ({
      alert_id: a.alert_id,
      level: a.level,
      title: a.title,
      count: a.affected_count,
      recommended_action: a.recommended_action,
      cluster: a.cluster,
      category: a.category
    }))
  };
}

// ── 1. List Organizations ────────────────────────────────────
router.get('/', (req, res) => {
  const intel1 = computeOrgIntelligence(1);
  const intel2 = computeOrgIntelligence(2);
  const intel3 = computeOrgIntelligence(3);

  const statsMap = { 1: intel1, 2: intel2, 3: intel3 };

  res.json({
    total_organizations: orgTemplates.length,
    organizations: orgTemplates.map(o => {
      const intel = statsMap[o.org_id] || intel1;
      return {
        org_id: o.org_id,
        name: o.name,
        short_name: o.short_name,
        type: o.type,
        region: o.region,
        season: o.season,
        total_registered_farmers: intel.metrics.total_farmers,
        total_registered_farms: intel.metrics.total_farms,
        total_cultivated_acres: intel.metrics.total_area_acres,
        iot_devices_online: intel.iot_fleet.online,
        total_clusters: intel.metrics.active_clusters,
        critical_alerts: intel.metrics.critical_alerts
      };
    })
  });
});

// ── 2. Organization Overview & Hierarchy ─────────────────────
router.get('/:id', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const intel = computeOrgIntelligence(org.org_id);
  res.json({
    org_id: org.org_id,
    name: org.name,
    short_name: org.short_name,
    type: org.type,
    region: org.region,
    season: org.season,
    admin_name: org.admin_name,
    admin_title: org.admin_title,
    admin_email: org.admin_email,
    admin_phone: org.admin_phone,
    headquarters: org.headquarters,
    reg_number: org.reg_number,
    metrics: intel.metrics,
    total_registered_farmers: intel.metrics.total_farmers,
    total_registered_farms: intel.metrics.total_farms,
    total_cultivated_acres: intel.metrics.total_area_acres,
    villages: intel.villages,
    iot_fleet: intel.iot_fleet
  });
});

// ── 3. B2B Command Dashboard ────────────────────────────────
router.get('/:id/dashboard', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const intel = computeOrgIntelligence(org.org_id);

  res.json({
    org_id: org.org_id,
    name: org.name,
    short_name: org.short_name,
    type: org.type,
    region: org.region,
    season: org.season,
    metrics: intel.metrics,
    soil_health_distribution: intel.soil_health_distribution,
    crop_distribution: intel.crop_distribution,
    clusters: intel.villages,
    iot_fleet: intel.iot_fleet,
    dairyfeed_silage_telemetry: intel.dairyfeed_silage_telemetry,
    action_alerts: intel.action_alerts
  });
});

// ── 4. Organization Member Farms Directory ───────────────────
router.get('/:id/farms', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const { cluster, crop, status, search } = req.query;

  let memberFarms = [];

  if (org.org_id === 2) {
    memberFarms = [
      { farm_id: 201, farmer_id: 201, farmer_name: 'S. Rajendran', phone: '+91 98421 11220', farm_name: 'Tiruppur Dairy Herd Unit', cluster: 'Tiruppur Milk Shed Cluster', location: 'Kangeyam Basin, Tamil Nadu', acres: 4.5, irrigation: 'Drip', soil_score: 80, current_crop: 'Maize', iot_status: 'Online', alerts_count: 0 },
      { farm_id: 202, farmer_id: 202, farmer_name: 'K. Balu', phone: '+91 98421 22331', farm_name: 'Kangeyam Fodder Field', cluster: 'Tiruppur Milk Shed Cluster', location: 'Dharapuram, Tamil Nadu', acres: 3.8, irrigation: 'Rainfed', soil_score: 74, current_crop: 'Sorghum', iot_status: 'Online', alerts_count: 0 },
      { farm_id: 203, farmer_id: 203, farmer_name: 'M. Palani', phone: '+91 98421 33442', farm_name: 'Uthukuli Milk Center', cluster: 'Tiruppur Milk Shed Cluster', location: 'Uthukuli, Tamil Nadu', acres: 4.2, irrigation: 'Drip', soil_score: 84, current_crop: 'Green Gram', iot_status: 'Online', alerts_count: 0 },
      { farm_id: 204, farmer_id: 204, farmer_name: 'P. Velusamy', phone: '+91 98421 44553', farm_name: 'Pollachi Silage Hub', cluster: 'Pollachi Dairy Cattle Belt', location: 'Pollachi, Tamil Nadu', acres: 4.0, irrigation: 'Drip', soil_score: 76, current_crop: 'Maize', iot_status: 'Online', alerts_count: 1 },
      { farm_id: 205, farmer_id: 205, farmer_name: 'A. Subbulakshmi', phone: '+91 98421 55664', farm_name: 'Anamalai Fodder Plot', cluster: 'Pollachi Dairy Cattle Belt', location: 'Anamalai, Tamil Nadu', acres: 3.5, irrigation: 'Canal', soil_score: 72, current_crop: 'Soybean', iot_status: 'Online', alerts_count: 0 },
      { farm_id: 206, farmer_id: 206, farmer_name: 'T. Krishnan', phone: '+91 98421 66775', farm_name: 'Bhavani River Silage Farm', cluster: 'Bhavani River Silage Cluster', location: 'Bhavani, Tamil Nadu', acres: 3.8, irrigation: 'Canal', soil_score: 78, current_crop: 'Maize', iot_status: 'Online', alerts_count: 0 }
    ];
  } else if (org.org_id === 3) {
    memberFarms = [
      { farm_id: 301, farmer_id: 301, farmer_name: 'G. Natarajan', phone: '+91 98423 11220', farm_name: 'Mettupalayam Export Tomato', cluster: 'Coimbatore North Agro Cluster', location: 'Mettupalayam, Tamil Nadu', acres: 6.5, irrigation: 'Drip', soil_score: 68, current_crop: 'Tomato', iot_status: 'Online', alerts_count: 1 },
      { farm_id: 302, farmer_id: 302, farmer_name: 'S. Loganathan', phone: '+91 98423 22331', farm_name: 'Sirumugai Cotton Outgrower', cluster: 'Coimbatore North Agro Cluster', location: 'Sirumugai, Tamil Nadu', acres: 5.8, irrigation: 'Canal', soil_score: 62, current_crop: 'Cotton', iot_status: 'Online', alerts_count: 2 },
      { farm_id: 303, farmer_id: 303, farmer_name: 'R. Periyasamy', phone: '+91 98423 33442', farm_name: 'Bhavanisagar Sugar Estate', cluster: 'Erode Processing Outgrowers', location: 'Bhavanisagar, Tamil Nadu', acres: 6.0, irrigation: 'Drip', soil_score: 70, current_crop: 'Sugarcane', iot_status: 'Online', alerts_count: 0 },
      { farm_id: 304, farmer_id: 304, farmer_name: 'K. Venkatesh', phone: '+91 98423 44553', farm_name: 'Sankari Sunflower Holding', cluster: 'Salem Spices & Sunflower Zone', location: 'Sankari, Tamil Nadu', acres: 5.5, irrigation: 'Rainfed', soil_score: 65, current_crop: 'Sunflower', iot_status: 'Offline', alerts_count: 1 }
    ];
  } else {
    // Org 1: Kovai FPO (Registered farms with rich details)
    memberFarms = farms.map(f => {
      const farmer = farmers.find(fr => fr.farmer_id === f.farmer_id);
      const soil = getFarmLatestSoil(f.farm_id);
      const clusterObj = (orgClusters[1] || []).find(c => f.location_name && f.location_name.toLowerCase().includes(c.name.split(' ')[0].toLowerCase())) || (orgClusters[1] || [])[0];

      let iotStatus = 'Online';
      if (live_sensor_status && live_sensor_status[f.farm_id]) {
        iotStatus = live_sensor_status[f.farm_id].connected ? 'Online' : 'Offline';
      }
      if (f.farm_id === 106 || f.farm_id === 108) iotStatus = 'Offline';

      const alerts = orgAlerts.filter(a => a.affected_farm_ids && a.affected_farm_ids.includes(f.farm_id));

      return {
        farm_id: f.farm_id,
        farmer_id: f.farmer_id,
        farmer_name: farmer ? farmer.name : `Farmer ${f.farmer_id}`,
        phone: farmer ? farmer.phone : '+91 98765 43210',
        farm_name: f.name,
        cluster: clusterObj ? clusterObj.name : 'Sulur Cluster',
        location: f.location_name,
        acres: f.area_acres,
        irrigation: f.irrigation_type || f.irrigation || 'Drip',
        soil_score: soil ? soil.soil_health_score : 65,
        current_crop: getFarmLatestCrop(f.farm_id),
        iot_status: iotStatus,
        device_id: `ESP32-SOIL-F${f.farm_id}`,
        alerts_count: alerts.length
      };
    });
  }

  // Filter logic
  let filtered = [...memberFarms];
  if (cluster && cluster !== 'all') {
    filtered = filtered.filter(f => f.cluster.toLowerCase().includes(cluster.toLowerCase()) || f.location.toLowerCase().includes(cluster.toLowerCase()));
  }
  if (crop && crop !== 'all') {
    filtered = filtered.filter(f => f.current_crop.toLowerCase() === crop.toLowerCase());
  }
  if (status && status !== 'all') {
    if (status === 'healthy') filtered = filtered.filter(f => f.soil_score >= 75);
    else if (status === 'moderate') filtered = filtered.filter(f => f.soil_score >= 50 && f.soil_score < 75);
    else if (status === 'poor') filtered = filtered.filter(f => f.soil_score < 50);
    else if (status === 'offline') filtered = filtered.filter(f => f.iot_status === 'Offline');
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(f =>
      f.farmer_name.toLowerCase().includes(q) ||
      f.farm_name.toLowerCase().includes(q) ||
      f.location.toLowerCase().includes(q) ||
      f.current_crop.toLowerCase().includes(q) ||
      String(f.farm_id).includes(q)
    );
  }

  res.json({
    org_id: org.org_id,
    total_farms: memberFarms.length,
    filtered_count: filtered.length,
    farms: filtered
  });
});

// ── 5. Individual Farm Drill-Down ────────────────────────────
// Pattern: Organization -> Cluster -> Farm -> Farmer -> Field
router.get('/:id/farms/:farmId', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const farmId = parseInt(req.params.farmId, 10);
  const farm = farms.find(f => f.farm_id === farmId) || {
    farm_id: farmId,
    farmer_id: 1,
    name: `Farm #${farmId}`,
    location_name: 'Coimbatore Region, Tamil Nadu',
    area_acres: 4.5,
    irrigation: 'Drip',
    latitude: 11.0168,
    longitude: 76.9558
  };

  const farmer = farmers.find(fr => fr.farmer_id === farm.farmer_id) || {
    farmer_id: farm.farmer_id,
    name: 'Ramesh Kumar',
    phone: '+91 98421 54820',
    email: 'ramesh@kovaifpo.org'
  };

  const soilReadings = soil_data.filter(s => s.farm_id === farmId);
  const latestSoil = soilReadings.length > 0 ? soilReadings[soilReadings.length - 1] : {
    nitrogen: 48, phosphorus: 32, potassium: 75, ph: 6.8, organic_carbon: 0.65, soil_health_score: 68,
    deficiencies: ['Low Nitrogen', 'Low Organic Carbon'], adequate: ['Potassium', 'pH']
  };

  const histories = crop_history.filter(h => h.farm_id === farmId);
  const currentCrop = getFarmLatestCrop(farmId);

  const clusterObj = (orgClusters[org.org_id] || orgClusters[1] || [])[0];

  const farmAlerts = orgAlerts.filter(a => a.affected_farm_ids && a.affected_farm_ids.includes(farmId));
  const farmTasks = orgTasks.filter(t => t.farm_id === farmId);

  res.json({
    farm_id: farm.farm_id,
    org_id: org.org_id,
    org_name: org.name,
    cluster: clusterObj.name,
    farmer: {
      farmer_id: farmer.farmer_id,
      name: farmer.name,
      phone: farmer.phone,
      email: farmer.email,
      membership_status: 'Active Member'
    },
    overview: {
      farm_name: farm.name,
      location: farm.location_name,
      coordinates: { latitude: farm.latitude, longitude: farm.longitude },
      acreage: farm.area_acres,
      irrigation: farm.irrigation_type || farm.irrigation || 'Drip',
      soil_health_score: latestSoil.soil_health_score,
      current_crop: currentCrop,
      soil_texture: 'Red Loam / Clay',
      field_officer: clusterObj.officer || 'Anand Kumar'
    },
    soil_intelligence: {
      latest: latestSoil,
      history: soilReadings,
      benchmarks: { optimal_n: '120-180 kg/ha', optimal_p: '35-65 kg/ha', optimal_k: '80-160 kg/ha', optimal_ph: '6.5-7.5', optimal_oc: '>0.80%' },
      fertilizer_recommendation: latestSoil.nitrogen < 50 ? 'Incorporate Green Manure (Cowpea) + 30 kg/ac Neem-coated Urea' : 'Maintain balanced compost dressing'
    },
    crop_intelligence: {
      current_crop: currentCrop,
      growth_stage: 'Vegetative (Day 42)',
      sowing_date: '2026-08-20',
      expected_harvest: '2026-11-15',
      estimated_yield_tons: +(farm.area_acres * 2.8).toFixed(1),
      rotation_history: histories.map(h => ({
        season_year: `${h.season_id === 1 ? 'Kharif' : 'Rabi'} ${h.year}`,
        crop: (crops.find(c => c.crop_id === h.crop_id) || {}).name || 'Tomato',
        yield: h.yield_amount,
        profit: h.profit_estimate
      }))
    },
    iot_telemetry: {
      device_id: `ESP32-SOIL-F${farmId}`,
      model: 'RS485 7-in-1 Modbus Node (Industrial Grade)',
      status: (farmId === 106 || farmId === 108) ? 'Offline' : 'Online',
      battery_pct: (farmId === 106) ? 14 : 92,
      signal_rssi: -68,
      last_data: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
      live_readings: {
        soil_moisture_pct: 34.2,
        soil_temp_c: 27.8,
        ec_us_cm: 640,
        nitrogen_mg_kg: latestSoil.nitrogen,
        phosphorus_mg_kg: latestSoil.phosphorus,
        potassium_mg_kg: latestSoil.potassium,
        ph: latestSoil.ph
      }
    },
    actions: {
      active_alerts: farmAlerts,
      tasks: farmTasks
    }
  });
});

// ── 6. Organization Members (Farmers & Officers) ─────────────
router.get('/:id/members', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const officers = orgOfficers[org.org_id] || orgOfficers[1] || [];
  const memberFarmers = farmers.map(f => {
    const farm = farms.find(fm => fm.farmer_id === f.farmer_id);
    const clusterObj = (orgClusters[org.org_id] || orgClusters[1] || [])[0];
    return {
      farmer_id: f.farmer_id,
      name: f.name,
      phone: f.phone,
      email: f.email,
      farm_id: farm ? farm.farm_id : 101,
      farm_name: farm ? farm.name : 'Coimbatore Farm',
      cluster: clusterObj.name,
      acres: farm ? farm.area_acres : 4.5,
      crops: farm ? getFarmLatestCrop(farm.farm_id) : 'Tomato',
      membership_date: '2022-04-12',
      status: 'Active'
    };
  });

  res.json({
    org_id: org.org_id,
    total_farmers: memberFarmers.length,
    total_officers: officers.length,
    farmers: memberFarmers,
    officers: officers
  });
});

router.get('/:id/farmers', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const list = farmers.map(f => {
    const farm = farms.find(fm => fm.farmer_id === f.farmer_id);
    const clusterObj = (orgClusters[org.org_id] || orgClusters[1] || [])[0];
    const soil = farm ? getFarmLatestSoil(farm.farm_id) : null;
    return {
      farmer_id: f.farmer_id,
      name: f.name,
      phone: f.phone,
      email: f.email,
      farm_id: farm ? farm.farm_id : null,
      acres: farm ? farm.area_acres : 4.0,
      cluster: clusterObj.name,
      current_crop: farm ? getFarmLatestCrop(farm.farm_id) : 'Maize',
      soil_score: soil ? soil.soil_health_score : 68,
      status: 'Active'
    };
  });

  res.json({ org_id: org.org_id, total: list.length, farmers: list });
});

router.get('/:id/officers', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const list = orgOfficers[org.org_id] || orgOfficers[1] || [];
  res.json({ org_id: org.org_id, total: list.length, officers: list });
});

// ── 7. Organization Clusters ─────────────────────────────────
router.get('/:id/clusters', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const clusters = orgClusters[org.org_id] || orgClusters[1] || [];
  res.json({ org_id: org.org_id, total_clusters: clusters.length, clusters });
});

router.get('/:id/clusters/:clusterId', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const clusters = orgClusters[org.org_id] || orgClusters[1] || [];
  const cluster = clusters.find(c => c.cluster_id === req.params.clusterId || c.name.toLowerCase().includes(req.params.clusterId.toLowerCase()));
  if (!cluster) return res.status(404).json({ error: 'Cluster not found' });

  res.json({
    org_id: org.org_id,
    cluster,
    crops_breakdown: [
      { crop: cluster.main_crops[0] || 'Maize', acres: +(cluster.acreage * 0.45).toFixed(1), percentage: 45 },
      { crop: cluster.main_crops[1] || 'Pulses', acres: +(cluster.acreage * 0.35).toFixed(1), percentage: 35 },
      { crop: cluster.main_crops[2] || 'Sorghum', acres: +(cluster.acreage * 0.20).toFixed(1), percentage: 20 }
    ],
    deficiencies: cluster.soil_score < 70 ? ['Low Nitrogen (68% farms)', 'Organic Carbon Deficient'] : ['Sub-optimal Organic Carbon (18% farms)']
  });
});

// ── 8. Soil Intelligence Module ──────────────────────────────
router.get(['/:id/soil', '/:id/soil-health'], (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const intel = computeOrgIntelligence(org.org_id);
  const clusters = orgClusters[org.org_id] || orgClusters[1] || [];

  res.json({
    org_id: org.org_id,
    name: org.name,
    mean_nitrogen_kg_ha: 81.3,
    mean_phosphorus_kg_ha: 38.5,
    mean_potassium_kg_ha: 110.2,
    mean_ph: 6.8,
    mean_organic_carbon_pct: 0.82,
    health_status: 'Adequate with localized cluster nitrogen deficits',
    distribution: intel.soil_health_distribution,
    regional_map: clusters.map(c => ({
      cluster_id: c.cluster_id,
      name: c.name,
      location: c.location,
      soil_score: c.soil_score,
      status: c.soil_score >= 75 ? 'Healthy' : c.soil_score >= 60 ? 'Moderate' : 'Poor',
      farms_count: c.farms,
      acreage: c.acreage,
      primary_deficiency: c.soil_score < 60 ? 'Severe Nitrogen Depletion' : c.soil_score < 75 ? 'Sub-optimal OC' : 'Adequate'
    })),
    nutrient_deficiencies: intel.soil_health_distribution.primary_deficiencies,
    actionable_interventions: [
      { deficiency: 'Low Nitrogen (N)', recommended_input: 'Incorporate leguminous green manure (Cowpea / Green Gram) + neem-coated urea top dress', target_clusters: ['Sulur Cluster', 'Thondamuthur Cluster'] },
      { deficiency: 'Organic Carbon (OC)', recommended_input: 'Return composted cattle manure (FYM) from dairy clusters at 4 tons/acre', target_clusters: ['Sulur Cluster', 'Madukkarai Cluster'] },
      { deficiency: 'Low Soil pH (Acidic)', recommended_input: 'Apply 250 kg/acre dolomite lime to correct sub-surface acidity', target_clusters: ['Thondamuthur Cluster'] }
    ]
  });
});

// ── 9. Crop Intelligence & Production Module ─────────────────
router.get('/:id/crops', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const intel = computeOrgIntelligence(org.org_id);
  const totalAcres = intel.metrics.total_area_acres;

  res.json({
    org_id: org.org_id,
    current_season: `${org.season} 2026`,
    total_cultivated_acres: totalAcres,
    crop_distribution: intel.crop_distribution,
    top_crops_by_acreage: intel.crop_distribution.map(cd => ({
      crop: cd.crop,
      acres: cd.acreage,
      share_pct: cd.percentage,
      expected_harvest_tons: cd.expected_harvest_tons || +(cd.acreage * 2.5).toFixed(1),
      avg_mandi_price_rs_quintal: cd.avg_mandi_price_rs_quintal || 3200
    })),
    growth_stages: [
      { stage: 'Sowing & Germination', percentage: 14, acres: +(totalAcres * 0.14).toFixed(1) },
      { stage: 'Vegetative Growth', percentage: 48, acres: +(totalAcres * 0.48).toFixed(1) },
      { stage: 'Flowering & Pod Setting', percentage: 26, acres: +(totalAcres * 0.26).toFixed(1) },
      { stage: 'Maturity & Pre-Harvest', percentage: 12, acres: +(totalAcres * 0.12).toFixed(1) }
    ],
    restorative_rotation_demand: {
      legume_adoption_target_acres: +(totalAcres * 0.3).toFixed(1),
      fodder_silage_target_acres: +(totalAcres * 0.2).toFixed(1),
      projected_fym_replenishment_tons: +(totalAcres * 4.5).toFixed(1)
    }
  });
});

router.get('/:id/production', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const intel = computeOrgIntelligence(org.org_id);
  const cropsData = intel.crop_distribution;

  const totalTons = cropsData.reduce((acc, c) => acc + (c.expected_harvest_tons || 0), 0);
  const totalValueLakhs = cropsData.reduce((acc, c) => {
    const val = (c.expected_harvest_tons || 0) * 10 * (c.avg_mandi_price_rs_quintal || 3000);
    return acc + (val / 100000);
  }, 0);

  res.json({
    org_id: org.org_id,
    current_season: `${org.season} 2026`,
    projected_total_production_tons: +totalTons.toFixed(1),
    estimated_mandi_market_value_inr_lakhs: +totalValueLakhs.toFixed(1),
    procurement_schedule: [
      { window: 'Oct 15 – Oct 31, 2026', crops: ['Maize', 'Green Gram'], expected_tons: 3400, warehouse: 'Sulur Central Mandi Hub' },
      { window: 'Nov 01 – Nov 20, 2026', crops: ['Tomato', 'Sorghum'], expected_tons: 5800, warehouse: 'Pollachi Sorting Complex' },
      { window: 'Dec 01 – Dec 25, 2026', crops: ['Cotton', 'Sugarcane'], expected_tons: 14200, warehouse: 'Perur Agro Cooperative Depot' }
    ],
    buyer_agreements: [
      { buyer: 'ITC Agri Business', crop: 'Maize', committed_tons: 4000, price_per_quintal_inr: 2700, status: 'Contract Signed' },
      { buyer: 'Heritage Foods & Dairy', crop: 'Silage Fodder', committed_tons: 2500, price_per_ton_inr: 4200, status: 'Active Dispatch' },
      { buyer: 'Tata Consumer Foods', crop: 'Pulses', committed_tons: 600, price_per_quintal_inr: 7500, status: 'Term Sheet Approved' }
    ]
  });
});

// ── 10. IoT Fleet Management ─────────────────────────────────
router.get('/:id/sensors', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const intel = computeOrgIntelligence(org.org_id);
  const totalDevices = intel.iot_fleet.total_devices;

  // Real device inventory samples from registered farms
  const sampleDevices = [
    { device_id: 'ESP32-SOIL-101', farm_id: 101, farmer_name: 'Ramesh Kumar', cluster: 'Pollachi Cluster', device_type: '7-in-1 RS485 Soil NPK Node', status: 'Online', last_data: '2 mins ago', battery: 94, signal_rssi: -65, firmware: 'v1.4.2' },
    { device_id: 'ESP32-SOIL-102', farm_id: 102, farmer_name: 'Murugan Palanisamy', cluster: 'Pollachi Cluster', device_type: '7-in-1 RS485 Soil NPK Node', status: 'Online', last_data: '5 mins ago', battery: 88, signal_rssi: -71, firmware: 'v1.4.2' },
    { device_id: 'ESP32-SOIL-104', farm_id: 104, farmer_name: 'V. Sundaram', cluster: 'Sulur Cluster', device_type: '7-in-1 RS485 Soil NPK Node', status: 'Online', last_data: '1 min ago', battery: 76, signal_rssi: -69, firmware: 'v1.4.2' },
    { device_id: 'ESP32-SOIL-106', farm_id: 106, farmer_name: 'K. Chinnasamy', cluster: 'Thondamuthur Cluster', device_type: '7-in-1 RS485 Soil NPK Node', status: 'Offline', last_data: '28 hours ago', battery: 12, signal_rssi: -92, firmware: 'v1.4.0' },
    { device_id: 'ESP32-SOIL-108', farm_id: 108, farmer_name: 'Senthil Velan', cluster: 'Kinathukadavu Cluster', device_type: '7-in-1 RS485 Soil NPK Node', status: 'Maintenance', last_data: '3 days ago', battery: 0, signal_rssi: -99, firmware: 'v1.3.8' },
    { device_id: 'SILAGE-PROBE-DF01', farm_id: 111, farmer_name: 'B. Dhanalakshmi', cluster: 'Annur Cluster', device_type: 'Dual-Node Silage Temp & pH Probe', status: 'Online', last_data: 'Just now', battery: 98, signal_rssi: -58, firmware: 'v2.1.0' },
    { device_id: 'SILAGE-PROBE-DF02', farm_id: 204, farmer_name: 'P. Velusamy', cluster: 'Pollachi Cluster', device_type: 'Dual-Node Silage Temp & pH Probe', status: 'Online', last_data: '4 mins ago', battery: 91, signal_rssi: -64, firmware: 'v2.1.0' }
  ];

  const dynamicDevices = sampleDevices.map(d => {
    const live = live_sensor_status && live_sensor_status[d.farm_id];
    if (live) {
      const isRecent = live.last_seen && (Date.now() - live.last_seen < 300000);
      return {
        ...d,
        status: isRecent || live.connected ? 'Online' : d.status,
        last_data: live.last_seen ? `${Math.max(1, Math.round((Date.now() - live.last_seen) / 1000))}s ago (Live)` : d.last_data,
        battery: live.last_reading?.battery || d.battery,
        signal_rssi: live.last_reading?.signal_rssi || d.signal_rssi,
        live_moisture: live.last_reading?.soil_moisture,
        live_npk: live.last_reading ? `${live.last_reading.nitrogen}N-${live.last_reading.phosphorus}P-${live.last_reading.potassium}K` : null
      };
    }
    return d;
  });

  res.json({
    org_id: org.org_id,
    fleet_metrics: intel.iot_fleet,
    device_breakdown: [
      { type: '7-in-1 RS485 Soil NPK & Moisture Sensor', total: totalDevices - 20, active: intel.iot_fleet.online - 18, maintenance_required: 6 },
      { type: 'DairyFeed Dual-Node Silage Probe (DF01/DF02)', total: 16, active: 15, maintenance_required: 1 },
      { type: 'LoRaWAN Micro-Weather Gateway', total: 4, active: 4, maintenance_required: 1 }
    ],
    telemetry_latency_avg_ms: 180,
    firmware_distribution: { 'v1.4.2': '88%', 'v1.4.0': '8%', 'v2.1.0': '4%' },
    devices: dynamicDevices
  });
});

// ── Real-Time Sensor Telemetry Ingestion Endpoint ────────────
router.post('/:id/sensors/simulate-reading', (req, res) => {
  const farm_id = Number(req.body.farm_id || 101);
  const device_id = req.body.device_id || `ESP32-SOIL-${farm_id}`;

  const entry = {
    soil_id: (soil_data.length > 0 ? Math.max(...soil_data.map(s => s.soil_id || 0)) : 100) + 1,
    farm_id,
    recorded_date: new Date().toISOString().slice(0, 10),
    nitrogen: Number(req.body.nitrogen !== undefined ? req.body.nitrogen : Math.floor(45 + Math.random() * 60)),
    phosphorus: Number(req.body.phosphorus !== undefined ? req.body.phosphorus : Math.floor(25 + Math.random() * 35)),
    potassium: Number(req.body.potassium !== undefined ? req.body.potassium : Math.floor(50 + Math.random() * 60)),
    ph: Number(req.body.ph !== undefined ? req.body.ph : parseFloat((6.4 + Math.random() * 0.8).toFixed(1))),
    organic_carbon: Number(req.body.organic_carbon !== undefined ? req.body.organic_carbon : parseFloat((0.65 + Math.random() * 0.3).toFixed(2))),
    air_temperature: Number(req.body.air_temperature !== undefined ? req.body.air_temperature : 28.5),
    air_humidity: Number(req.body.air_humidity !== undefined ? req.body.air_humidity : 68),
    soil_moisture: Number(req.body.soil_moisture !== undefined ? req.body.soil_moisture : Math.floor(40 + Math.random() * 35)),
    tds: Number(req.body.tds || 450),
    latitude: 11.0168,
    longitude: 76.9558,
    is_reliable: true,
    reliability_note: 'Real-Time Hardware Heartbeat Verified',
    soil_health_score: Math.floor(65 + Math.random() * 25),
    source: 'esp32_live'
  };

  soil_data.push(entry);
  if (live_sensor_status) {
    live_sensor_status[farm_id] = {
      device_id,
      last_seen: Date.now(),
      connected: true,
      last_reading: entry
    };
  }

  res.json({
    success: true,
    message: `Real-time sensor telemetry packet ingested from ${device_id} for Farm #${farm_id}`,
    reading: entry
  });
});

// ── 11. Integrated Farming System (IFS) Module ────────────────
router.get('/:id/ifs', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const intel = computeOrgIntelligence(org.org_id);
  const ifs = intel.dairyfeed_silage_telemetry;

  res.json({
    org_id: org.org_id,
    closed_loop_concept: 'Soil -> Crop Planning -> Fodder Production -> Silage -> Dairy -> Manure -> Soil Restoration Loop',
    fodder_availability: {
      total_monthly_fodder_yield_tons: ifs.estimated_monthly_fodder_yield_tons,
      dairy_demand_tons: ifs.cattle_dairy_demand_tons,
      surplus_tons: +(ifs.estimated_monthly_fodder_yield_tons - ifs.cattle_dairy_demand_tons).toFixed(1),
      status: 'Surplus Reserve Available for Mandi Sale'
    },
    silage_reserve: {
      total_batches_tested: ifs.total_batches_tested,
      quality_breakdown: ifs.quality_breakdown,
      active_silage_probes: ifs.active_silage_probes,
      avg_fermentation_ph: 4.15,
      avg_lactic_acid_pct: 6.8
    },
    manure_and_soil_restoration: {
      estimated_fym_produced_monthly_tons: ifs.fym_manure_return_tons,
      organic_carbon_gain_projected_pct: 0.18,
      soil_restoration_status: ifs.soil_restoration_status,
      recommended_manure_application_per_acre_tons: 4.5
    }
  });
});

// ── 12. Action Center & Alerts ───────────────────────────────
router.get('/:id/alerts', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  res.json({
    org_id: org.org_id,
    total_active_alerts: orgAlerts.filter(a => a.status === 'Active').length,
    alerts: orgAlerts
  });
});

router.post('/:id/alerts/:alertId/resolve', (req, res) => {
  const alert = orgAlerts.find(a => a.alert_id === req.params.alertId);
  if (!alert) return res.status(404).json({ error: 'Alert not found' });

  alert.status = 'Resolved';
  alert.resolved_at = new Date().toISOString();
  alert.resolved_by = req.body.resolved_by || 'Dr. K. Swaminathan (CEO)';

  res.json({ success: true, message: `Alert ${alert.alert_id} resolved successfully`, alert });
});

// ── 13. Advisory System ──────────────────────────────────────
router.get('/:id/advisories', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const list = orgAdvisories.filter(a => a.org_id === org.org_id);
  res.json({ org_id: org.org_id, total: list.length, advisories: list });
});

router.post('/:id/advisories', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const { title, message, category, target_type, target_name, channels, priority } = req.body;
  if (!title || !message) return res.status(400).json({ error: 'Title and message are required' });

  const newAdvisory = {
    advisory_id: `ADV-${Math.floor(100 + Math.random() * 900)}`,
    org_id: org.org_id,
    title,
    category: category || 'General Agronomy',
    target_type: target_type || 'Cluster',
    target_name: target_name || 'Sulur Cluster',
    affected_count: req.body.affected_count || 24,
    channels: channels || ['In-App Notification', 'SMS', 'WhatsApp'],
    created_at: new Date().toISOString(),
    author: req.body.author || 'Dr. K. Swaminathan (FPO Admin)',
    status: 'Dispatched',
    read_count: 0,
    acknowledged_count: 0,
    message,
    priority: priority || 'Normal'
  };

  orgAdvisories.unshift(newAdvisory);

  res.status(201).json({
    success: true,
    message: `Advisory "${title}" dispatched via ${newAdvisory.channels.join(', ')} to ${newAdvisory.target_name}!`,
    advisory: newAdvisory
  });
});

// ── 14. Tasks & Field Operations ─────────────────────────────
router.get('/:id/tasks', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const list = orgTasks.filter(t => t.org_id === org.org_id);
  res.json({ org_id: org.org_id, total: list.length, tasks: list });
});

router.post('/:id/tasks', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const { title, farm_id, assigned_to, type, due_date, priority, notes } = req.body;
  if (!title || !farm_id) return res.status(400).json({ error: 'Title and farm_id are required' });

  const farm = farms.find(f => f.farm_id === parseInt(farm_id, 10));
  const farmer = farm ? farmers.find(fr => fr.farmer_id === farm.farmer_id) : null;

  const newTask = {
    task_id: `TSK-${Math.floor(200 + Math.random() * 800)}`,
    org_id: org.org_id,
    farm_id: parseInt(farm_id, 10),
    farmer_name: farmer ? farmer.name : `Farmer #${farm_id}`,
    cluster: farm ? farm.location_name.split(',')[0].trim() : 'Sulur Cluster',
    type: type || 'Field Inspection',
    title,
    assigned_to: assigned_to || 'Anand Kumar',
    due_date: due_date || '2026-10-10',
    priority: priority || 'Medium',
    status: 'Assigned',
    notes: notes || ''
  };

  orgTasks.unshift(newTask);

  res.status(201).json({
    success: true,
    message: `Task assigned to ${newTask.assigned_to} for Farm #${newTask.farm_id}`,
    task: newTask
  });
});

// ── 15. Organization Reports ─────────────────────────────────
router.get('/:id/reports', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  const intel = computeOrgIntelligence(org.org_id);
  const type = req.query.type || 'executive';

  res.json({
    org_id: org.org_id,
    org_name: org.name,
    report_type: type,
    generated_at: new Date().toISOString(),
    executive_summary: {
      season: `${org.season} 2026`,
      total_farmers: intel.metrics.total_farmers,
      total_farms: intel.metrics.total_farms,
      total_acreage: intel.metrics.total_area_acres,
      mean_soil_score: intel.soil_health_distribution.average_health_score,
      iot_uptime_pct: Math.round((intel.iot_fleet.online / intel.iot_fleet.total_devices) * 100),
      critical_issues_pending: intel.metrics.critical_alerts
    },
    clusters: intel.villages,
    crops: intel.crop_distribution,
    deficiencies: intel.soil_health_distribution.primary_deficiencies
  });
});

// ── 16. Organization Settings ────────────────────────────────
router.get('/:id/settings', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  res.json({
    org_id: org.org_id,
    name: org.name,
    short_name: org.short_name,
    type: org.type,
    region: org.region,
    season: org.season,
    admin_name: org.admin_name,
    admin_email: org.admin_email,
    admin_phone: org.admin_phone,
    headquarters: org.headquarters,
    reg_number: org.reg_number,
    thresholds: {
      low_nitrogen_warning_kg_ha: 50,
      critical_soil_score: 55,
      iot_offline_alert_hours: 24,
      silage_temp_alert_celsius: 35.0
    },
    notification_channels: {
      sms_gateway: 'Active (Msg91 / DLT Approved)',
      whatsapp_business_api: 'Active (Meta Cloud API)',
      push_notifications: 'Active (WebPush / FCM)'
    }
  });
});

router.post('/:id/settings', (req, res) => {
  const org = orgTemplates.find(o => o.org_id === parseInt(req.params.id, 10));
  if (!org) return res.status(404).json({ error: 'Organization not found' });

  if (req.body.name) org.name = req.body.name;
  if (req.body.season) org.season = req.body.season;
  if (req.body.admin_name) org.admin_name = req.body.admin_name;
  if (req.body.admin_phone) org.admin_phone = req.body.admin_phone;

  res.json({ success: true, message: 'Organization settings updated successfully', org });
});

module.exports = router;
