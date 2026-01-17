import requests
import sys
import json
from datetime import datetime

class MOTAPITester:
    def __init__(self, base_url="https://kpi-tracker-43.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.new_user_token = None
        self.new_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.current_month = datetime.now().strftime("%Y-%m")

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=30)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=30)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                except:
                    print("   Response: Non-JSON or empty")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error: {error_detail}")
                except:
                    print(f"   Raw response: {response.text[:200]}")

            return success, response.json() if response.status_code < 400 else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_admin_login(self):
        """Test admin login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data={"email": "andre@mot.com", "password": "admin123"}
        )
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   Admin user: {response.get('user', {}).get('name', 'Unknown')}")
            return True
        return False

    def test_new_user_registration(self):
        """Test new user registration"""
        timestamp = datetime.now().strftime("%H%M%S")
        test_email = f"maria.santos.{timestamp}@mot.com"
        
        success, response = self.run_test(
            "New User Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": f"Maria Santos {timestamp}",
                "email": test_email,
                "password": "agent123",
                "role": "agent"
            }
        )
        if success and 'token' in response:
            self.new_user_token = response['token']
            self.new_user_id = response.get('user', {}).get('id')
            print(f"   New user ID: {self.new_user_id}")
            print(f"   New user name: {response.get('user', {}).get('name')}")
            return True
        return False

    def test_new_user_dashboard(self):
        """Test dashboard access for new user - CRITICAL TEST"""
        if not self.new_user_id or not self.new_user_token:
            print("❌ Cannot test dashboard - no new user credentials")
            return False
            
        success, response = self.run_test(
            "New User Dashboard Access (CRITICAL)",
            "GET",
            f"dashboard/{self.new_user_id}",
            200,
            token=self.new_user_token
        )
        
        if success:
            print("   ✅ Dashboard data structure:")
            for key, value in response.items():
                if isinstance(value, dict):
                    print(f"     {key}: {list(value.keys()) if value else 'None'}")
                else:
                    print(f"     {key}: {type(value).__name__}")
        
        return success

    def test_new_user_kpi_access(self):
        """Test KPI access for new user"""
        if not self.new_user_id or not self.new_user_token:
            return False
            
        success, response = self.run_test(
            "New User KPI Access",
            "GET",
            f"kpis/{self.new_user_id}/{self.current_month}",
            200,
            token=self.new_user_token
        )
        
        if success and response:
            print(f"   KPI ID: {response.get('id', 'Missing')}")
            print(f"   Novos Ativos Meta: {response.get('novos_ativos_meta', 'Missing')}")
        
        return success

    def test_new_user_bonus_access(self):
        """Test Bonus access for new user"""
        if not self.new_user_id or not self.new_user_token:
            return False
            
        success, response = self.run_test(
            "New User Bonus Access",
            "GET",
            f"bonus/{self.new_user_id}/{self.current_month}",
            200,
            token=self.new_user_token
        )
        
        if success and response:
            print(f"   Bonus ID: {response.get('id', 'Missing')}")
            print(f"   Faixas count: {len(response.get('faixas', []))}")
        
        return success

    def test_new_user_forecast_access(self):
        """Test Forecast access for new user"""
        if not self.new_user_id or not self.new_user_token:
            return False
            
        success, response = self.run_test(
            "New User Forecast Access",
            "GET",
            f"forecast/{self.new_user_id}/{self.current_month}",
            200,
            token=self.new_user_token
        )
        
        if success and response:
            print(f"   Forecast ID: {response.get('id', 'Missing')}")
            print(f"   Qualificacao: {response.get('qualificacao', 'Missing')}")
        
        return success

    def test_new_user_competencias_access(self):
        """Test Competencias access for new user"""
        if not self.new_user_id or not self.new_user_token:
            return False
            
        success, response = self.run_test(
            "New User Competencias Access",
            "GET",
            f"competencias/{self.new_user_id}",
            200,
            token=self.new_user_token
        )
        
        if success and response:
            print(f"   Competencias ID: {response.get('id', 'Missing')}")
            print(f"   Media: {response.get('media', 'Missing')}")
        
        return success

    def test_new_user_extrato_access(self):
        """Test Extrato access for new user"""
        if not self.new_user_id or not self.new_user_token:
            return False
            
        success, response = self.run_test(
            "New User Extrato Access",
            "GET",
            f"extrato/{self.new_user_id}/{self.current_month}",
            200,
            token=self.new_user_token
        )
        
        if success and response:
            print(f"   Extrato ID: {response.get('id', 'Missing')}")
            print(f"   Bonus Time: {response.get('bonus_time', 'Missing')}")
        
        return success

    def test_new_user_dre_access(self):
        """Test DRE access for new user"""
        if not self.new_user_id or not self.new_user_token:
            return False
            
        success, response = self.run_test(
            "New User DRE List Access",
            "GET",
            f"dre/{self.new_user_id}",
            200,
            token=self.new_user_token
        )
        
        if success:
            print(f"   DRE entries count: {len(response) if isinstance(response, list) else 'Not a list'}")
        
        return success

    def test_admin_edit_new_user_kpi(self):
        """Test admin editing KPI for new user"""
        if not self.new_user_id or not self.admin_token:
            return False
            
        success, response = self.run_test(
            "Admin Edit New User KPI",
            "PUT",
            f"kpis/{self.new_user_id}/{self.current_month}",
            200,
            data={
                "novos_ativos_realizado": 8,
                "tpv_m1_realizado": 75000.0,
                "churn_realizado": 3.5
            },
            token=self.admin_token
        )
        
        if success and response:
            print(f"   Updated Novos Ativos: {response.get('novos_ativos_realizado', 'Missing')}")
            print(f"   Updated TPV M1: {response.get('tpv_m1_realizado', 'Missing')}")
        
        return success

    def test_bonus_calculation(self):
        """Test automatic bonus calculation"""
        if not self.new_user_id or not self.admin_token:
            return False
            
        # Update bonus faixas to trigger calculation
        faixas_data = [
            {"faixa": "15k+", "tpv_min": 15000, "bonus_per_client": 50, "meta_min_clients": 5, "clients_count": 3},
            {"faixa": "30k+", "tpv_min": 30000, "bonus_per_client": 100, "meta_min_clients": 4, "clients_count": 2},
            {"faixa": "50k+", "tpv_min": 50000, "bonus_per_client": 200, "meta_min_clients": 3, "clients_count": 1},
            {"faixa": "100k+", "tpv_min": 100000, "bonus_per_client": 400, "meta_min_clients": 2, "clients_count": 0},
            {"faixa": "200k+", "tpv_min": 200000, "bonus_per_client": 800, "meta_min_clients": 1, "clients_count": 0}
        ]
        
        success, response = self.run_test(
            "Bonus Calculation Test",
            "PUT",
            f"bonus/{self.new_user_id}/{self.current_month}",
            200,
            data={"faixas": faixas_data},
            token=self.admin_token
        )
        
        if success and response:
            print(f"   Bonus Total: {response.get('bonus_total', 'Missing')}")
            print(f"   Multiplicador: {response.get('multiplicador', 'Missing')}")
            print(f"   Bonus Final: {response.get('bonus_final', 'Missing')}")
        
        return success

def main():
    print("🚀 Starting MOT Platform API Testing - MongoDB ObjectId Fix Validation")
    print("=" * 80)
    
    tester = MOTAPITester()
    
    # Test admin login first
    if not tester.test_admin_login():
        print("❌ Admin login failed, stopping tests")
        return 1

    # Test new user registration
    if not tester.test_new_user_registration():
        print("❌ New user registration failed, stopping tests")
        return 1

    # CRITICAL TESTS - These were failing before the fix
    print("\n" + "="*50)
    print("🔥 CRITICAL TESTS - MongoDB ObjectId Fix Validation")
    print("="*50)
    
    critical_tests = [
        tester.test_new_user_dashboard,
        tester.test_new_user_kpi_access,
        tester.test_new_user_bonus_access,
        tester.test_new_user_forecast_access,
        tester.test_new_user_competencias_access,
        tester.test_new_user_extrato_access,
        tester.test_new_user_dre_access
    ]
    
    critical_passed = 0
    for test in critical_tests:
        if test():
            critical_passed += 1
    
    print(f"\n🎯 Critical Tests Results: {critical_passed}/{len(critical_tests)} passed")
    
    # Test admin functionality
    print("\n" + "="*50)
    print("👑 ADMIN FUNCTIONALITY TESTS")
    print("="*50)
    
    tester.test_admin_edit_new_user_kpi()
    tester.test_bonus_calculation()
    
    # Print final results
    print("\n" + "="*80)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    print(f"🎯 Critical Fix Success Rate: {critical_passed}/{len(critical_tests)} ({(critical_passed/len(critical_tests)*100):.1f}%)")
    
    if critical_passed == len(critical_tests):
        print("✅ MongoDB ObjectId bug appears to be FIXED!")
        return 0
    else:
        print("❌ MongoDB ObjectId bug still exists or new issues found")
        return 1

if __name__ == "__main__":
    sys.exit(main())