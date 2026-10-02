// ============================================================
// sync_to_supabase.js — Seeds master data & crops into Supabase
// Usage: node backend/scripts/sync_to_supabase.js
// ============================================================

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { createClient } = require('@supabase/supabase-js');
const { kaggleCrops } = require('../data/kaggle_crops');
const memDb = require('../data/seed');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_KEY;

if (!url || !key || url.includes('your-project')) {
  console.error('\n❌ Error: SUPABASE_URL and SUPABASE_KEY must be set in backend/.env');
  console.error('Please configure backend/.env and re-run.\n');
  process.exit(1);
}

const supabase = createClient(url, key);

async function syncAll() {
  console.log('🚀 Syncing CropSmart master data to Supabase...\n');

  // 1. Seasons
  console.log('1. Upserting seasons...');
  const { error: seasonErr } = await supabase
    .from('seasons')
    .upsert(memDb.seasons, { onConflict: 'season_id' });
  if (seasonErr) console.warn('   ⚠️ Seasons error:', seasonErr.message);
  else console.log(`   ✅ Synced ${memDb.seasons.length} seasons.`);

  // 2. Farmers
  console.log('2. Upserting farmers...');
  const { error: farmerErr } = await supabase
    .from('farmers')
    .upsert(memDb.farmers, { onConflict: 'farmer_id' });
  if (farmerErr) console.warn('   ⚠️ Farmers error:', farmerErr.message);
  else console.log(`   ✅ Synced ${memDb.farmers.length} farmers.`);

  // 3. Farms
  console.log('3. Upserting farms...');
  const farmPayload = memDb.farms.map(f => {
    let itype = f.irrigation_type || f.irrigation || 'Rainfed';
    const lower = itype.toLowerCase();
    if (lower.includes('drip')) itype = 'Drip';
    else if (lower.includes('canal')) itype = 'Canal';
    else if (lower.includes('rainfed')) itype = 'Rainfed';
    else itype = 'Moderate';
    return {
      farm_id: f.farm_id,
      farmer_id: f.farmer_id,
      location_name: f.location_name,
      latitude: f.latitude,
      longitude: f.longitude,
      area_acres: f.area_acres,
      irrigation_type: itype,
    };
  });
  const { error: farmErr } = await supabase
    .from('farms')
    .upsert(farmPayload, { onConflict: 'farm_id' });
  if (farmErr) console.warn('   ⚠️ Farms error:', farmErr.message);
  else console.log(`   ✅ Synced ${memDb.farms.length} farms.`);

  // 4. Crops
  console.log(`4. Syncing ${kaggleCrops.length} crops from unified Kaggle datasets...`);
  // Clear any existing child references first
  await supabase.from('crop_history').delete().gt('history_id', 0);
  await supabase.from('crops').delete().gt('crop_id', 0);

  const cropPayload = kaggleCrops.map(c => ({
    crop_id:              c.crop_id,
    name:                 c.name,
    crop_family:          c.crop_family,
    growth_duration_days: c.growth_duration_days,
    water_requirement:    c.water_requirement,
    ideal_ph_min:         c.ideal_ph_min,
    ideal_ph_max:         c.ideal_ph_max,
    n_demand:             c.n_demand,
    p_demand:             c.p_demand,
    k_demand:             c.k_demand,
    is_nitrogen_fixer:    c.is_nitrogen_fixer,
    avg_yield_per_acre:   c.avg_yield_per_acre,
    avg_market_price:     c.avg_market_price,
    avg_cultivation_cost: c.avg_cultivation_cost,
    disease_risk_index:   c.disease_risk_index,
    suitable_seasons:     c.suitable_seasons,
    avg_temperature_c:    c.avg_temperature_c,
    avg_humidity_pct:     c.avg_humidity_pct,
    avg_rainfall_mm:      c.avg_rainfall_mm,
    preferred_soil_types: c.preferred_soil_types || [],
    stats:                c.stats || {},
    total_rows:           c.total_records || 0,
  }));

  const { error: cropsErr } = await supabase
    .from('crops')
    .insert(cropPayload);
  if (cropsErr) console.warn('   ⚠️ Crops error:', cropsErr.message);
  else console.log(`   ✅ Synced ${cropPayload.length} crops into 'crops' table.`);

  // 5. Initial Soil Data
  console.log('5. Upserting demo soil data...');
  const { error: soilErr } = await supabase
    .from('soil_data')
    .upsert(memDb.soil_data, { onConflict: 'soil_id' });
  if (soilErr) console.warn('   ⚠️ Soil error:', soilErr.message);
  else console.log('   ✅ Synced demo soil readings.');

  // 6. Crop History
  console.log('6. Upserting historical crop records...');
  const { error: histErr } = await supabase
    .from('crop_history')
    .upsert(memDb.crop_history, { onConflict: 'history_id' });
  if (histErr) console.warn('   ⚠️ Crop history error:', histErr.message);
  else console.log(`   ✅ Synced ${memDb.crop_history.length} historical crop seasons.`);

  // 7. Weather Data
  console.log('7. Upserting weather records...');
  const { error: weatherErr } = await supabase
    .from('weather_data')
    .upsert(memDb.weather_data, { onConflict: 'weather_id' });
  if (weatherErr) console.warn('   ⚠️ Weather error:', weatherErr.message);
  else console.log(`   ✅ Synced ${memDb.weather_data.length} weather records.`);

  console.log('\n🎉 Supabase Database sync complete!\n');
}

syncAll().catch(err => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
