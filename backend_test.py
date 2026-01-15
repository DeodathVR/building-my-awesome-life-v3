#!/usr/bin/env python3
"""
Comprehensive backend API testing for Awesome Life Habits app
Tests all CRUD operations, AI integration, and data persistence
"""

import requests
import sys
import json
from datetime import datetime, timedelta
import time

class HabitsAPITester:
    def __init__(self, base_url="https://serene-habits-37.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        self.created_habit_ids = []
        self.created_post_ids = []

    def log_result(self, test_name, success, details="", response_data=None):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details,
            "response_data": response_data
        })

    def test_api_root(self):
        """Test API root endpoint"""
        try:
            response = requests.get(f"{self.base_url}/", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_result("API Root", success, 
                          f"Status: {response.status_code}", data)
            return success
        except Exception as e:
            self.log_result("API Root", False, f"Error: {str(e)}")
            return False

    def test_get_habits_empty(self):
        """Test getting habits when none exist"""
        try:
            response = requests.get(f"{self.base_url}/habits", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else []
            self.log_result("Get Habits (Empty)", success, 
                          f"Status: {response.status_code}, Count: {len(data)}", data)
            return success, data
        except Exception as e:
            self.log_result("Get Habits (Empty)", False, f"Error: {str(e)}")
            return False, []

    def test_create_habit(self, name="Test Habit", description="Test Description"):
        """Test creating a new habit"""
        try:
            payload = {
                "name": name,
                "description": description,
                "frequency": "daily"
            }
            response = requests.post(f"{self.base_url}/habits", 
                                   json=payload, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            if success and 'id' in data:
                self.created_habit_ids.append(data['id'])
            
            self.log_result("Create Habit", success, 
                          f"Status: {response.status_code}", data)
            return success, data
        except Exception as e:
            self.log_result("Create Habit", False, f"Error: {str(e)}")
            return False, {}

    def test_get_habits_with_data(self):
        """Test getting habits when data exists"""
        try:
            response = requests.get(f"{self.base_url}/habits", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else []
            self.log_result("Get Habits (With Data)", success, 
                          f"Status: {response.status_code}, Count: {len(data)}", data)
            return success, data
        except Exception as e:
            self.log_result("Get Habits (With Data)", False, f"Error: {str(e)}")
            return False, []

    def test_log_habit(self, habit_id):
        """Test logging a habit completion"""
        try:
            payload = {
                "habit_id": habit_id,
                "completed": True
            }
            response = requests.post(f"{self.base_url}/habits/log", 
                                   json=payload, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_result("Log Habit", success, 
                          f"Status: {response.status_code}", data)
            return success, data
        except Exception as e:
            self.log_result("Log Habit", False, f"Error: {str(e)}")
            return False, {}

    def test_update_habit(self, habit_id):
        """Test updating a habit"""
        try:
            payload = {
                "name": "Updated Test Habit",
                "description": "Updated description"
            }
            response = requests.put(f"{self.base_url}/habits/{habit_id}", 
                                  json=payload, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_result("Update Habit", success, 
                          f"Status: {response.status_code}", data)
            return success, data
        except Exception as e:
            self.log_result("Update Habit", False, f"Error: {str(e)}")
            return False, {}

    def test_bulk_log_habits(self):
        """Test bulk logging habits"""
        if not self.created_habit_ids:
            self.log_result("Bulk Log Habits", False, "No habits to log")
            return False
        
        try:
            response = requests.post(f"{self.base_url}/habits/bulk-log", 
                                   json=self.created_habit_ids, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else []
            self.log_result("Bulk Log Habits", success, 
                          f"Status: {response.status_code}, Count: {len(data)}", data)
            return success, data
        except Exception as e:
            self.log_result("Bulk Log Habits", False, f"Error: {str(e)}")
            return False, []

    def test_get_stats(self):
        """Test getting user statistics"""
        try:
            response = requests.get(f"{self.base_url}/stats", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_result("Get Stats", success, 
                          f"Status: {response.status_code}", data)
            return success, data
        except Exception as e:
            self.log_result("Get Stats", False, f"Error: {str(e)}")
            return False, {}

    def test_get_challenges(self):
        """Test getting preset challenges"""
        try:
            response = requests.get(f"{self.base_url}/challenges", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else []
            self.log_result("Get Challenges", success, 
                          f"Status: {response.status_code}, Count: {len(data)}", data)
            return success, data
        except Exception as e:
            self.log_result("Get Challenges", False, f"Error: {str(e)}")
            return False, []

    def test_create_community_post(self):
        """Test creating a community post"""
        try:
            payload = {
                "content": "Test community post from API testing"
            }
            response = requests.post(f"{self.base_url}/community", 
                                   json=payload, timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            
            if success and 'id' in data:
                self.created_post_ids.append(data['id'])
            
            self.log_result("Create Community Post", success, 
                          f"Status: {response.status_code}", data)
            return success, data
        except Exception as e:
            self.log_result("Create Community Post", False, f"Error: {str(e)}")
            return False, {}

    def test_get_community_posts(self):
        """Test getting community posts"""
        try:
            response = requests.get(f"{self.base_url}/community", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else []
            self.log_result("Get Community Posts", success, 
                          f"Status: {response.status_code}, Count: {len(data)}", data)
            return success, data
        except Exception as e:
            self.log_result("Get Community Posts", False, f"Error: {str(e)}")
            return False, []

    def test_like_post(self):
        """Test liking a community post"""
        if not self.created_post_ids:
            self.log_result("Like Post", False, "No posts to like")
            return False
        
        try:
            post_id = self.created_post_ids[0]
            response = requests.post(f"{self.base_url}/community/{post_id}/like", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_result("Like Post", success, 
                          f"Status: {response.status_code}", data)
            return success, data
        except Exception as e:
            self.log_result("Like Post", False, f"Error: {str(e)}")
            return False, {}

    def test_ai_chat(self):
        """Test AI coach chat functionality"""
        try:
            payload = {
                "message": "How can I build better habits?",
                "session_id": None
            }
            response = requests.post(f"{self.base_url}/chat", 
                                   json=payload, timeout=30)  # Longer timeout for AI
            success = response.status_code == 200
            data = response.json() if success else {}
            
            # Check if response contains expected fields
            if success and 'response' in data and 'session_id' in data:
                details = f"Status: {response.status_code}, Response length: {len(data.get('response', ''))}"
            else:
                success = False
                details = f"Status: {response.status_code}, Missing fields in response"
            
            self.log_result("AI Chat", success, details, data)
            return success, data
        except Exception as e:
            self.log_result("AI Chat", False, f"Error: {str(e)}")
            return False, {}

    def test_seed_data(self):
        """Test seeding sample data"""
        try:
            response = requests.post(f"{self.base_url}/seed", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_result("Seed Data", success, 
                          f"Status: {response.status_code}", data)
            return success, data
        except Exception as e:
            self.log_result("Seed Data", False, f"Error: {str(e)}")
            return False, {}

    def test_delete_habit(self, habit_id):
        """Test deleting a habit"""
        try:
            response = requests.delete(f"{self.base_url}/habits/{habit_id}", timeout=10)
            success = response.status_code == 200
            data = response.json() if success else {}
            self.log_result("Delete Habit", success, 
                          f"Status: {response.status_code}", data)
            return success, data
        except Exception as e:
            self.log_result("Delete Habit", False, f"Error: {str(e)}")
            return False, {}

    def cleanup(self):
        """Clean up created test data"""
        print("\n🧹 Cleaning up test data...")
        for habit_id in self.created_habit_ids:
            try:
                requests.delete(f"{self.base_url}/habits/{habit_id}", timeout=5)
            except:
                pass

    def run_all_tests(self):
        """Run comprehensive test suite"""
        print("🚀 Starting Awesome Life Habits API Tests")
        print(f"📡 Testing endpoint: {self.base_url}")
        print("=" * 60)

        # Basic connectivity
        if not self.test_api_root():
            print("❌ API not accessible, stopping tests")
            return False

        # Habits CRUD operations
        success, initial_habits = self.test_get_habits_empty()
        
        # Create test habits
        success1, habit1 = self.test_create_habit("Morning Meditation", "5 minutes of mindfulness")
        success2, habit2 = self.test_create_habit("Evening Walk", "30 minute nature walk")
        
        if success1 and success2:
            # Test habit operations
            self.test_get_habits_with_data()
            self.test_log_habit(habit1['id'])
            self.test_update_habit(habit1['id'])
            self.test_bulk_log_habits()
        
        # Stats and challenges
        self.test_get_stats()
        self.test_get_challenges()
        
        # Community features
        self.test_create_community_post()
        self.test_get_community_posts()
        self.test_like_post()
        
        # AI Integration (critical test)
        print("\n🤖 Testing AI Integration...")
        self.test_ai_chat()
        
        # Seed data
        self.test_seed_data()
        
        # Cleanup
        if self.created_habit_ids:
            self.test_delete_habit(self.created_habit_ids[0])
        
        # Final results
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = HabitsAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⏹️  Tests interrupted")
        return 1
    finally:
        tester.cleanup()

if __name__ == "__main__":
    sys.exit(main())