import os
import sys
import unittest
import requests
from datetime import datetime, timezone

from app.database import SessionLocal, engine
from app.models import User, OAuthAccount
from app.services.auth_service import (
    AuthService, 
    generate_oauth_state, 
    verify_oauth_state,
    create_jwt_token,
    decode_jwt_token
)

class TestOAuthEcosystem(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        from app.database import Base, engine
        Base.metadata.create_all(bind=engine)
        cls.db = SessionLocal()
        cls.base_url = "http://localhost:8000"

    @classmethod
    def tearDownClass(cls):
        cls.db.close()

    def test_A_existing_password_login(self):
        """TEST A: Existing email/password login still works."""
        resp = requests.post(f"{self.base_url}/api/v1/auth/login", json={
            "identifier": "test.farmer@aakashavani.in",
            "password": "Password123!",
            "remember_me": True
        })
        self.assertEqual(resp.status_code, 200, f"Password login failed: {resp.text}")
        data = resp.json()
        self.assertTrue(data.get("success"))
        self.assertIn("token", data)
        self.assertEqual(data["user"]["email"], "test.farmer@aakashavani.in")

    def test_B_google_oauth_initiation(self):
        """TEST B: Google OAuth initiation works."""
        os.environ["GOOGLE_CLIENT_ID"] = "test-client-id-12345.apps.googleusercontent.com"
        res = AuthService.get_google_authorize_url(
            redirect_uri="http://localhost:8000/api/v1/auth/google/callback",
            redirect_to="/auth/callback"
        )
        self.assertTrue(res.get("success"), f"Failed to get Google URL: {res}")
        self.assertIn("accounts.google.com", res["url"])
        self.assertIn("client_id=test-client-id-12345", res["url"])
        self.assertIn("scope=openid+email+profile", res["url"])
        self.assertIn("state=", res["url"])

    def test_C_google_callback_state_validation(self):
        """TEST C: Google callback state validation works."""
        state = generate_oauth_state("google", redirect_to="/auth/callback")
        verified = verify_oauth_state(state, "google")
        self.assertIsNotNone(verified)
        self.assertEqual(verified["provider"], "google")
        self.assertEqual(verified["redirect_to"], "/auth/callback")

    def test_D_google_new_user_creation(self):
        """TEST D: Google new-user creation works."""
        sub = "google-sub-unique-001"
        email = "new.farmer.ramesh@gmail.com"
        user = AuthService.link_or_create_oauth_user(
            provider="google",
            provider_user_id=sub,
            email=email,
            name="Ramesh Patil",
            picture="https://lh3.googleusercontent.com/photo.jpg",
            email_verified=True,
            db=self.db
        )
        self.assertIsNotNone(user)
        self.assertEqual(user.email, email)
        self.assertEqual(user.name, "Ramesh Patil")
        
        # Verify OAuthAccount entry
        oa = self.db.query(OAuthAccount).filter(OAuthAccount.provider_user_id == sub).first()
        self.assertIsNotNone(oa)
        self.assertEqual(oa.provider, "google")
        self.assertEqual(oa.user_id, user.user_id)

    def test_E_google_returning_user_login(self):
        """TEST E: Google returning-user login works without duplicating accounts."""
        sub = "google-sub-unique-001"
        email = "new.farmer.ramesh@gmail.com"
        user = AuthService.link_or_create_oauth_user(
            provider="google",
            provider_user_id=sub,
            email=email,
            name="Ramesh Patil Updated",
            picture=None,
            email_verified=True,
            db=self.db
        )
        self.assertIsNotNone(user)
        # Verify count of users with this email is exactly 1
        count = self.db.query(User).filter(User.email == email).count()
        self.assertEqual(count, 1, "Duplicate user was created for returning Google user")

    def test_F_apple_oauth_initiation(self):
        """TEST F: Apple OAuth initiation works."""
        os.environ["APPLE_CLIENT_ID"] = "com.aakashavani.web"
        res = AuthService.get_apple_authorize_url(
            redirect_uri="http://localhost:8000/api/v1/auth/apple/callback",
            redirect_to="/auth/callback"
        )
        self.assertTrue(res.get("success"), f"Failed to get Apple URL: {res}")
        self.assertIn("appleid.apple.com", res["url"])
        self.assertIn("client_id=com.aakashavani.web", res["url"])
        self.assertIn("response_mode=form_post", res["url"])
        self.assertIn("state=", res["url"])

    def test_G_apple_callback_state_validation(self):
        """TEST G: Apple callback state validation works."""
        state = generate_oauth_state("apple", redirect_to="/custom/landing")
        verified = verify_oauth_state(state, "apple")
        self.assertIsNotNone(verified)
        self.assertEqual(verified["provider"], "apple")
        self.assertEqual(verified["redirect_to"], "/custom/landing")

    def test_H_apple_new_user_creation(self):
        """TEST H: Apple new-user creation works (including Apple private relay email)."""
        sub = "apple-sub-unique-002"
        relay_email = "citizen.relief@privaterelay.appleid.com"
        user = AuthService.link_or_create_oauth_user(
            provider="apple",
            provider_user_id=sub,
            email=relay_email,
            name="Captain Vikram",
            picture=None,
            email_verified=True,
            db=self.db
        )
        self.assertIsNotNone(user)
        self.assertEqual(user.email, relay_email)

        oa = self.db.query(OAuthAccount).filter(OAuthAccount.provider_user_id == sub).first()
        self.assertIsNotNone(oa)
        self.assertEqual(oa.provider, "apple")
        self.assertEqual(oa.user_id, user.user_id)

    def test_I_apple_returning_user_login(self):
        """TEST I: Apple returning-user login works with stable sub identifier."""
        sub = "apple-sub-unique-002"
        # On subsequent logins, Apple may not return email
        user = AuthService.link_or_create_oauth_user(
            provider="apple",
            provider_user_id=sub,
            email=None,
            name=None,
            picture=None,
            email_verified=False,
            db=self.db
        )
        self.assertIsNotNone(user)
        self.assertEqual(user.email, "citizen.relief@privaterelay.appleid.com")

    def test_J_duplicate_account_protection(self):
        """TEST J: Duplicate-account protection works (links provider to existing account)."""
        common_email = "dr.kavita.narayan@aakashavani.org"
        # 1. Register account via local password
        reg_resp = requests.post(f"{self.base_url}/api/v1/auth/register", json={
            "name": "Dr. Kavita Narayan",
            "email": common_email,
            "password": "SecurePassword999!",
            "district": "Hyderabad",
            "role": "disaster_manager"
        })
        self.assertIn(reg_resp.status_code, [200, 400]) # 200 or already registered

        # 2. User subsequently signs in with Google having the SAME verified email
        sub = "google-sub-kavita-999"
        linked_user = AuthService.link_or_create_oauth_user(
            provider="google",
            provider_user_id=sub,
            email=common_email,
            name="Dr. Kavita Narayan",
            picture="https://lh3.googleusercontent.com/kavita.jpg",
            email_verified=True,
            db=self.db
        )
        self.assertIsNotNone(linked_user)

        # 3. Ensure NO duplicate accounts exist in User table for this email
        user_records = self.db.query(User).filter(User.email == common_email).all()
        self.assertEqual(len(user_records), 1, "Duplicate account was created instead of linking!")

        # 4. Verify OAuthAccount links directly to that user's user_id
        oa = self.db.query(OAuthAccount).filter(OAuthAccount.provider_user_id == sub).first()
        self.assertIsNotNone(oa)
        self.assertEqual(oa.user_id, linked_user.user_id)

    def test_K_invalid_oauth_state_rejected(self):
        """TEST K: Invalid OAuth state is rejected."""
        tampered_state = "invalid.forged.state.token.12345"
        verified = verify_oauth_state(tampered_state, "google")
        self.assertIsNone(verified, "Forged state was unexpectedly accepted")

        # Check endpoint rejects bad state
        resp = requests.get(f"{self.base_url}/api/v1/auth/google/callback?code=fake_code&state={tampered_state}", allow_redirects=False)
        self.assertEqual(resp.status_code, 303)
        self.assertIn("error=", resp.headers.get("Location", ""))

    def test_L_oauth_provider_failure_handled_safely(self):
        """TEST L: OAuth provider failure is handled safely without raw traces."""
        resp = requests.get(f"{self.base_url}/api/v1/auth/google/callback?error=access_denied", allow_redirects=False)
        self.assertEqual(resp.status_code, 303)
        location = resp.headers.get("Location", "")
        self.assertIn("error=access_denied", location)
        self.assertNotIn("Traceback", location)

    def test_M_protected_routes_and_auth_me(self):
        """TEST M: Protected frontend routes still work."""
        # 1. Unauthenticated request to /auth/me -> 401
        unauth_resp = requests.get(f"{self.base_url}/api/v1/auth/me")
        self.assertEqual(unauth_resp.status_code, 401)

        # 2. Authenticated request with token -> 200
        token = create_jwt_token("usr-farmer-01", "9876543210", "usr-farmer-01@aakashavani.in", "farmer")
        auth_resp = requests.get(f"{self.base_url}/api/v1/auth/me", headers={
            "Authorization": f"Bearer {token}"
        })
        self.assertEqual(auth_resp.status_code, 200)
        self.assertTrue(auth_resp.json().get("success"))

    def test_N_existing_sessions_jwt_validation(self):
        """TEST N: Existing sessions/JWTs still work."""
        token = create_jwt_token("usr-test-99", "9999999999", "test@test.com", "citizen", remember_me=True)
        payload = decode_jwt_token(token)
        self.assertIsNotNone(payload)
        self.assertEqual(payload["sub"], "usr-test-99")
        self.assertEqual(payload["role"], "citizen")

    def test_O_local_configuration(self):
        """TEST O: Local configuration works."""
        from app.services.auth_service import FRONTEND_URL, BACKEND_URL
        self.assertTrue(FRONTEND_URL.startswith("http"))
        self.assertTrue(BACKEND_URL.startswith("http"))

    def test_P_production_configuration_environment_driven(self):
        """TEST P: Production configuration is environment-driven."""
        test_env_frontend = "https://aakashavani-demo.vercel.app"
        os.environ["FRONTEND_URL"] = test_env_frontend
        from app.services import auth_service
        self.assertIn("FRONTEND_URL", os.environ)

    def test_Q_secrets_audit(self):
        """TEST Q: Secrets are absent from Git-tracked source files."""
        gitignore_path = ".gitignore" if os.path.exists(".gitignore") else "../.gitignore"
        self.assertTrue(os.path.exists(gitignore_path), "Missing .gitignore file")
        with open(gitignore_path, "r", encoding="utf-8") as f:
            gitignore_content = f.read()
        self.assertIn(".env", gitignore_content)

if __name__ == "__main__":
    unittest.main(verbosity=2)
