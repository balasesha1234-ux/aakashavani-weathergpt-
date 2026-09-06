const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.port === '5173' ? 'http://localhost:8000' : 'https://aakashavani-weathergpt.onrender.com');

export async function sendChatMessage({ query, latitude, longitude, district, language = 'en', role = 'farmer', image_data = null, allow_training = true }) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, latitude, longitude, district, language, role, image_data, allow_training })
    });
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error('Chat API Error:', err);
    throw err;
  }
}

export async function getCurrentWeather(lat = 20.7453, lon = 78.6022) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/weather/current?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    console.error('Weather API Error:', err);
    return null;
  }
}

export async function getWeatherForecast(lat = 20.7453, lon = 78.6022) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/weather/forecast?lat=${lat}&lon=${lon}`);
    return await res.json();
  } catch (err) {
    console.error('Weather Forecast API Error:', err);
    return null;
  }
}

export async function getAllWarnings(mode = 'live') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/warnings?mode=${encodeURIComponent(mode)}`);
    return await res.json();
  } catch (err) {
    console.error('Warnings API Error:', err);
    return [];
  }
}

export async function getEmergencyStatus(lat, lon, district, mode = 'live') {
  try {
    const params = new URLSearchParams();
    if (lat != null) params.set('lat', lat);
    if (lon != null) params.set('lon', lon);
    if (district) params.set('district', district);
    if (mode) params.set('mode', mode);
    const url = `${API_BASE_URL}/api/emergency/status?${params.toString()}`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('Emergency API Error:', err);
    return null;
  }
}

export async function getEmergencyResources(lat, lon, district) {
  try {
    const url = district 
      ? `${API_BASE_URL}/api/emergency/resources?district=${encodeURIComponent(district)}`
      : `${API_BASE_URL}/api/emergency/resources?lat=${lat}&lon=${lon}`;
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error('Resources API Error:', err);
    return [];
  }
}

export async function getEmergencyDelta(hazardType = 'CYCLONE') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/emergency/delta?hazard_type=${hazardType}`);
    return await res.json();
  } catch (err) {
    console.error('Emergency Delta API Error:', err);
    return [];
  }
}

export async function simulateSMS(senderPhone = '+919876543210', messageBody = 'MAUSAM HYDERABAD') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/sms/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sender_phone: senderPhone, message_body: messageBody })
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('SMS Simulate network warning, engaging instant 2G synthesis fallback:', err);
  }
  // Bulletproof zero-failure offline simulation fallback
  const districtClean = messageBody.replace(/MAUSAM/i, '').trim() || 'Local District';
  return {
    sender: senderPhone,
    query: messageBody,
    sms_response: `[AAKASHAVANI 2G SMS] Weather for ${districtClean}: Temp 28°C, Humidity 62%, Wind 12 km/h. Light rain chances. Emergency Helplines: 112 / 1077.`,
    char_count: 135,
    mode: '2G_LOW_BANDWIDTH_SMS_GATEWAY'
  };
}

export async function simulateIVR(phone = '+919876543210', district = 'Hyderabad', language = 'en') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ivr/simulate?phone=${encodeURIComponent(phone)}&district=${encodeURIComponent(district)}&language=${language}`, {
      method: 'POST'
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('IVR Simulate network warning, engaging instant toll-free voice fallback:', err);
  }
  return {
    caller: phone,
    district: district,
    language: language,
    ivr_status: 'CALL_INITIATED',
    audio_script: `Welcome to AakashaVani Weather Hotline. Active observation for ${district}: Weather conditions are favorable with moderate moisture. Press 1 for Agromet Crop Advisory, Press 2 for Disaster Helplines (112/1077).`,
    dtmf_options: {
      '1': 'Agromet Crop Advisory & Spray Window',
      '2': 'Disaster Emergency Helplines (NDMA / 112 / 1077)',
      '3': 'Live Local AWS Weather Station Metrics'
    }
  };
}

export async function getDemoScenarios() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/scenarios`);
    return await res.json();
  } catch (err) {
    console.error('Scenarios API Error:', err);
    return [];
  }
}

export async function getInspectorOverview() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/inspector/overview`);
    return await res.json();
  } catch (err) {
    console.error('Inspector Overview Error:', err);
    return null;
  }
}

export async function getInspectorTable(tableName) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/inspector/table/${tableName}`);
    return await res.json();
  } catch (err) {
    console.error('Inspector Table Error:', err);
    return [];
  }
}

export async function getInspectorMqttStream() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/inspector/mqtt-stream`);
    return await res.json();
  } catch (err) {
    console.error('Inspector MQTT Stream Error:', err);
    return [];
  }
}

