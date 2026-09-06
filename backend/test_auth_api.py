import requests
import json

base_url = "http://127.0.0.1:8000"

print("--- 1. Testing Phone Send OTP ---")
r1 = requests.post(f"{base_url}/api/v1/auth/phone/send-otp", json={"phone": "9876543210"})
print(f"Status: {r1.status_code}")
print(f"Response: {r1.json()}")
assert r1.status_code == 200, f"Expected 200 but got {r1.status_code}"
otp = r1.json()["debug_otp"]

print("\n--- 2. Testing Phone Verify OTP ---")
r2 = requests.post(f"{base_url}/api/v1/auth/phone/verify-otp", json={
    "phone": "9876543210",
    "otp": otp,
    "name": "Kisan Rameshwar Patil",
    "district": "Wardha",
    "role": "farmer",
    "pm_kisan_id": "PMK-MH-2024-8921"
})
print(f"Status: {r2.status_code}")
print(f"Response: {r2.json()}")
assert r2.status_code == 200
token = r2.json()["token"]
user = r2.json()["user"]
print(f"Issued JWT Token: {token[:25]}... for User: {user['name']} ({user['role']})")

print("\n--- 3. Testing Auth ME Endpoint with Token ---")
r3 = requests.get(f"{base_url}/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
print(f"Status: {r3.status_code}")
print(f"User from DB: {r3.json()}")
assert r3.status_code == 200
assert r3.json()["user"]["phone"] == "+91-9876543210"

print("\n--- 4. Testing Google Authentication ---")
r4 = requests.post(f"{base_url}/api/v1/auth/google", json={
    "email": "rajesh.sharma.imd@gmail.com",
    "name": "Dr. Rajesh Sharma",
    "picture": "https://lh3.googleusercontent.com/a/default-avatar"
})
print(f"Status: {r4.status_code}")
print(f"Google User: {r4.json()}")
assert r4.status_code == 200
google_token = r4.json()["token"]

print("\n--- 5. Testing Profile Update ---")
r5 = requests.put(
    f"{base_url}/api/v1/auth/profile",
    json={"district": "Nagpur (Orange Orchards)", "preferred_language": "hinglish"},
    headers={"Authorization": f"Bearer {token}"}
)
print(f"Status: {r5.status_code}")
print(f"Updated Profile: {r5.json()}")
assert r5.status_code == 200

print("\nALL AUTHENTICATION API ENDPOINTS PASSED SUCCESSFULLY!")
