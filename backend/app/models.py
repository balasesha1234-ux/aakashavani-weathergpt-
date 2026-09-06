from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Numeric, Index
from sqlalchemy.orm import relationship
import uuid

from .database import Base

def generate_uuid():
    return str(uuid.uuid4())

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=generate_uuid)
    phone_number = Column(String(20), unique=True, index=True, nullable=True)
    email = Column(String(150), unique=True, index=True, nullable=True)
    pm_kisan_id = Column(String(50), unique=True, index=True, nullable=True)
    name = Column(String(100), nullable=True)
    role = Column(String(30), default="citizen")
    user_role = Column(String(30), default="citizen")
    district = Column(String(100), default="Hyderabad")
    state = Column(String(100), default="Telangana")
    auth_provider = Column(String(30), default="PHONE_OTP")
    avatar_url = Column(String(255), nullable=True)
    preferred_language = Column(String(10), default="en")
    voice_enabled = Column(Boolean, default=True)
    low_bandwidth_mode = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=True)
    password_hash = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utc_now)
    last_login_at = Column(DateTime, default=utc_now)

    patterns = relationship("UserPattern", back_populates="user", uselist=False, cascade="all, delete-orphan")
    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    oauth_accounts = relationship("OAuthAccount", back_populates="user", cascade="all, delete-orphan")


class OAuthAccount(Base):
    __tablename__ = "oauth_accounts"
    __table_args__ = (
        Index("ix_oauth_provider_uid", "provider", "provider_user_id", unique=True),
    )

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    provider = Column(String(30), nullable=False)  # 'google' | 'apple'
    provider_user_id = Column(String(255), nullable=False)  # sub from provider
    email = Column(String(150), nullable=True, index=True)
    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)

    user = relationship("User", back_populates="oauth_accounts")


class OTPVerification(Base):
    __tablename__ = "otp_verifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    phone_number = Column(String(20), index=True, nullable=False)
    otp_code = Column(String(6), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    attempts = Column(Integer, default=0)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utc_now)


class UserPattern(Base):
    __tablename__ = "user_patterns"

    pattern_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False, unique=True)
    total_queries = Column(Integer, default=1)
    frequent_district = Column(String(100), default="Wardha")
    frequent_crops = Column(String(255), default="Cotton, Soybean")
    preferred_style = Column(String(50), default="Conversational & Empathetic")
    last_hazard_interest = Column(String(100), nullable=True)
    last_interaction = Column(DateTime, default=utc_now)

    user = relationship("User", back_populates="patterns")