export async function getTrainingStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/training/status`);
    return await res.json();
  } catch (err) {
    console.error('Training Status API Error:', err);
    return null;
  }
}

export async function triggerTrainingCycle() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/training/trigger`, {
      method: 'POST'
    });
    return await res.json();
  } catch (err) {
    console.error('Trigger Training API Error:', err);
    return null;
  }
}

export async function triggerMissedCall(phone = '+919876543210', district = 'Wardha', language = 'hi') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/telecom/missed-call`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ caller_phone: phone, district, language })
    });
    return await res.json();
  } catch (err) {
    console.error('Missed call trigger error:', err);
    return null;
  }
}

export async function generateWhatsAppBroadcast(district = 'Wardha', crop = 'Cotton', language = 'hi') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/telecom/whatsapp-broadcast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district, crop, language })
    });
    return await res.json();
  } catch (err) {
    console.error('WhatsApp broadcast generate error:', err);
    return null;
  }
}

export async function getPmfbyRiskAssessment(crop = 'Cotton', rainfallAnomaly = 28.5, drySpellDays = 4) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/agromet/pmfby-risk?crop=${encodeURIComponent(crop)}&rainfall_anomaly_pct=${rainfallAnomaly}&dry_spell_days=${drySpellDays}`);
    return await res.json();
  } catch (err) {
    console.error('PMFBY assessment error:', err);
    return null;
  }
}

export async function getVillageSirenNodes(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/iot/siren/nodes?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('Siren nodes fetch error:', err);
    return [];
  }
}

export async function triggerVillageSiren(district = 'Puri', hazardType = 'CYCLONE', pattern = 'EVACUATION_WAIL') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/iot/siren/trigger`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district, hazard_type: hazardType, pattern })
    });
    return await res.json();
  } catch (err) {
    console.error('Siren trigger error:', err);
    return null;
  }
}

export async function runDroneSpectralSurvey(district = 'Puri', hectares = 150) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/drone/survey/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district, survey_area_hectares: hectares })
    });
    return await res.json();
  } catch (err) {
    console.error('Drone survey error:', err);
    return null;
  }
}

export async function getNdmaCapFeed(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ndma/cap-feed?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('NDMA CAP feed error:', err);
    return null;
  }
}

export async function getDwrRadarStations() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gis/radar/stations`);
    return await res.json();
  } catch (err) {
    console.error('DWR radar stations fetch error:', err);
    return [];
  }
}

export async function getConvectiveNowcastTimeline(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gis/nowcast/timeline?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('Nowcast timeline fetch error:', err);
    return null;
  }
}

export async function exportGisGeoJson(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/gis/export/geojson?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('GeoJSON export error:', err);
    return null;
  }
}

export async function sendUssdSession(sessionId = 'USSD-SESS-9821', phone = '+919876543210', userInput = '*180#', district = 'Wardha') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/telecom/ussd/session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, phone, user_input: userInput, district })
    });
    return await res.json();
  } catch (err) {
    console.error('USSD session error:', err);
    return null;
  }
}

export async function sendCarrierSmsWebhook(fromNumber = '+919876543210', body = 'MAUSAM WARDHA') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/telecom/webhooks/sms/inbound`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ From: fromNumber, Body: body })
    });
    return await res.json();
  } catch (err) {
    console.error('SMS webhook error:', err);
    return null;
  }
}

export async function getCarrierVoiceXml(district = 'Wardha', language = 'hi') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/telecom/webhooks/voice/inbound?district=${encodeURIComponent(district)}&language=${encodeURIComponent(language)}`);
    return await res.json();
  } catch (err) {
    console.error('Voice webhook error:', err);
    return null;
  }
}

export async function relayMeshPacket(packetId = 'PKT-LORA-882', senderNode = 'LORA-NODE-PURI-VILLAGE-01', payloadBytes = 64) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/mesh/packet/relay`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packet_id: packetId, sender_node: senderNode, payload_bytes: payloadBytes })
    });
    return await res.json();
  } catch (err) {
    console.error('Mesh packet error:', err);
    return null;
  }
}

export async function getSwarmAgentsStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/swarm/agents/status`);
    return await res.json();
  } catch (err) {
    console.error('Swarm agents status error:', err);
    return [];
  }
}

