from datetime import datetime, timedelta, timezone
import json
from .database import SessionLocal, engine, Base
from .models import User, Location, Warning, WarningArea, EmergencyResource, WeatherObservation, Forecast, Subscription

def utc_now():
    return datetime.now(timezone.utc)

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # If already seeded, refresh warning timestamps into the future so alerts remain active
    existing_warn = db.query(Warning).first()
    if existing_warn:
        future_exp = utc_now() + timedelta(days=7)
        for w in db.query(Warning).all():
            w.expires_at = future_exp
        for wa in db.query(WarningArea).all():
            wa.valid_to = future_exp
        db.commit()
        db.close()
        return

    # 1. Create Default Personas if not already present
    existing_user = db.query(User).filter(User.user_id == "usr-farmer-01").first()
    if not existing_user:
        farmer = User(
            user_id="usr-farmer-01",
            role="farmer",
            preferred_language="hi",
            voice_enabled=True,
            low_bandwidth_mode=False
        )
        ndrf = User(
            user_id="usr-ndrf-01",
            role="disaster_manager",
            preferred_language="en",
            voice_enabled=True,
            low_bandwidth_mode=False
        )
        fisherman = User(
            user_id="usr-fisherman-01",
            role="fisherman",
            preferred_language="te",
            voice_enabled=True,
            low_bandwidth_mode=False
        )
        citizen = User(
            user_id="usr-citizen-01",
            role="citizen",
            preferred_language="en",
            voice_enabled=True,
            low_bandwidth_mode=False
        )
        db.add_all([farmer, ndrf, fisherman, citizen])
        db.flush()

    # 2. Create Key Indian Locations
    existing_loc = db.query(Location).filter(Location.location_id == "loc-wardha").first()
    if not existing_loc:
        loc_wardha = Location(
            location_id="loc-wardha",
            user_id="usr-farmer-01",
            latitude=20.7453,
            longitude=78.6022,
            village="Sevagram",
            district="Wardha",
            state="Maharashtra",
            geohash="te7u9m",
            current_location=True
        )
        loc_puri = Location(
            location_id="loc-puri",
            user_id="usr-ndrf-01",
            latitude=19.8135,
            longitude=85.8312,
            village="Balukhand",
            district="Puri",
            state="Odisha",
            geohash="tgv1re",
            current_location=True
        )
        loc_mumbai = Location(
            location_id="loc-mumbai",
            user_id="usr-citizen-01",
            latitude=19.0760,
            longitude=72.8777,
            village="Dadar",
            district="Mumbai",
            state="Maharashtra",
            geohash="te7u80",
            current_location=True
        )
        loc_vizag = Location(
            location_id="loc-vizag",
            user_id="usr-fisherman-01",
            latitude=17.6868,
            longitude=83.2185,
            village="Fishing Harbour",
            district="Visakhapatnam",
            state="Andhra Pradesh",
            geohash="tg7j6e",
            current_location=True
        )
        loc_jaipur = Location(
            location_id="loc-jaipur",
            latitude=26.9124,
            longitude=75.7873,
            village="Sanganer",
            district="Jaipur",
            state="Rajasthan",
            geohash="tssk72",
            current_location=False
        )
        loc_wayanad = Location(
            location_id="loc-wayanad",
            latitude=11.6854,
            longitude=76.1320,
            village="Meppadi",
            district="Wayanad",
            state="Kerala",
            geohash="tds7re",
            current_location=False
        )
        db.add_all([loc_wardha, loc_puri, loc_mumbai, loc_vizag, loc_jaipur, loc_wayanad])
        db.flush()

    # 3. Create Weather Observations
    obs_wardha = WeatherObservation(
        observation_id="obs-wardha-01",
        location_id="loc-wardha",
        provider="IMD_AWS",
        temperature=29.5,
        rainfall=12.4,
        humidity=84.0,
        wind_speed=18.5,
        observed_at=utc_now()
    )
    obs_puri = WeatherObservation(
        observation_id="obs-puri-01",
        location_id="loc-puri",
        provider="IMD_DOPPLER_RADAR",
        temperature=27.0,
        rainfall=88.5,
        humidity=96.0,
        wind_speed=95.0,  # Cyclone Gale Winds
        observed_at=utc_now()
    )
    db.add_all([obs_wardha, obs_puri])
    db.flush()

    # 4. Create Active Warnings & Disaster Geofences
    # Cyclone Alert in Odisha (Puri) - RED ALERT
    warn_cyclone = Warning(
        warning_id="warn-cyclone-puri-01",
        location_id="loc-puri",
        hazard_type="CYCLONE",
        severity="RED",
        instructions="Extremely severe cyclonic storm approaching coast. Immediate evacuation from low-lying coastal areas to designated pucca cyclone shelters. Suspend all fishing and marine operations. Keep emergency go-bags ready.",
        provider="IMD_BHUBANESWAR_CAP",
        issued_at=utc_now() - timedelta(hours=2),
        expires_at=utc_now() + timedelta(days=7)
    )
    db.add(warn_cyclone)
    db.flush()

    area_cyclone = WarningArea(
        warning_area_id="area-puri-01",
        warning_id="warn-cyclone-puri-01",
        geofence=json.dumps({
            "type": "Polygon",
            "coordinates": [[
                [85.50, 19.50], [86.20, 19.50], [86.20, 20.20], [85.50, 20.20], [85.50, 19.50]
            ]]
        }),
        affected_districts="Puri, Jagatsinghpur, Kendrapara, Ganjam",
        area_size=4200.0,
        valid_from=utc_now() - timedelta(hours=2),
        valid_to=utc_now() + timedelta(days=7)
    )
    db.add(area_cyclone)

    # Heavy Monsoon Flood Alert in Wardha (Orange Alert)
    warn_flood = Warning(
        warning_id="warn-rain-wardha-01",
        location_id="loc-wardha",
        hazard_type="HEAVY_RAIN",
        severity="ORANGE",
        instructions="Isolated extremely heavy rainfall (65-115mm) expected in next 24 hours. Cotton and Soybean farmers advised to stop fertilizer spraying and clear drainage trenches immediately.",
        provider="IMD_NAGPUR_CAP",
        issued_at=utc_now() - timedelta(hours=1),
        expires_at=utc_now() + timedelta(days=7)
    )
    db.add(warn_flood)

    area_flood = WarningArea(
        warning_area_id="area-wardha-01",
        warning_id="warn-rain-wardha-01",
        geofence=json.dumps({
            "type": "Polygon",
            "coordinates": [[
                [78.30, 20.40], [78.90, 20.40], [78.90, 21.00], [78.30, 21.00], [78.30, 20.40]
            ]]
        }),
        affected_districts="Wardha, Nagpur, Chandrapur, Amravati",
        area_size=2800.0,
        valid_from=utc_now() - timedelta(hours=1),
        valid_to=utc_now() + timedelta(days=7)
    )
    db.add(area_flood)
    db.flush()

    # 5. Create Verified Emergency Resources (Hospitals, Shelters, Police, Fire Stations)
    res_1 = EmergencyResource(
        resource_id="res-puri-hosp",
        warning_area_id="area-puri-01",
        name="District Headquarters Hospital Puri",
        resource_type="hospital",
        latitude=19.8080,
        longitude=85.8250,
        address="Grand Road, Near Jagannath Temple, Puri, Odisha 752001",
        contact="102 / +91-6752-222033",
        source="ODISHA_HEALTH_REGISTRY",
        verified_at=utc_now() - timedelta(days=1),
        status="operational"
    )
    res_2 = EmergencyResource(
        resource_id="res-puri-shelter",
        warning_area_id="area-puri-01",
        name="Puri Multipurpose Cyclone Shelter #12",
        resource_type="shelter",
        latitude=19.8220,
        longitude=85.8450,
        address="Pentakota Coastal Zone, Puri, Odisha 752002",
        contact="Toll Free: 1077 / +91-6752-223400",
        source="OSDMA_REGISTRY",
        verified_at=utc_now() - timedelta(hours=3),
        status="operational"
    )
    res_3 = EmergencyResource(
        resource_id="res-puri-fire",
        warning_area_id="area-puri-01",
        name="Puri Town Fire Station & Disaster Rescue Unit",
        resource_type="fire_station",
        latitude=19.8150,
        longitude=85.8280,
        address="VIP Road, Puri, Odisha 752001",
        contact="101 / +91-6752-222101",
        source="ODISHA_FIRE_DISASTER_REGISTRY",
        verified_at=utc_now() - timedelta(days=2),
        status="operational"
    )
    res_4 = EmergencyResource(
        resource_id="res-puri-police",
        warning_area_id="area-puri-01",
        name="Sea Beach Police Station & Coastal Watch",
        resource_type="police_station",
        latitude=19.7990,
        longitude=85.8230,
        address="Chakratirtha Road, Puri, Odisha 752002",
        contact="112 / +91-6752-222055",
        source="ODISHA_POLICE_REGISTRY",
        verified_at=utc_now() - timedelta(days=1),
        status="operational"
    )
    res_5 = EmergencyResource(
        resource_id="res-wardha-hosp",
        warning_area_id="area-wardha-01",
        name="Wardha District Civil Hospital",
        resource_type="hospital",
        latitude=20.7480,
        longitude=78.5980,
        address="Civil Lines, Wardha, Maharashtra 442001",
        contact="102 / +91-7152-240100",
        source="MAHA_HEALTH_REGISTRY",
        verified_at=utc_now() - timedelta(days=1),
        status="operational"
    )
    res_6 = EmergencyResource(
        resource_id="res-wardha-agro",
        warning_area_id="area-wardha-01",
        name="Krishi Vigyan Kendra & Crop Emergency Advisory",
        resource_type="relief_centre",
        latitude=20.7390,
        longitude=78.6120,
        address="Sindi Road, Wardha, Maharashtra 442001",
        contact="Kisan Helpline: 1800-180-1551 / +91-7152-284500",
        source="ICAR_MAHA_REGISTRY",
        verified_at=utc_now() - timedelta(days=2),
        status="operational"
    )
    db.add_all([res_1, res_2, res_3, res_4, res_5, res_6])

    # 6. Default Subscriptions
    sub_1 = Subscription(
        subscription_id="sub-01",
        user_id="usr-farmer-01",
        location_id="loc-wardha",
        hazard_type="ALL",
        channel="SMS",
        minimum_severity="ORANGE_PLUS",
        active=True
    )
    sub_2 = Subscription(
        subscription_id="sub-02",
        user_id="usr-ndrf-01",
        location_id="loc-puri",
        hazard_type="CYCLONE",
        channel="PUSH",
        minimum_severity="YELLOW_PLUS",
        active=True
    )
    db.add_all([sub_1, sub_2])

    db.commit()
    db.close()
    print("AakashaVani Database Seeded Successfully with Indian Met Data & Emergency Resources!")
