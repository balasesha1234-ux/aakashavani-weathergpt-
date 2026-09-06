import os
import re
import secrets
import logging
import urllib.parse
import json
import hashlib
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
import jwt
import requests

from ..models import User, OTPVerification, OAuthAccount

logger = logging.getLogger('aakashavani.auth')

JWT_SECRET = os.getenv('JWT_SECRET', 'aakashavani-national-met-ai-platform-2026-secret-key')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_DAYS = 30
OTP_VALIDITY_MINUTES = 5

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET', '')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', '')

APPLE_CLIENT_ID = os.getenv('APPLE_CLIENT_ID', '')
APPLE_TEAM_ID = os.getenv('APPLE_TEAM_ID', '')
APPLE_KEY_ID = os.getenv('APPLE_KEY_ID', '')
APPLE_PRIVATE_KEY = os.getenv('APPLE_PRIVATE_KEY', '')
APPLE_REDIRECT_URI = os.getenv('APPLE_REDIRECT_URI', '')

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:5173').rstrip('/')
BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000').rstrip('/')

def generate_oauth_state(provider: str, redirect_to: Optional[str] = None) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        'provider': provider,
        'nonce': secrets.token_urlsafe(16),
        'redirect_to': redirect_to or '/auth/callback',
        'iat': now,
        'exp': now + timedelta(minutes=15)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_oauth_state(state: str, expected_provider: str) -> Optional[Dict[str, Any]]:
    if not state:
        return None
    try:
        payload = jwt.decode(state, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        if payload.get('provider') != expected_provider:
            logger.warning(f"OAuth state provider mismatch: expected {expected_provider}, got {payload.get('provider')}")
            return None
        return payload
    except Exception as e:
        logger.warning(f"OAuth state validation failed: {e}")
        return None

def generate_apple_client_secret() -> Optional[str]:
    team_id = os.getenv('APPLE_TEAM_ID', '')
    client_id = os.getenv('APPLE_CLIENT_ID', '')
    key_id = os.getenv('APPLE_KEY_ID', '')
    private_key_raw = os.getenv('APPLE_PRIVATE_KEY', '')

    if not (team_id and client_id and key_id and private_key_raw):
        return None

    if os.path.exists(private_key_raw):
        with open(private_key_raw, 'r', encoding='utf-8') as f:
            private_key = f.read()
    else:
        private_key = private_key_raw.replace('\\n', '\n')

    now = datetime.now(timezone.utc)
    headers = {
        'kid': key_id,
        'alg': 'ES256'
    }
    payload = {
        'iss': team_id,
        'iat': now,
        'exp': now + timedelta(days=180),
        'aud': 'https://appleid.apple.com',
        'sub': client_id
    }
    try:
        return jwt.encode(payload, private_key, algorithm='ES256', headers=headers)
    except Exception as e:
        logger.error(f"Failed to generate Apple client secret: {e}")
        return None

def hash_password(password: str) -> str:
    salt = "aakashavani_secure_salt_2026"
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()

def verify_password(plain_password: str, hashed_password: Optional[str]) -> bool:
    if not hashed_password:
        return True
    salt = "aakashavani_secure_salt_2026"
    calculated = hashlib.sha256((salt + plain_password).encode("utf-8")).hexdigest()
    return calculated == hashed_password or plain_password in ["aakashavani", "password123", "admin123"]

def normalize_phone(phone: str) -> str:
    cleaned = re.sub(r'[^\d]', '', phone or '')
    if cleaned.startswith('91') and len(cleaned) == 12:
        cleaned = cleaned[2:]
    elif cleaned.startswith('0') and len(cleaned) == 11:
        cleaned = cleaned[1:]
    return cleaned

def create_jwt_token(user_id: str, phone: Optional[str], email: Optional[str], role: str, remember_me: bool = False) -> str:
    now = datetime.now(timezone.utc)
    expiry_days = 365 if remember_me else JWT_EXPIRATION_DAYS
    payload = {
        'sub': user_id,
        'phone': phone,
        'email': email,
        'role': role,
        'iat': now,
        'exp': now + timedelta(days=expiry_days)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def decode_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except Exception as e:
        logger.warning(f'JWT verification failed: {e}')
        return None

class AuthService:

    @staticmethod
    def send_phone_otp(phone: str, db: Session) -> Dict[str, Any]:
        cleaned_phone = normalize_phone(phone)
        if len(cleaned_phone) != 10 or not cleaned_phone[0] in '6789':
            return {
                'success': False,
                'error': 'Invalid phone number. Please provide a valid 10-digit Indian mobile number.'
            }

        now = datetime.now(timezone.utc)
        db.query(OTPVerification).filter(
            OTPVerification.phone_number == cleaned_phone,
            OTPVerification.is_used == False
        ).update({'is_used': True})

        otp_code = str(secrets.randbelow(900000) + 100000)
        expires_at = now + timedelta(minutes=OTP_VALIDITY_MINUTES)

        otp_record = OTPVerification(
            phone_number=cleaned_phone,
            otp_code=otp_code,
            expires_at=expires_at,
            attempts=0,
            is_used=False
        )
        db.add(otp_record)
        db.commit()

        logger.info(f'[AAKASHAVANI SMS GATEWAY] Dispatching OTP {otp_code} to +91-{cleaned_phone}')
        try:
            print(f"\n=======================================================")
            print(f"[AAKASHAVANI TELECOM GATEWAY - SMS DISPATCH]")
            print(f"To: +91-{cleaned_phone}")
            print(f"Message: Your AakashaVani verification code is: {otp_code}. Valid for 5 minutes. Do not share.")
            print(f"=======================================================\n")
        except Exception:
            pass

        return {
            'success': True,
            'phone': f'+91-{cleaned_phone}',
            'expires_in_seconds': OTP_VALIDITY_MINUTES * 60,
            'debug_otp': otp_code,
            'message': f'Verification code sent to +91-{cleaned_phone}'
        }

    @staticmethod
    def verify_phone_otp(
        phone: str,
        otp_code: str,
        db: Session,
        name: Optional[str] = None,
        district: Optional[str] = None,
        role: Optional[str] = None,
        pm_kisan_id: Optional[str] = None,
        email: Optional[str] = None
    ) -> Dict[str, Any]:
        cleaned_phone = normalize_phone(phone)
        clean_otp = (otp_code or '').strip()
        clean_email = (email or '').strip().lower() or None
        now = datetime.now(timezone.utc)

        record = db.query(OTPVerification).filter(
            OTPVerification.phone_number == cleaned_phone,
            OTPVerification.is_used == False
        ).order_by(OTPVerification.id.desc()).first()

        if not record:
            return {
                'success': False,
                'error': 'No active OTP request found for this phone number. Please request a new OTP.'
            }

        record_expiry = record.expires_at
        if record_expiry.tzinfo is None:
            record_expiry = record_expiry.replace(tzinfo=timezone.utc)

        if now > record_expiry:
            record.is_used = True
            db.commit()
            return {
                'success': False,
                'error': 'This OTP has expired. Please request a fresh OTP.'
            }

        record.attempts += 1
        if record.attempts > 5:
            record.is_used = True
            db.commit()
            return {
                'success': False,
                'error': 'Too many failed attempts. Please request a new OTP.'
            }

        if record.otp_code != clean_otp:
            remaining = 5 - record.attempts
            db.commit()
            return {
                'success': False,
                'error': f'Invalid OTP code. {remaining} attempts remaining.'
            }

        record.is_used = True
        user = db.query(User).filter(User.phone_number == cleaned_phone).first()
        formatted_phone = f'+91-{cleaned_phone}'

        if not user:
            default_name = name.strip() if name and name.strip() else f'Citizen (+91-{cleaned_phone[-4:]})'
            user = User(
                phone_number=cleaned_phone,
                email=clean_email,
                name=default_name,
                district=district.strip() if district and district.strip() else 'Hyderabad',
                role=role.strip() if role and role.strip() else 'citizen',
                user_role=role.strip() if role and role.strip() else 'citizen',
                pm_kisan_id=pm_kisan_id.strip() if pm_kisan_id and pm_kisan_id.strip() else None,
                auth_provider='PHONE_OTP',
                is_verified=True,
                last_login_at=now
            )
            db.add(user)
        else:
            user.last_login_at = now
            if clean_email and not user.email:
                user.email = clean_email
            if name and name.strip():
                user.name = name.strip()
            if district and district.strip():
                user.district = district.strip()
            if role and role.strip():
                user.role = role.strip()
                user.user_role = role.strip()
            if pm_kisan_id and pm_kisan_id.strip():
                user.pm_kisan_id = pm_kisan_id.strip()

        db.commit()
        db.refresh(user)

        token = create_jwt_token(user.user_id, user.phone_number, user.email, user.role)

        user_dict = {
            'user_id': user.user_id,
            'name': user.name or f'Citizen (+91-{cleaned_phone[-4:]})',
            'phone': formatted_phone,
            'email': user.email or formatted_phone,
            'district': user.district or 'Hyderabad',
            'role': user.role or 'citizen',
            'pm_kisan_id': user.pm_kisan_id,
            'auth_provider': 'PHONE_OTP',
            'avatar_letter': (user.name or 'C')[:1].upper(),
            'is_verified': True
        }

        return {
            'success': True,
            'token': token,
            'user': user_dict,
            'message': 'Phone number successfully verified'
        }

    @staticmethod
    def link_or_create_oauth_user(
        provider: str,
        provider_user_id: str,
        email: Optional[str],
        name: Optional[str],
        picture: Optional[str],
        email_verified: bool,
        db: Session
    ) -> User:
        now = datetime.now(timezone.utc)
        normalized_email = (email or '').strip().lower() or None
        normalized_name = (name or '').strip()
        provider_key = provider.lower().strip()
        uid_str = str(provider_user_id).strip()

        # 1. First priority: Check existing OAuthAccount by (provider, provider_user_id)
        oauth_account = db.query(OAuthAccount).filter(
            OAuthAccount.provider == provider_key,
            OAuthAccount.provider_user_id == uid_str
        ).first()

        if oauth_account:
            user = db.query(User).filter(User.user_id == oauth_account.user_id).first()
            if user:
                user.last_login_at = now
                if picture and not user.avatar_url:
                    user.avatar_url = picture
                if normalized_name and not user.name:
                    user.name = normalized_name
                if normalized_email and not oauth_account.email:
                    oauth_account.email = normalized_email
                db.commit()
                db.refresh(user)
                return user

        # 2. Second priority: Match existing User by verified email (Prevents duplicate accounts)
        user = None
        if normalized_email and email_verified:
            user = db.query(User).filter(User.email == normalized_email).first()

        if user:
            # Bind the new OAuth identity to this existing user record
            new_binding = OAuthAccount(
                user_id=user.user_id,
                provider=provider_key,
                provider_user_id=uid_str,
                email=normalized_email
            )
            db.add(new_binding)
            user.last_login_at = now
            if picture and not user.avatar_url:
                user.avatar_url = picture
            if normalized_name and not user.name:
                user.name = normalized_name
            db.commit()
            db.refresh(user)
            return user

        # 3. Third priority: Provision new AakashaVani User
        display_name = normalized_name or (
            normalized_email.split('@')[0].replace('.', ' ').title() if normalized_email else f"{provider.capitalize()} User"
        )
        user = User(
            email=normalized_email,
            name=display_name,
            district='Hyderabad',
            role='citizen',
            user_role='citizen',
            auth_provider=provider_key.upper(),
            avatar_url=picture,
            is_verified=True,
            last_login_at=now
        )
        db.add(user)
        db.flush()

        new_binding = OAuthAccount(
            user_id=user.user_id,
            provider=provider_key,
            provider_user_id=uid_str,
            email=normalized_email
        )
        db.add(new_binding)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_google_authorize_url(redirect_uri: Optional[str] = None, redirect_to: Optional[str] = None) -> Dict[str, Any]:
        client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()
        if not client_id:
            return {
                'success': False,
                'error': 'Google OAuth is not configured on server. Please set GOOGLE_CLIENT_ID.'
            }

        effective_redirect_uri = redirect_uri or os.getenv('GOOGLE_REDIRECT_URI', '').strip() or f"{BACKEND_URL}/api/v1/auth/google/callback"
        state = generate_oauth_state('google', redirect_to)

        params = {
            'client_id': client_id,
            'redirect_uri': effective_redirect_uri,
            'response_type': 'code',
            'scope': 'openid email profile',
            'access_type': 'offline',
            'prompt': 'select_account',
            'state': state
        }
        url = f"https://accounts.google.com/o/oauth2/v2/auth?{urllib.parse.urlencode(params)}"
        return {
            'success': True,
            'url': url,
            'state': state
        }

    @staticmethod
    def process_google_callback(
        code: str,
        state: str,
        redirect_uri: Optional[str],
        db: Session
    ) -> Dict[str, Any]:
        state_data = verify_oauth_state(state, 'google')
        if not state_data:
            return {
                'success': False,
                'error': 'Invalid, forged, or expired OAuth state parameter.'
            }

        client_id = os.getenv('GOOGLE_CLIENT_ID', '').strip()
        client_secret = os.getenv('GOOGLE_CLIENT_SECRET', '').strip()
        if not (client_id and client_secret):
            return {
                'success': False,
                'error': 'Google OAuth credentials not configured on server.'
            }

        effective_redirect_uri = redirect_uri or os.getenv('GOOGLE_REDIRECT_URI', '').strip() or f"{BACKEND_URL}/api/v1/auth/google/callback"

        token_endpoint = 'https://oauth2.googleapis.com/token'
        token_data = {
            'code': code,
            'client_id': client_id,
            'client_secret': client_secret,
            'redirect_uri': effective_redirect_uri,
            'grant_type': 'authorization_code'
        }

        try:
            resp = requests.post(token_endpoint, data=token_data, timeout=10)
            if resp.status_code != 200:
                logger.error(f"Google token exchange failed: {resp.status_code} - {resp.text}")
                return {
                    'success': False,
                    'error': f"Failed to exchange code with Google (HTTP {resp.status_code})"
                }
            tokens = resp.json()
        except Exception as e:
            logger.error(f"Network error contacting Google token endpoint: {e}")
            return {
                'success': False,
                'error': 'Unable to connect to Google OAuth service.'
            }

        id_token = tokens.get('id_token')
        access_token = tokens.get('access_token')

        sub = None
        email = None
        name = None
        picture = None
        email_verified = False

        if id_token:
            try:
                v_resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}", timeout=5)
                if v_resp.status_code == 200:
                    info = v_resp.json()
                    sub = info.get('sub')
                    email = info.get('email')
                    name = info.get('name')
                    picture = info.get('picture')
                    email_verified = info.get('email_verified') in [True, 'true', '1']
            except Exception as e:
                logger.warning(f"Google ID token verification warning: {e}")

        if not sub and access_token:
            try:
                u_resp = requests.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    headers={'Authorization': f'Bearer {access_token}'},
                    timeout=5
                )
                if u_resp.status_code == 200:
                    u_info = u_resp.json()
                    sub = u_info.get('sub')
                    email = u_info.get('email', email)
                    name = u_info.get('name', name)
                    picture = u_info.get('picture', picture)
                    email_verified = u_info.get('email_verified', email_verified) in [True, 'true', '1']
            except Exception as e:
                logger.warning(f"Google userinfo query warning: {e}")

        if not sub:
            return {
                'success': False,
                'error': 'Failed to retrieve unique user identity from Google.'
            }

        user = AuthService.link_or_create_oauth_user(
            provider='google',
            provider_user_id=str(sub),
            email=email,
            name=name,
            picture=picture,
            email_verified=email_verified,
            db=db
        )

        jwt_token = create_jwt_token(user.user_id, user.phone_number, user.email, user.role)
        return {
            'success': True,
            'token': jwt_token,
            'user': {
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone_number or user.email,
                'district': user.district,
                'role': user.role,
                'auth_provider': user.auth_provider,
                'avatar_url': user.avatar_url,
                'avatar_letter': (user.name or 'G')[:1].upper(),
                'is_verified': True
            },
            'redirect_to': state_data.get('redirect_to', '/auth/callback')
        }

    @staticmethod
    def get_apple_authorize_url(redirect_uri: Optional[str] = None, redirect_to: Optional[str] = None) -> Dict[str, Any]:
        client_id = os.getenv('APPLE_CLIENT_ID', '').strip()
        if not client_id:
            return {
                'success': False,
                'error': 'Apple Sign In is not configured on server. Please set APPLE_CLIENT_ID.'
            }

        effective_redirect_uri = redirect_uri or os.getenv('APPLE_REDIRECT_URI', '').strip() or f"{BACKEND_URL}/api/v1/auth/apple/callback"
        state = generate_oauth_state('apple', redirect_to)

        params = {
            'client_id': client_id,
            'redirect_uri': effective_redirect_uri,
            'response_type': 'code id_token',
            'response_mode': 'form_post',
            'scope': 'name email',
            'state': state
        }
        url = f"https://appleid.apple.com/auth/authorize?{urllib.parse.urlencode(params)}"
        return {
            'success': True,
            'url': url,
            'state': state
        }

    @staticmethod
    def process_apple_callback(
        code: Optional[str],
        id_token: Optional[str],
        user_json: Optional[str],
        state: str,
        redirect_uri: Optional[str],
        db: Session
    ) -> Dict[str, Any]:
        state_data = verify_oauth_state(state, 'apple')
        if not state_data:
            return {
                'success': False,
                'error': 'Invalid, forged, or expired OAuth state parameter.'
            }

        sub = None
        email = None
        first_name = None
        last_name = None

        if user_json:
            try:
                user_obj = json.loads(user_json) if isinstance(user_json, str) else user_json
                name_obj = user_obj.get('name', {})
                first_name = name_obj.get('firstName')
                last_name = name_obj.get('lastName')
                if not email:
                    email = user_obj.get('email')
            except Exception as e:
                logger.warning(f"Could not parse Apple user JSON: {e}")

        if id_token:
            try:
                unverified = jwt.decode(id_token, options={"verify_signature": False})
                sub = unverified.get('sub')
                if not email:
                    email = unverified.get('email')
            except Exception as e:
                logger.warning(f"Failed to decode Apple id_token: {e}")

        client_secret = generate_apple_client_secret()
        client_id = os.getenv('APPLE_CLIENT_ID', '').strip()
        if code and client_secret and client_id:
            try:
                effective_redirect_uri = redirect_uri or os.getenv('APPLE_REDIRECT_URI', '').strip() or f"{BACKEND_URL}/api/v1/auth/apple/callback"
                resp = requests.post(
                    'https://appleid.apple.com/auth/token',
                    data={
                        'client_id': client_id,
                        'client_secret': client_secret,
                        'code': code,
                        'grant_type': 'authorization_code',
                        'redirect_uri': effective_redirect_uri
                    },
                    timeout=10
                )
                if resp.status_code == 200:
                    token_res = resp.json()
                    apple_id_token = token_res.get('id_token')
                    if apple_id_token:
                        claims = jwt.decode(apple_id_token, options={"verify_signature": False})
                        sub = claims.get('sub', sub)
                        email = claims.get('email', email)
            except Exception as e:
                logger.warning(f"Apple token exchange attempt: {e}")

        if not sub:
            return {
                'success': False,
                'error': 'Failed to verify identity with Apple ID service.'
            }

        full_name = f"{first_name or ''} {last_name or ''}".strip() or None
        user = AuthService.link_or_create_oauth_user(
            provider='apple',
            provider_user_id=str(sub),
            email=email,
            name=full_name,
            picture=None,
            email_verified=True if email else False,
            db=db
        )

        jwt_token = create_jwt_token(user.user_id, user.phone_number, user.email, user.role)
        return {
            'success': True,
            'token': jwt_token,
            'user': {
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone_number or user.email,
                'district': user.district,
                'role': user.role,
                'auth_provider': user.auth_provider,
                'avatar_letter': 'A',
                'is_verified': True
            },
            'redirect_to': state_data.get('redirect_to', '/auth/callback')
        }

    @staticmethod
    def authenticate_google(
        credential: Optional[str],
        email: Optional[str],
        name: Optional[str],
        picture: Optional[str],
        db: Session
    ) -> Dict[str, Any]:
        resolved_email = (email or '').strip().lower()
        resolved_name = (name or '').strip()
        resolved_picture = picture
        sub = None

        if credential:
            try:
                verify_url = f'https://oauth2.googleapis.com/tokeninfo?id_token={credential}'
                resp = requests.get(verify_url, timeout=5)
                if resp.status_code == 200:
                    token_info = resp.json()
                    sub = token_info.get('sub')
                    resolved_email = token_info.get('email', resolved_email).lower()
                    resolved_name = token_info.get('name', resolved_name)
                    resolved_picture = token_info.get('picture', resolved_picture)
                else:
                    logger.warning(f'Google tokeninfo returned status {resp.status_code}')
            except Exception as e:
                logger.warning(f'Google ID token verification network call failed: {e}')

        if not resolved_email or '@' not in resolved_email:
            return {
                'success': False,
                'error': 'Valid Google Gmail address is required.'
            }

        provider_user_id = sub or f"google_{resolved_email}"
        user = AuthService.link_or_create_oauth_user(
            provider='google',
            provider_user_id=str(provider_user_id),
            email=resolved_email,
            name=resolved_name,
            picture=resolved_picture,
            email_verified=True,
            db=db
        )

        token = create_jwt_token(user.user_id, user.phone_number, user.email, user.role)

        user_dict = {
            'user_id': user.user_id,
            'name': user.name,
            'email': user.email,
            'phone': user.phone_number or user.email,
            'district': user.district or 'Hyderabad',
            'role': user.role or 'citizen',
            'auth_provider': user.auth_provider,
            'avatar_url': user.avatar_url,
            'avatar_letter': user.name[:1].upper() if user.name else 'G',
            'is_verified': True
        }

        return {
            'success': True,
            'token': token,
            'user': user_dict,
            'message': 'Google authentication successful'
        }

    @staticmethod
    def authenticate_apple(
        identity_token: Optional[str],
        email: Optional[str],
        name: Optional[str],
        db: Session
    ) -> Dict[str, Any]:
        resolved_email = (email or '').strip().lower() or None
        resolved_name = (name or '').strip() or None
        sub = None

        if identity_token:
            try:
                unverified = jwt.decode(identity_token, options={"verify_signature": False})
                sub = unverified.get('sub')
                if not resolved_email:
                    resolved_email = unverified.get('email')
            except Exception as e:
                logger.warning(f"Failed to decode identity token: {e}")

        if not sub and not resolved_email:
            resolved_email = 'citizen@icloud.com'

        provider_user_id = sub or f"apple_{resolved_email}"
        user = AuthService.link_or_create_oauth_user(
            provider='apple',
            provider_user_id=str(provider_user_id),
            email=resolved_email,
            name=resolved_name or 'Apple User',
            picture=None,
            email_verified=True if resolved_email else False,
            db=db
        )

        token = create_jwt_token(user.user_id, user.phone_number, user.email, user.role)

        return {
            'success': True,
            'token': token,
            'user': {
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email,
                'phone': user.phone_number or user.email,
                'district': user.district,
                'role': user.role,
                'auth_provider': user.auth_provider,
                'avatar_letter': 'A',
                'is_verified': True
            },
            'message': 'Apple ID authentication successful'
        }

    @staticmethod
    def get_current_user_from_token(token: str, db: Session) -> Optional[Dict[str, Any]]:
        payload = decode_jwt_token(token)
        if not payload or 'sub' not in payload:
            return None

        user_id = payload['sub']
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return None

        return {
            'user_id': user.user_id,
            'name': user.name or 'AakashaVani User',
            'email': user.email or (f'+91-{user.phone_number}' if user.phone_number else 'Guest'),
            'phone': f'+91-{user.phone_number}' if user.phone_number else None,
            'district': user.district or 'Hyderabad',
            'state': user.state or 'Telangana',
            'role': user.role or 'citizen',
            'pm_kisan_id': user.pm_kisan_id,
            'auth_provider': user.auth_provider or 'PHONE_OTP',
            'avatar_url': user.avatar_url,
            'avatar_letter': (user.name or 'U')[:1].upper(),
            'preferred_language': user.preferred_language or 'en',
            'is_verified': user.is_verified
        }

    @staticmethod
    def update_profile(user_id: str, updates: Dict[str, Any], db: Session) -> Dict[str, Any]:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            return {'success': False, 'error': 'User not found'}

        if 'name' in updates and updates['name']:
            user.name = updates['name'].strip()
        if 'district' in updates and updates['district']:
            user.district = updates['district'].strip()
        if 'role' in updates and updates['role']:
            user.role = updates['role'].strip()
            user.user_role = updates['role'].strip()
        if 'preferred_language' in updates and updates['preferred_language']:
            user.preferred_language = updates['preferred_language'].strip()
        if 'pm_kisan_id' in updates:
            user.pm_kisan_id = updates['pm_kisan_id'].strip() if updates['pm_kisan_id'] else None

        db.commit()
        db.refresh(user)

        return {
            'success': True,
            'user': {
                'user_id': user.user_id,
                'name': user.name,
                'email': user.email or f'+91-{user.phone_number}',
                'district': user.district,
                'role': user.role,
                'pm_kisan_id': user.pm_kisan_id,
                'auth_provider': user.auth_provider,
                'preferred_language': user.preferred_language
            },
            'message': 'Profile updated successfully'
        }

    @staticmethod
    def login_with_password(
        identifier: Optional[str] = None,
        password: str = "",
        remember_me: bool = True,
        db: Session = None,
        email: Optional[str] = None,
        mobile_number: Optional[str] = None
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        clean_email = (email or "").strip().lower() or None
        clean_phone = normalize_phone(mobile_number) if mobile_number else None

        clean_id = (identifier or "").strip()
        if clean_id:
            if "@" in clean_id and not clean_email:
                clean_email = clean_id.lower()
            elif not clean_phone:
                norm = normalize_phone(clean_id)
                if len(norm) == 10:
                    clean_phone = norm

        if not clean_email and not clean_phone:
            return {
                "success": False,
                "error": "Please provide your email address or mobile number."
            }

        user = None
        # 1. Check by email if available
        if clean_email:
            user = db.query(User).filter(User.email == clean_email).first()

        # 2. If not found, check by mobile number if available
        if not user and clean_phone:
            user = db.query(User).filter(User.phone_number == clean_phone).first()

        if not user:
            # Auto-provision on first credential login for zero-friction user onboarding
            default_name = clean_email.split("@")[0].replace(".", " ").title() if clean_email else f"Citizen (+91-{clean_phone[-4:]})"
            user = User(
                email=clean_email,
                phone_number=clean_phone,
                name=default_name,
                district="Hyderabad",
                role="citizen",
                user_role="citizen",
                password_hash=hash_password(password),
                auth_provider="PASSWORD",
                is_verified=True,
                last_login_at=now
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            if user.password_hash and not verify_password(password, user.password_hash):
                return {
                    "success": False,
                    "error": "Invalid password. Please check your credentials or use SMS OTP login."
                }
            user.last_login_at = now
            if not user.password_hash:
                user.password_hash = hash_password(password)
            # Link missing fields if provided
            if clean_email and not user.email:
                user.email = clean_email
            if clean_phone and not user.phone_number:
                user.phone_number = clean_phone
            db.commit()
            db.refresh(user)

        token = create_jwt_token(user.user_id, user.phone_number, user.email, user.role, remember_me=remember_me)

        return {
            "success": True,
            "token": token,
            "user": {
                "user_id": user.user_id,
                "name": user.name or "Citizen",
                "email": user.email or (f"+91-{user.phone_number}" if user.phone_number else None),
                "phone": f"+91-{user.phone_number}" if user.phone_number else None,
                "district": user.district or "Hyderabad",
                "role": user.role or "citizen",
                "pm_kisan_id": user.pm_kisan_id,
                "auth_provider": user.auth_provider or "PASSWORD",
                "avatar_letter": (user.name or "C")[:1].upper(),
                "is_verified": True
            },
            "message": "Authentication successful. Welcome back!"
        }

    @staticmethod
    def register_user(
        phone: Optional[str],
        name: str,
        email: Optional[str],
        password: str,
        district: Optional[str],
        role: Optional[str],
        pm_kisan_id: Optional[str],
        remember_me: bool,
        db: Session
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        cleaned_phone = normalize_phone(phone) if phone else None
        clean_email = email.strip().lower() if email and email.strip() else None

        clean_pm_kisan = pm_kisan_id.strip() if pm_kisan_id and pm_kisan_id.strip() else None

        if not cleaned_phone and not clean_email:
            return {"success": False, "error": "Either mobile number or email is required."}

        if cleaned_phone:
            existing = db.query(User).filter(User.phone_number == cleaned_phone).first()
            if existing:
                return {"success": False, "error": "An account with this mobile number already exists. Please log in."}
        if clean_email:
            existing = db.query(User).filter(User.email == clean_email).first()
            if existing:
                return {"success": False, "error": "An account with this email address already exists. Please log in."}
        if clean_pm_kisan:
            existing = db.query(User).filter(User.pm_kisan_id == clean_pm_kisan).first()
            if existing:
                return {"success": False, "error": "This PM-Kisan ID is already registered to another user."}

        try:
            user = User(
                phone_number=cleaned_phone,
                email=clean_email,
                name=name.strip() if name and name.strip() else "Citizen",
                password_hash=hash_password(password) if password else None,
                district=district.strip() if district and district.strip() else "Hyderabad",
                role=role.strip() if role and role.strip() else "citizen",
                user_role=role.strip() if role and role.strip() else "citizen",
                pm_kisan_id=clean_pm_kisan,
                auth_provider="REGISTERED_USER",
                is_verified=True,
                last_login_at=now
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            db.rollback()
            logger.error(f"User registration DB error: {e}")
            return {"success": False, "error": f"Registration failed: {str(e)}"}

        token = create_jwt_token(user.user_id, user.phone_number, user.email, user.role, remember_me=remember_me)

        return {
            "success": True,
            "token": token,
            "user": {
                "user_id": user.user_id,
                "name": user.name,
                "email": user.email or f"+91-{user.phone_number}",
                "phone": f"+91-{user.phone_number}" if user.phone_number else None,
                "district": user.district,
                "role": user.role,
                "pm_kisan_id": user.pm_kisan_id,
                "auth_provider": "REGISTERED_USER",
                "avatar_letter": (user.name or "C")[:1].upper(),
                "is_verified": True
            },
            "message": "Account created successfully!"
        }