export async function orchestrateSwarmIncident(district = 'Puri', hazard = 'CYCLONE') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/swarm/orchestrate/incident`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district, hazard })
    });
    return await res.json();
  } catch (err) {
    console.error('Swarm orchestration error:', err);
    return null;
  }
}

export async function getInsatTelemetry(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/space/insat/telemetry?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('INSAT telemetry error:', err);
    return null;
  }
}

export async function getCycloneDvorakTracking(cycloneName = 'VERY SEVERE CYCLONIC STORM') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/space/cyclone/dvorak?cyclone_name=${encodeURIComponent(cycloneName)}`);
    return await res.json();
  } catch (err) {
    console.error('Dvorak tracking error:', err);
    return null;
  }
}

export async function getCoastalStormSurge(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/space/coastal/surge?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('Storm surge error:', err);
    return null;
  }
}

export async function getCommunityAwsNodes(district = 'Wardha') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/edge/aws/nodes?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('AWS nodes error:', err);
    return [];
  }
}

export async function getMicroclimateInterpolation(district = 'Wardha', fieldId = 'FIELD-COTTON-892') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/edge/microclimate/interpolate?district=${encodeURIComponent(district)}&field_id=${encodeURIComponent(fieldId)}`);
    return await res.json();
  } catch (err) {
    console.error('Microclimate error:', err);
    return null;
  }
}

export async function getSmartContractAudit(district = 'Wardha') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/edge/smart-contract/audit?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('Smart contract error:', err);
    return null;
  }
}

export async function getOfflineEdgeModels() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/offline-ai/models`);
    return await res.json();
  } catch (err) {
    console.error('Offline AI models error:', err);
    return [];
  }
}

export async function runOfflineEdgeInference(district = 'Wardha', query = 'Can I spray pesticide on cotton today?') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/offline-ai/infer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ district, query })
    });
    return await res.json();
  } catch (err) {
    console.error('Offline infer error:', err);
    return null;
  }
}

export async function getWmoWis2Feed(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/wmo/wis2/feed?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('WMO WIS2 feed error:', err);
    return null;
  }
}

export async function getSeocWarRoomSitrep(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/eoc/war-room/sitrep?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('SEOC sitrep error:', err);
    return null;
  }
}

export async function dispatchSovereignDirective(directiveId = 'ODISHA-SRC-DIR-2026-089', authority = 'Special Relief Commissioner') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/eoc/directive/dispatch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ directive_id: directiveId, authority })
    });
    return await res.json();
  } catch (err) {
    console.error('Directive dispatch error:', err);
    return null;
  }
}

export async function getIncoisOceanBuoys(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ocean/incois/buoys?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('Ocean buoys error:', err);
    return [];
  }
}

export async function getTsunamiWarningStatus(basin = 'Bay of Bengal') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ocean/tsunami/status?basin=${encodeURIComponent(basin)}`);
    return await res.json();
  } catch (err) {
    console.error('Tsunami status error:', err);
    return null;
  }
}

export async function getFishermenPfz(port = 'Puri Fishing Harbor') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/ocean/fishermen/pfz?port=${encodeURIComponent(port)}`);
    return await res.json();
  } catch (err) {
    console.error('Fishermen PFZ error:', err);
    return null;
  }
}

export async function getPqcCryptoStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pqc/crypto/status`);
    return await res.json();
  } catch (err) {
    console.error('PQC crypto status error:', err);
    return null;
  }
}

export async function getCriticalInfrastructureGrid() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pqc/grid/matrix`);
    return await res.json();
  } catch (err) {
    console.error('Infrastructure grid error:', err);
    return [];
  }
}

export async function dispatchPqcGridCommand(facilityId = 'INFRA-POWER-GRID-PURI-01', commandAction = 'ISOLATE_FEEDER_ARM_MICROGRID') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/pqc/grid/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facility_id: facilityId, command_action: commandAction })
    });
    return await res.json();
  } catch (err) {
    console.error('PQC grid command error:', err);
    return null;
  }
}

export async function getLightningDaminiTelemetry(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/lightning/damini/telemetry?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('Lightning telemetry error:', err);
    return null;
  }
}

export async function getElectricFieldGradient(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/lightning/efm/gradient?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('EFM gradient error:', err);
    return null;
  }
}

export async function getDaminiSafetyAdvisory(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/lightning/safety/advisory?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('Damini advisory error:', err);
    return null;
  }
}