class Location(Base):
    __tablename__ = "locations"
    __table_args__ = (
        Index("ix_locations_lat_lon", "latitude", "longitude"),
        Index("ix_locations_dist_curr", "district", "current_location"),
    )

    location_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), nullable=True)
    district = Column(String(100), index=True, nullable=False)
    state = Column(String(100), nullable=False)
    village = Column(String(100), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geohash = Column(String(20), nullable=True)
    current_location = Column(Boolean, default=True)
    elevation_m = Column(Float, default=0.0)
    primary_crop = Column(String(100), default="Cotton")
    has_coastal_zone = Column(Boolean, default=False)


class Warning(Base):
    __tablename__ = "warnings"
    __table_args__ = (
        Index("ix_warnings_expires_hazard", "expires_at", "hazard_type"),
    )

    warning_id = Column(String(36), primary_key=True, default=generate_uuid)
    location_id = Column(String(36), ForeignKey("locations.location_id"), nullable=True)
    hazard_type = Column(String(50), nullable=False)
    severity = Column(String(20), nullable=False)
    urgency = Column(String(20), default="Immediate")
    certainty = Column(String(20), default="Observed")
    headline = Column(String(255), nullable=True)
    instructions = Column(Text, nullable=False)
    provider = Column(String(50), default="IMD_CAP")
    issued_at = Column(DateTime, default=utc_now)
    expires_at = Column(DateTime, nullable=False)

    location = relationship("Location")
    warning_areas = relationship("WarningArea", back_populates="warning", cascade="all, delete-orphan")


class WarningArea(Base):
    __tablename__ = "warning_areas"

    warning_area_id = Column(String(36), primary_key=True, default=generate_uuid)
    warning_id = Column(String(36), ForeignKey("warnings.warning_id"), nullable=False)
    geofence = Column(Text, nullable=True)
    polygon_geojson = Column(Text, nullable=True)
    area_desc = Column(String(255), nullable=True)
    affected_districts = Column(String(255), nullable=False)
    area_size = Column(Float, default=1000.0)
    valid_from = Column(DateTime, default=utc_now)
    valid_to = Column(DateTime, default=utc_now)

    warning = relationship("Warning", back_populates="warning_areas")


class EmergencyResource(Base):
    __tablename__ = "emergency_resources"
    __table_args__ = (
        Index("ix_emergency_res_coords", "latitude", "longitude"),
        Index("ix_emergency_res_type_active", "resource_type", "is_active"),
    )

    resource_id = Column(String(36), primary_key=True, default=generate_uuid)
    warning_area_id = Column(String(36), ForeignKey("warning_areas.warning_area_id"), nullable=True)
    resource_type = Column(String(50), nullable=False)
    name = Column(String(150), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact = Column(String(50), nullable=False)
    source = Column(String(50), default="OSDMA")
    verified_at = Column(DateTime, default=utc_now)
    status = Column(String(30), default="operational")
    capacity = Column(Integer, default=500)
    is_active = Column(Boolean, default=True)


class WeatherObservation(Base):
    __tablename__ = "weather_observations"
    __table_args__ = (
        Index("ix_weather_obs_loc_time", "location_id", "observed_at"),
    )

    observation_id = Column(String(36), primary_key=True, default=generate_uuid)
    location_id = Column(String(36), ForeignKey("locations.location_id"), nullable=False)
    station_id = Column(String(50), default="IMD_AWS_01")
    provider = Column(String(50), default="IMD_AWS")
    temperature = Column(Float, default=30.0)
    temperature_c = Column(Float, default=30.0)
    feels_like_c = Column(Float, default=30.0)
    humidity = Column(Float, default=70.0)
    humidity_pct = Column(Integer, default=70)
    rainfall = Column(Float, default=0.0)
    rainfall_1h_mm = Column(Float, default=0.0)
    rainfall_24h_mm = Column(Float, default=0.0)
    wind_speed = Column(Float, default=15.0)
    wind_speed_kmh = Column(Float, default=15.0)
    wind_direction_deg = Column(Integer, default=0)
    pressure_hpa = Column(Float, default=1013.0)
    weather_condition = Column(String(50), default="Clear")
    observed_at = Column(DateTime, default=utc_now)


class Forecast(Base):
    __tablename__ = "forecasts"
    __table_args__ = (
        Index("ix_forecasts_loc_time", "location_id", "forecast_timestamp"),
    )

    forecast_id = Column(String(36), primary_key=True, default=generate_uuid)
    location_id = Column(String(36), ForeignKey("locations.location_id"), nullable=False)
    forecast_type = Column(String(20), default="DAILY")
    forecast_timestamp = Column(DateTime, default=utc_now)
    temp_max_c = Column(Float, default=33.0)
    temp_min_c = Column(Float, default=22.0)
    rain_probability_pct = Column(Integer, default=20)
    expected_rain_mm = Column(Float, default=0.0)
    condition = Column(String(50), default="Clear")
    nwp_model = Column(String(50), default="GFS_0.25")
    generated_at = Column(DateTime, default=utc_now)


class Subscription(Base):
    __tablename__ = "subscriptions"

    subscription_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False)
    location_id = Column(String(36), ForeignKey("locations.location_id"), nullable=True)
    hazard_type = Column(String(50), default="ALL")
    channel = Column(String(20), default="SMS")
    minimum_severity = Column(String(30), default="ORANGE_PLUS")
    crop_type = Column(String(50), default="Cotton")
    active = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="subscriptions")


class Feedback(Base):
    __tablename__ = "feedbacks"

    feedback_id = Column(String(36), primary_key=True, default=generate_uuid)
    message_id = Column(String(36), nullable=False)
    rating = Column(Integer, default=5)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utc_now)


class DataSource(Base):
    __tablename__ = "data_sources"

    source_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    provider = Column(String(50), nullable=False)
    status = Column(String(20), default="ACTIVE")
    last_sync = Column(DateTime, default=utc_now)


class ResponseTrace(Base):
    __tablename__ = "response_traces"

    trace_id = Column(String(36), primary_key=True, default=generate_uuid)
    message_id = Column(String(36), nullable=False)
    confidence = Column(Float, default=0.980)
    latency_ms = Column(Integer, default=180)
    safety_status = Column(String(30), default="VERIFIED")
    generated_at = Column(DateTime, default=utc_now)
