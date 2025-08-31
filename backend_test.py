#!/usr/bin/env python3
"""
Fan Hub Pro Backend API Test Suite
Tests all backend endpoints for the Fan Hub Pro application
"""

import requests
import json
import os
import sys
from datetime import datetime
import time

# Get the backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except FileNotFoundError:
        pass
    return 'https://fanhub-pro.preview.emergentagent.com'

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

class FanHubAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'Content-Type': 'application/json',
            'User-Agent': 'FanHub-Test-Suite/1.0'
        })
        self.test_results = []
        self.created_resources = []  # Track created resources for cleanup
        
    def log_result(self, test_name, success, message, response_data=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'response_data': response_data
        }
        self.test_results.append(result)
        
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        
        if response_data and not success:
            print(f"   Response: {json.dumps(response_data, indent=2)}")
    
    def test_health_endpoint(self):
        """Test GET /api/health"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'message' in data:
                    self.log_result("Health Check", True, f"API is healthy: {data['message']}", data)
                else:
                    self.log_result("Health Check", False, "Invalid response format", data)
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Health Check", False, f"Connection error: {str(e)}")
    
    def test_welcome_endpoint(self):
        """Test GET /api/"""
        try:
            response = self.session.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'message' in data:
                    self.log_result("Welcome Endpoint", True, f"Welcome message received: {data['message']}", data)
                else:
                    self.log_result("Welcome Endpoint", False, "Invalid response format", data)
            else:
                self.log_result("Welcome Endpoint", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Welcome Endpoint", False, f"Connection error: {str(e)}")
    
    def test_status_endpoint(self):
        """Test GET /api/status"""
        try:
            response = self.session.get(f"{API_BASE}/status", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    status_data = data['data']
                    db_status = status_data.get('database', 'unknown')
                    self.log_result("Status Check", True, f"System status OK, DB: {db_status}", data)
                else:
                    self.log_result("Status Check", False, "Invalid response format", data)
            else:
                self.log_result("Status Check", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Status Check", False, f"Connection error: {str(e)}")
    
    def test_outfits_endpoint(self):
        """Test GET /api/outfits"""
        try:
            response = self.session.get(f"{API_BASE}/outfits", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    outfits = data['data']
                    self.log_result("Get Outfits", True, f"Retrieved {len(outfits)} outfits", {'count': len(outfits)})
                else:
                    self.log_result("Get Outfits", False, "Invalid response format", data)
            else:
                self.log_result("Get Outfits", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get Outfits", False, f"Connection error: {str(e)}")
    
    def test_create_outfit(self):
        """Test POST /api/outfits - Create new outfit"""
        try:
            outfit_data = {
                "title": "Test Outfit - Elegant Evening",
                "image": "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400",
                "description": "A beautiful elegant evening outfit for testing",
                "category": "elegant"
            }
            
            response = self.session.post(f"{API_BASE}/outfits", 
                                       json=outfit_data, timeout=10)
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success') and 'data' in data:
                    outfit_id = data['data']['_id']
                    self.created_resources.append(('outfit', outfit_id))
                    self.log_result("Create Outfit", True, f"Outfit created with ID: {outfit_id}", data)
                    return outfit_id
                else:
                    self.log_result("Create Outfit", False, "Invalid response format", data)
            else:
                self.log_result("Create Outfit", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Create Outfit", False, f"Connection error: {str(e)}")
        return None
    
    def test_vote_for_outfit(self, outfit_id=None):
        """Test POST /api/votes"""
        try:
            # If no outfit_id provided, try to get one from existing outfits
            if not outfit_id:
                outfits_response = self.session.get(f"{API_BASE}/outfits", timeout=10)
                if outfits_response.status_code == 200:
                    outfits_data = outfits_response.json()
                    if outfits_data.get('success') and outfits_data['data']:
                        outfit_id = outfits_data['data'][0]['_id']
                    else:
                        self.log_result("Vote for Outfit", False, "No outfits available to vote for")
                        return
                else:
                    self.log_result("Vote for Outfit", False, "Could not fetch outfits for voting")
                    return
            
            vote_data = {
                "outfitId": outfit_id,
                "voteType": "like"
            }
            
            response = self.session.post(f"{API_BASE}/votes", 
                                       json=vote_data, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success'):
                    self.log_result("Vote for Outfit", True, f"Vote cast successfully for outfit {outfit_id}", data)
                else:
                    self.log_result("Vote for Outfit", False, "Vote failed", data)
            elif response.status_code == 400:
                # Might be duplicate vote, which is expected behavior
                data = response.json()
                if "already voted" in data.get('error', '').lower():
                    self.log_result("Vote for Outfit", True, "Duplicate vote prevention working correctly", data)
                else:
                    self.log_result("Vote for Outfit", False, f"HTTP 400: {data.get('error', 'Unknown error')}", data)
            else:
                self.log_result("Vote for Outfit", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Vote for Outfit", False, f"Connection error: {str(e)}")
    
    def test_questions_endpoint(self):
        """Test GET /api/questions"""
        try:
            response = self.session.get(f"{API_BASE}/questions", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    questions = data['data']
                    self.log_result("Get Questions", True, f"Retrieved {len(questions)} questions", {'count': len(questions)})
                else:
                    self.log_result("Get Questions", False, "Invalid response format", data)
            else:
                self.log_result("Get Questions", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get Questions", False, f"Connection error: {str(e)}")
    
    def test_submit_question(self):
        """Test POST /api/questions"""
        try:
            question_data = {
                "question": "What's your favorite workout routine for staying in shape?",
                "category": "fitness"
            }
            
            response = self.session.post(f"{API_BASE}/questions", 
                                       json=question_data, timeout=10)
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success') and 'data' in data:
                    question_id = data['data']['_id']
                    self.created_resources.append(('question', question_id))
                    self.log_result("Submit Question", True, f"Question submitted with ID: {question_id}", data)
                else:
                    self.log_result("Submit Question", False, "Invalid response format", data)
            else:
                self.log_result("Submit Question", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Submit Question", False, f"Connection error: {str(e)}")
    
    def test_wallpapers_endpoint(self):
        """Test GET /api/wallpapers"""
        try:
            response = self.session.get(f"{API_BASE}/wallpapers", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    wallpapers = data['data']
                    self.log_result("Get Wallpapers", True, f"Retrieved {len(wallpapers)} wallpapers", {'count': len(wallpapers)})
                else:
                    self.log_result("Get Wallpapers", False, "Invalid response format", data)
            else:
                self.log_result("Get Wallpapers", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get Wallpapers", False, f"Connection error: {str(e)}")
    
    def test_wallpaper_categories(self):
        """Test GET /api/wallpapers/categories"""
        try:
            response = self.session.get(f"{API_BASE}/wallpapers/categories", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    categories = data['data']
                    self.log_result("Get Wallpaper Categories", True, f"Retrieved {len(categories)} categories", data)
                else:
                    self.log_result("Get Wallpaper Categories", False, "Invalid response format", data)
            else:
                self.log_result("Get Wallpaper Categories", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get Wallpaper Categories", False, f"Connection error: {str(e)}")
    
    def test_top_fans_endpoint(self):
        """Test GET /api/fans/top"""
        try:
            response = self.session.get(f"{API_BASE}/fans/top", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get('success') and 'data' in data:
                    fans = data['data']
                    self.log_result("Get Top Fans", True, f"Retrieved {len(fans)} top fans", {'count': len(fans)})
                else:
                    self.log_result("Get Top Fans", False, "Invalid response format", data)
            else:
                self.log_result("Get Top Fans", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Get Top Fans", False, f"Connection error: {str(e)}")
    
    def test_create_fan_profile(self):
        """Test POST /api/fans - Create fan profile"""
        try:
            fan_data = {
                "username": f"testfan_{int(time.time())}",
                "email": f"testfan_{int(time.time())}@example.com",
                "bio": "I'm a huge fan of Stephanie! Love her style and energy.",
                "location": "Los Angeles, CA"
            }
            
            response = self.session.post(f"{API_BASE}/fans", 
                                       json=fan_data, timeout=10)
            
            if response.status_code == 201:
                data = response.json()
                if data.get('success') and 'data' in data:
                    fan_id = data['data']['_id']
                    self.created_resources.append(('fan', fan_id))
                    self.log_result("Create Fan Profile", True, f"Fan profile created with ID: {fan_id}", data)
                    return fan_id
                else:
                    self.log_result("Create Fan Profile", False, "Invalid response format", data)
            else:
                self.log_result("Create Fan Profile", False, f"HTTP {response.status_code}", response.text)
                
        except Exception as e:
            self.log_result("Create Fan Profile", False, f"Connection error: {str(e)}")
        return None
    
    def test_error_handling(self):
        """Test error handling for invalid requests"""
        try:
            # Test 404 for non-existent route
            response = self.session.get(f"{API_BASE}/nonexistent", timeout=10)
            if response.status_code == 404:
                data = response.json()
                if not data.get('success'):
                    self.log_result("404 Error Handling", True, "Correctly returns 404 for invalid routes", data)
                else:
                    self.log_result("404 Error Handling", False, "Should return success: false for 404", data)
            else:
                self.log_result("404 Error Handling", False, f"Expected 404, got {response.status_code}")
                
        except Exception as e:
            self.log_result("404 Error Handling", False, f"Connection error: {str(e)}")
        
        try:
            # Test invalid JSON for POST request
            response = self.session.post(f"{API_BASE}/questions", 
                                       json={"question": ""}, timeout=10)  # Empty question
            if response.status_code in [400, 422]:
                data = response.json()
                if not data.get('success'):
                    self.log_result("Validation Error Handling", True, "Correctly validates empty question", data)
                else:
                    self.log_result("Validation Error Handling", False, "Should return success: false for validation errors", data)
            else:
                self.log_result("Validation Error Handling", False, f"Expected 400/422, got {response.status_code}")
                
        except Exception as e:
            self.log_result("Validation Error Handling", False, f"Connection error: {str(e)}")
    
    def test_response_format(self):
        """Test that all responses follow the expected JSON format"""
        endpoints_to_test = [
            ("/health", "GET"),
            ("/", "GET"),
            ("/status", "GET"),
            ("/outfits", "GET"),
            ("/questions", "GET"),
            ("/wallpapers", "GET"),
            ("/wallpapers/categories", "GET"),
            ("/fans/top", "GET")
        ]
        
        format_errors = []
        
        for endpoint, method in endpoints_to_test:
            try:
                if method == "GET":
                    response = self.session.get(f"{API_BASE}{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Check required fields
                    if 'success' not in data:
                        format_errors.append(f"{endpoint}: Missing 'success' field")
                    
                    if 'message' not in data and 'data' not in data:
                        format_errors.append(f"{endpoint}: Missing both 'message' and 'data' fields")
                    
                    # Check success field type
                    if not isinstance(data.get('success'), bool):
                        format_errors.append(f"{endpoint}: 'success' field should be boolean")
                        
            except Exception as e:
                format_errors.append(f"{endpoint}: Connection error - {str(e)}")
        
        if not format_errors:
            self.log_result("Response Format Consistency", True, "All endpoints follow correct JSON format")
        else:
            self.log_result("Response Format Consistency", False, f"Format issues: {'; '.join(format_errors)}")
    
    def run_all_tests(self):
        """Run all API tests"""
        print(f"\n🚀 Starting Fan Hub Pro Backend API Tests")
        print(f"📍 Testing API at: {API_BASE}")
        print(f"⏰ Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        print("=" * 60)
        
        # Core endpoint tests
        self.test_health_endpoint()
        self.test_welcome_endpoint()
        self.test_status_endpoint()
        
        # Feature endpoint tests
        self.test_outfits_endpoint()
        outfit_id = self.test_create_outfit()
        self.test_vote_for_outfit(outfit_id)
        
        self.test_questions_endpoint()
        self.test_submit_question()
        
        self.test_wallpapers_endpoint()
        self.test_wallpaper_categories()
        
        self.test_top_fans_endpoint()
        self.test_create_fan_profile()
        
        # System tests
        self.test_error_handling()
        self.test_response_format()
        
        print("=" * 60)
        return self.print_summary()
    
    def print_summary(self):
        """Print test summary"""
        total_tests = len(self.test_results)
        passed_tests = len([r for r in self.test_results if r['success']])
        failed_tests = total_tests - passed_tests
        
        print(f"\n📊 TEST SUMMARY")
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result['success']:
                    print(f"   • {result['test']}: {result['message']}")
        
        print(f"\n🏁 Testing completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        # Return summary for external use
        return {
            'total': total_tests,
            'passed': passed_tests,
            'failed': failed_tests,
            'success_rate': (passed_tests/total_tests)*100,
            'results': self.test_results
        }

def main():
    """Main function to run tests"""
    tester = FanHubAPITester()
    try:
        summary = tester.run_all_tests()
        
        # Exit with error code if tests failed
        if summary and summary['failed'] > 0:
            sys.exit(1)
        else:
            sys.exit(0)
    except Exception as e:
        print(f"❌ Test execution failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()