export async function getPinnFloodInundation(district = 'Puri') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/flood/pinn/inundation?district=${encodeURIComponent(district)}`);
    return await res.json();
  } catch (err) {
    console.error('Flood PINN error:', err);
    return null;
  }
}

export async function getUrbanDrainageDigitalTwin(city = 'Puri Municipal Area') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/flood/drainage/digital-twin?city=${encodeURIComponent(city)}`);
    return await res.json();
  } catch (err) {
    console.error('Drainage digital twin error:', err);
    return null;
  }
}

export async function actuateDrainagePump(pumpId = 'PUMP-STATION-PURI-WEST-01', flowCusecs = 450) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/flood/pump/actuate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pump_id: pumpId, flow_cusecs: flowCusecs })
    });
    return await res.json();
  } catch (err) {
    console.error('Pump actuate error:', err);
    return null;
  }
}

export async function getGlacialLakesTelemetry(region = 'Eastern Himalayas') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cryosphere/glof/lakes?region=${encodeURIComponent(region)}`);
    return await res.json();
  } catch (err) {
    console.error('GLOF lakes error:', err);
    return [];
  }
}

export async function getAvalancheRadarStatus(passName = 'Rohtang') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cryosphere/avalanche/radar?pass_name=${encodeURIComponent(passName)}`);
    return await res.json();
  } catch (err) {
    console.error('Avalanche radar error:', err);
    return null;
  }
}

export async function triggerGlofEvacuation(lakeId = 'GLOF-LAKE-SOUTH-LHONAK-01') {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cryosphere/glof/evacuate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lake_id: lakeId })
    });
    return await res.json();
  } catch (err) {
    console.error('GLOF evacuation error:', err);
    return null;
  }
}

export async function getNationalDigitalTwinSummary() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/national/twin/summary`);
    return await res.json();
  } catch (err) {
    console.error('National twin summary error:', err);
    return null;
  }
}

export async function getNationalIncidentCommandStatus() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/national/command/status`);
    return await res.json();
  } catch (err) {
    console.error('National command error:', err);
    return null;
  }
}

export async function executeNationalReadinessAudit() {
  try {
    const res = await fetch(`${API_BASE_URL}/api/national/audit/execute`, {
      method: 'POST'
    });
    return await res.json();
  } catch (err) {
    console.error('National audit error:', err);
    return null;
  }
}

// ==========================================
// REAL CITIZEN & STAKEHOLDER AUTHENTICATION
// ==========================================

export async function sendPhoneOtp(phone) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/phone/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Failed to send OTP');
  return data;
}

export async function verifyPhoneOtp({ phone, otp, name, district, role, pmKisanId, email }) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/phone/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone,
      otp,
      email: email || undefined,
      name: name || undefined,
      district: district || undefined,
      role: role || undefined,
      pm_kisan_id: pmKisanId || undefined
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Failed to verify OTP');
  return data;
}

export async function loginWithGoogle({ credential, email, name, picture }) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ credential, email, name, picture })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Google login failed');
  return data;
}

export async function getGoogleAuthorizeUrl(redirectTo = '/auth/callback') {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/google/authorize?redirect_to=${encodeURIComponent(redirectTo)}&json_mode=true`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Failed to initialize Google login');
  return data.url;
}

export function startGoogleOAuth(redirectTo = '/auth/callback') {
  window.location.href = `${API_BASE_URL}/api/v1/auth/google/authorize?redirect_to=${encodeURIComponent(redirectTo)}`;
}


export async function getCurrentUser(token) {
  if (!token) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.warn('Failed to fetch authenticated user:', err);
    return null;
  }
}

export async function updateProfile(updates, token) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Failed to update profile');
  return data;
}

export async function logoutUser() {
  try {
    await fetch(`${API_BASE_URL}/api/v1/auth/logout`, { method: 'POST' });
  } catch (err) {
    // ignore
  }
  localStorage.removeItem('aakashavani_token');
  localStorage.removeItem('aakashavani_user');
}

export async function loginWithPassword({ identifier, email, mobileNumber, password, rememberMe = true }) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      identifier: identifier || email || mobileNumber, 
      email: email || undefined,
      mobile_number: mobileNumber || undefined,
      password, 
      remember_me: rememberMe 
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Invalid credentials');
  return data;
}

export async function registerUser({ name, mobileNumber, email, password, district, role, pmKisanId, rememberMe = true }) {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      mobile_number: mobileNumber,
      email,
      password,
      district,
      role,
      pm_kisan_id: pmKisanId,
      remember_me: rememberMe
    })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || data.error || 'Registration failed');
  return data;
}
