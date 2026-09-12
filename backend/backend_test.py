"""
AEGIS Platform — Comprehensive Backend API Test Suite
Tests all endpoints: auth, marketplace, payments, AI chat, messaging
"""
import os
import sys
import json
import asyncio
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

BASE_URL = "https://aegis-match.preview.emergentagent.com"
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

class APITester:
    def __init__(self):
        self.base_url = BASE_URL
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.test_data = {}

    def log(self, msg, level="INFO"):
        prefix = {
            "INFO": "ℹ️ ",
            "PASS": "✅",
            "FAIL": "❌",
            "WARN": "⚠️ "
        }.get(level, "")
        print(f"{prefix} {msg}")

    def test(self, name, method, endpoint, expected_status, data=None, headers=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        h = {'Content-Type': 'application/json'}
        if self.token:
            h['Authorization'] = f'Bearer {self.token}'
        if headers:
            h.update(headers)
        
        self.tests_run += 1
        self.log(f"Testing {name}...", "INFO")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=h, timeout=30)
            elif method == 'POST':
                if files:
                    h.pop('Content-Type', None)
                    response = requests.post(url, data=data, files=files, headers=h, timeout=30)
                else:
                    response = requests.post(url, json=data, headers=h, timeout=30)
            elif method == 'DELETE':
                response = requests.delete(url, headers=h, timeout=30)
            else:
                self.log(f"Unsupported method: {method}", "FAIL")
                return False, {}

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                self.log(f"PASSED - {name} (Status: {response.status_code})", "PASS")
            else:
                self.failed_tests.append({
                    "test": name,
                    "endpoint": endpoint,
                    "expected": expected_status,
                    "got": response.status_code,
                    "response": response.text[:200]
                })
                self.log(f"FAILED - {name} (Expected {expected_status}, got {response.status_code})", "FAIL")
                self.log(f"Response: {response.text[:200]}", "WARN")

            try:
                return success, response.json() if response.text else {}
            except:
                return success, {}

        except Exception as e:
            self.failed_tests.append({
                "test": name,
                "endpoint": endpoint,
                "error": str(e)
            })
            self.log(f"FAILED - {name} (Error: {str(e)})", "FAIL")
            return False, {}

    # ==================== AUTH TESTS ====================
    def test_auth(self):
        self.log("\n========== AUTH TESTS ==========", "INFO")
        
        # Test 1: Register new user
        timestamp = datetime.now().strftime("%H%M%S")
        new_email = f"test_{timestamp}@example.com"
        success, resp = self.test(
            "Register new user",
            "POST",
            "auth/register",
            200,
            data={"name": "Test User", "email": new_email, "password": "testpass123"}
        )
        if success and 'session_token' in resp:
            self.test_data['new_user_token'] = resp['session_token']
            self.test_data['new_user_id'] = resp.get('user', {}).get('user_id')
        
        # Test 2: Login with test account
        success, resp = self.test(
            "Login with jamie@example.com",
            "POST",
            "auth/login",
            200,
            data={"email": "jamie@example.com", "password": "pass1234"}
        )
        if success and 'session_token' in resp:
            self.token = resp['session_token']
            self.user_id = resp.get('user', {}).get('user_id')
            self.log(f"Logged in as {self.user_id}", "INFO")
        
        # Test 3: GET /me with token
        success, resp = self.test(
            "GET /auth/me with token",
            "GET",
            "auth/me",
            200
        )
        
        # Test 4: GET /me without token (should fail)
        old_token = self.token
        self.token = None
        success, resp = self.test(
            "GET /auth/me without token (should 401)",
            "GET",
            "auth/me",
            401
        )
        self.token = old_token
        
        # Test 5: Onboarding
        success, resp = self.test(
            "POST /auth/onboarding",
            "POST",
            "auth/onboarding",
            200,
            data={
                "role": "client",
                "interests": ["Web Development", "Design & Branding"],
                "notifications": {"email": True, "push": False, "sms": False}
            }
        )
        if success:
            if resp.get('onboarding_complete') == True and resp.get('role') == 'client':
                self.log("Onboarding completed successfully", "PASS")
            else:
                self.log("Onboarding response missing expected fields", "WARN")

    # ==================== MARKETPLACE TESTS ====================
    def test_marketplace(self):
        self.log("\n========== MARKETPLACE TESTS ==========", "INFO")
        
        # Test 1: Get categories
        success, resp = self.test(
            "GET /categories",
            "GET",
            "categories",
            200
        )
        if success:
            if isinstance(resp, list) and len(resp) == 8:
                self.log(f"Categories count: {len(resp)} ✓", "PASS")
            else:
                self.log(f"Expected 8 categories, got {len(resp) if isinstance(resp, list) else 'non-list'}", "WARN")
        
        # Test 2: Get all services
        success, resp = self.test(
            "GET /services (all)",
            "GET",
            "services",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"Services count: {len(resp)}", "INFO")
            if len(resp) >= 16:
                self.log("Seeded services present ✓", "PASS")
                self.test_data['sample_service_id'] = resp[0].get('service_id')
                self.test_data['sample_provider_id'] = resp[0].get('provider_id')
            else:
                self.log(f"Expected at least 16 services, got {len(resp)}", "WARN")
        
        # Test 3: Search services
        success, resp = self.test(
            "GET /services?search=web",
            "GET",
            "services?search=web",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"Search results: {len(resp)}", "INFO")
        
        # Test 4: Filter by category
        success, resp = self.test(
            "GET /services?category=Web Development",
            "GET",
            "services?category=Web%20Development",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"Category filter results: {len(resp)}", "INFO")
        
        # Test 5: Filter by price range
        success, resp = self.test(
            "GET /services?min_price=100&max_price=300",
            "GET",
            "services?min_price=100&max_price=300",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"Price filter results: {len(resp)}", "INFO")
        
        # Test 6: Filter by rating
        success, resp = self.test(
            "GET /services?min_rating=4.8",
            "GET",
            "services?min_rating=4.8",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"Rating filter results: {len(resp)}", "INFO")
        
        # Test 7: Sort variants
        for sort_type in ["popular", "rating", "price_low", "price_high", "newest"]:
            success, resp = self.test(
                f"GET /services?sort={sort_type}",
                "GET",
                f"services?sort={sort_type}",
                200
            )
        
        # Test 8: Get service detail
        if self.test_data.get('sample_service_id'):
            success, resp = self.test(
                "GET /services/{id}",
                "GET",
                f"services/{self.test_data['sample_service_id']}",
                200
            )
            if success:
                if 'pricing_tiers' in resp and 'reviews' in resp:
                    self.log("Service detail has pricing_tiers and reviews ✓", "PASS")
                else:
                    self.log("Service detail missing pricing_tiers or reviews", "WARN")
        
        # Test 9: Create service (provider listing)
        success, resp = self.test(
            "POST /services (create listing)",
            "POST",
            "services",
            200,
            data={
                "title": "Test Service Listing",
                "category": "Web Development",
                "price": 250.0,
                "description": "This is a test service listing created by automated test",
                "tags": ["test", "automation"],
                "delivery_days": 5,
                "pricing_tiers": [
                    {
                        "name": "Basic",
                        "price": 250.0,
                        "description": "Basic package",
                        "delivery_days": 5,
                        "features": ["Feature 1", "Feature 2"]
                    }
                ]
            }
        )
        if success:
            self.test_data['created_service_id'] = resp.get('service_id')
        
        # Test 10: Get my services
        success, resp = self.test(
            "GET /my/services",
            "GET",
            "my/services",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"My services count: {len(resp)}", "INFO")

    # ==================== SERVICE REQUESTS & ORDERS ====================
    def test_requests_orders(self):
        self.log("\n========== REQUESTS & ORDERS TESTS ==========", "INFO")
        
        # Test 1: Create service request
        success, resp = self.test(
            "POST /requests",
            "POST",
            "requests",
            200,
            data={
                "title": "Need a landing page",
                "category": "Web Development",
                "brief": "I need a modern landing page for my SaaS product",
                "budget": 500.0,
                "timeline": "2 weeks"
            }
        )
        if success:
            self.test_data['request_id'] = resp.get('request_id')
        
        # Test 2: Get requests
        success, resp = self.test(
            "GET /requests",
            "GET",
            "requests",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"Requests count: {len(resp)}", "INFO")
        
        # Test 3: Get orders
        success, resp = self.test(
            "GET /orders",
            "GET",
            "orders",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"Orders count: {len(resp)}", "INFO")

    # ==================== DASHBOARD ====================
    def test_dashboard(self):
        self.log("\n========== DASHBOARD TESTS ==========", "INFO")
        
        success, resp = self.test(
            "GET /dashboard/summary",
            "GET",
            "dashboard/summary",
            200
        )
        if success:
            if 'metrics' in resp and 'active_orders' in resp and 'recent_requests' in resp:
                self.log("Dashboard summary has all required fields ✓", "PASS")
                self.log(f"Metrics: {resp.get('metrics')}", "INFO")
            else:
                self.log("Dashboard summary missing required fields", "WARN")

    # ==================== PAYMENTS ====================
    def test_payments(self):
        self.log("\n========== PAYMENTS TESTS ==========", "INFO")
        
        if not self.test_data.get('sample_service_id'):
            self.log("Skipping payment tests - no sample service", "WARN")
            return
        
        # Test 1: Create checkout session
        success, resp = self.test(
            "POST /payments/checkout",
            "POST",
            "payments/checkout",
            200,
            data={
                "service_id": self.test_data['sample_service_id'],
                "tier_index": 0,
                "origin_url": BASE_URL
            }
        )
        if success:
            if 'checkout_url' in resp and 'session_id' in resp:
                self.log("Checkout session created ✓", "PASS")
                self.test_data['session_id'] = resp['session_id']
                self.log(f"Session ID: {resp['session_id']}", "INFO")
            else:
                self.log("Checkout response missing checkout_url or session_id", "WARN")
        
        # Test 2: Get payment status
        if self.test_data.get('session_id'):
            success, resp = self.test(
                "GET /payments/status/{session_id}",
                "GET",
                f"payments/status/{self.test_data['session_id']}",
                200
            )
            if success:
                if 'status' in resp and 'payment_status' in resp:
                    self.log(f"Payment status: {resp.get('status')}, {resp.get('payment_status')} ✓", "PASS")
                else:
                    self.log("Payment status response missing required fields", "WARN")

    # ==================== AI CHAT ====================
    def test_ai_chat(self):
        self.log("\n========== AI CHAT TESTS ==========", "INFO")
        
        # Test 1: Chat with OpenAI (SSE streaming)
        self.log("Testing AI chat with OpenAI (SSE streaming)...", "INFO")
        url = f"{self.base_url}/api/ai/chat"
        headers = {'Authorization': f'Bearer {self.token}'}
        data = {
            'message': 'Say "AEGIS test OK" and nothing else.',
            'provider': 'openai'
        }
        
        try:
            response = requests.post(url, data=data, headers=headers, stream=True, timeout=30)
            if response.status_code == 200:
                self.tests_run += 1
                chunks = []
                conversation_id = None
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            try:
                                data_json = json.loads(line_str[6:])
                                if 'delta' in data_json:
                                    chunks.append(data_json['delta'])
                                elif 'conversation_id' in data_json:
                                    conversation_id = data_json['conversation_id']
                            except:
                                pass
                        elif line_str.startswith('event: meta'):
                            pass
                
                full_response = ''.join(chunks)
                if full_response:
                    self.tests_passed += 1
                    self.log(f"PASSED - AI chat OpenAI (received {len(chunks)} chunks)", "PASS")
                    self.log(f"Response: {full_response[:100]}", "INFO")
                    if conversation_id:
                        self.test_data['openai_conversation_id'] = conversation_id
                else:
                    self.failed_tests.append({
                        "test": "AI chat OpenAI",
                        "endpoint": "ai/chat",
                        "error": "No response chunks received"
                    })
                    self.log("FAILED - AI chat OpenAI (no response)", "FAIL")
            else:
                self.tests_run += 1
                self.failed_tests.append({
                    "test": "AI chat OpenAI",
                    "endpoint": "ai/chat",
                    "expected": 200,
                    "got": response.status_code
                })
                self.log(f"FAILED - AI chat OpenAI (Status: {response.status_code})", "FAIL")
        except Exception as e:
            self.tests_run += 1
            self.failed_tests.append({
                "test": "AI chat OpenAI",
                "endpoint": "ai/chat",
                "error": str(e)
            })
            self.log(f"FAILED - AI chat OpenAI (Error: {str(e)})", "FAIL")
        
        # Test 2: Chat with Claude
        self.log("Testing AI chat with Claude (SSE streaming)...", "INFO")
        data = {
            'message': 'Say "AEGIS Claude test OK" and nothing else.',
            'provider': 'claude'
        }
        
        try:
            response = requests.post(url, data=data, headers=headers, stream=True, timeout=30)
            if response.status_code == 200:
                self.tests_run += 1
                chunks = []
                conversation_id = None
                for line in response.iter_lines():
                    if line:
                        line_str = line.decode('utf-8')
                        if line_str.startswith('data: '):
                            try:
                                data_json = json.loads(line_str[6:])
                                if 'delta' in data_json:
                                    chunks.append(data_json['delta'])
                                elif 'conversation_id' in data_json:
                                    conversation_id = data_json['conversation_id']
                            except:
                                pass
                
                full_response = ''.join(chunks)
                if full_response:
                    self.tests_passed += 1
                    self.log(f"PASSED - AI chat Claude (received {len(chunks)} chunks)", "PASS")
                    self.log(f"Response: {full_response[:100]}", "INFO")
                    if conversation_id:
                        self.test_data['claude_conversation_id'] = conversation_id
                else:
                    self.failed_tests.append({
                        "test": "AI chat Claude",
                        "endpoint": "ai/chat",
                        "error": "No response chunks received"
                    })
                    self.log("FAILED - AI chat Claude (no response)", "FAIL")
            else:
                self.tests_run += 1
                self.failed_tests.append({
                    "test": "AI chat Claude",
                    "endpoint": "ai/chat",
                    "expected": 200,
                    "got": response.status_code
                })
                self.log(f"FAILED - AI chat Claude (Status: {response.status_code})", "FAIL")
        except Exception as e:
            self.tests_run += 1
            self.failed_tests.append({
                "test": "AI chat Claude",
                "endpoint": "ai/chat",
                "error": str(e)
            })
            self.log(f"FAILED - AI chat Claude (Error: {str(e)})", "FAIL")
        
        # Test 3: Get conversations
        success, resp = self.test(
            "GET /ai/conversations",
            "GET",
            "ai/conversations",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"AI conversations count: {len(resp)}", "INFO")

    # ==================== MESSAGING ====================
    def test_messaging(self):
        self.log("\n========== MESSAGING TESTS ==========", "INFO")
        
        if not self.test_data.get('sample_provider_id'):
            self.log("Skipping messaging tests - no sample provider", "WARN")
            return
        
        # Test 1: Start conversation
        success, resp = self.test(
            "POST /conversations",
            "POST",
            "conversations",
            200,
            data={
                "participant_id": self.test_data['sample_provider_id'],
                "service_id": self.test_data.get('sample_service_id'),
                "service_title": "Test Service"
            }
        )
        if success:
            self.test_data['conversation_id'] = resp.get('conversation_id')
        
        # Test 2: Get conversations
        success, resp = self.test(
            "GET /conversations",
            "GET",
            "conversations",
            200
        )
        if success and isinstance(resp, list):
            self.log(f"Conversations count: {len(resp)}", "INFO")
            if len(resp) > 0 and 'unread' in resp[0]:
                self.log("Conversations have unread counts ✓", "PASS")
        
        # Test 3: Send message
        if self.test_data.get('conversation_id'):
            success, resp = self.test(
                "POST /conversations/{id}/messages",
                "POST",
                f"conversations/{self.test_data['conversation_id']}/messages",
                200,
                data={"content": "Hello, this is a test message"}
            )
            if success:
                self.test_data['message_id'] = resp.get('message_id')
        
        # Test 4: Get messages
        if self.test_data.get('conversation_id'):
            success, resp = self.test(
                "GET /conversations/{id}/messages",
                "GET",
                f"conversations/{self.test_data['conversation_id']}/messages",
                200
            )
            if success and isinstance(resp, list):
                self.log(f"Messages count: {len(resp)}", "INFO")

    # ==================== RUN ALL TESTS ====================
    def run_all(self):
        self.log("\n" + "="*60, "INFO")
        self.log("AEGIS PLATFORM - BACKEND API TEST SUITE", "INFO")
        self.log("="*60, "INFO")
        self.log(f"Base URL: {self.base_url}", "INFO")
        self.log(f"Time: {datetime.now().isoformat()}", "INFO")
        
        try:
            self.test_auth()
            self.test_marketplace()
            self.test_requests_orders()
            self.test_dashboard()
            self.test_payments()
            self.test_ai_chat()
            self.test_messaging()
        except Exception as e:
            self.log(f"Test suite error: {str(e)}", "FAIL")
        
        # Print summary
        self.log("\n" + "="*60, "INFO")
        self.log("TEST SUMMARY", "INFO")
        self.log("="*60, "INFO")
        self.log(f"Total tests: {self.tests_run}", "INFO")
        self.log(f"Passed: {self.tests_passed}", "PASS")
        self.log(f"Failed: {len(self.failed_tests)}", "FAIL")
        
        if self.failed_tests:
            self.log("\nFailed Tests:", "FAIL")
            for fail in self.failed_tests:
                self.log(f"  - {fail.get('test')}: {fail.get('endpoint')}", "FAIL")
                if 'expected' in fail:
                    self.log(f"    Expected {fail['expected']}, got {fail['got']}", "WARN")
                if 'error' in fail:
                    self.log(f"    Error: {fail['error']}", "WARN")
        
        success_rate = (self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0
        self.log(f"\nSuccess Rate: {success_rate:.1f}%", "INFO")
        
        return self.tests_run == self.tests_passed


def main():
    tester = APITester()
    success = tester.run_all()
    return 0 if success else 1


if __name__ == "__main__":
    sys.exit(main())
