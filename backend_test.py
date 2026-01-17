#!/usr/bin/env python3
"""
MOT Platform Backend API Testing
Tests all endpoints, authentication, calculations, and business logic
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any

class MOTAPITester:
    def __init__(self, base_url="https://kpi-tracker-43.preview.emergentagent.com"):
        self.base_url = base_url
        self.admin_token = None
        self.agent_token = None
        self.admin_user = None
        self.agent_user = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def log_result(self, test_name: str, success: bool, details: str = ""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
            self.failed_tests.append(f"{test_name}: {details}")

    def make_request(self, method: str, endpoint: str, data: Dict = None, token: str = None) -> tuple:
        """Make HTTP request and return (success, response_data, status_code)"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if token:
            headers['Authorization'] = f'Bearer {token}'

        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers, timeout=10)
            else:
                return False, {}, 0

            return response.status_code < 400, response.json() if response.content else {}, response.status_code
        except Exception as e:
            return False, {"error": str(e)}, 0

    def test_admin_login(self):
        """Test admin login with provided credentials"""
        success, data, status = self.make_request('POST', 'auth/login', {
            'email': 'andre@mot.com',
            'password': 'admin123'
        })
        
        if success and 'token' in data:
            self.admin_token = data['token']
            self.admin_user = data['user']
            self.log_result("Admin Login", True)
            return True
        else:
            self.log_result("Admin Login", False, f"Status: {status}, Data: {data}")
            return False

    def test_agent_registration(self):
        """Test agent registration"""
        test_email = f"agent_test_{datetime.now().strftime('%H%M%S')}@test.com"
        success, data, status = self.make_request('POST', 'auth/register', {
            'name': 'Test Agent',
            'email': test_email,
            'password': 'test123',
            'role': 'agent'
        })
        
        if success and 'token' in data:
            self.agent_token = data['token']
            self.agent_user = data['user']
            self.log_result("Agent Registration", True)
            return True
        else:
            self.log_result("Agent Registration", False, f"Status: {status}, Data: {data}")
            return False

    def test_auth_me(self):
        """Test /auth/me endpoint"""
        success, data, status = self.make_request('GET', 'auth/me', token=self.admin_token)
        
        if success and data.get('email') == 'andre@mot.com':
            self.log_result("Auth Me Endpoint", True)
            return True
        else:
            self.log_result("Auth Me Endpoint", False, f"Status: {status}")
            return False

    def test_users_list_admin_only(self):
        """Test users list - admin only"""
        # Test with admin token
        success, data, status = self.make_request('GET', 'users', token=self.admin_token)
        admin_success = success and isinstance(data, list)
        
        # Test with agent token (should fail)
        success, data, status = self.make_request('GET', 'users', token=self.agent_token)
        agent_denied = status == 403
        
        if admin_success and agent_denied:
            self.log_result("Users List Access Control", True)
            return True
        else:
            self.log_result("Users List Access Control", False, f"Admin: {admin_success}, Agent denied: {agent_denied}")
            return False

    def test_kpi_operations(self):
        """Test KPI CRUD operations"""
        current_month = datetime.now().strftime("%Y-%m")
        user_id = self.agent_user['id']
        
        # Get KPI (should create if not exists)
        success, kpi_data, status = self.make_request('GET', f'kpis/{user_id}/{current_month}', token=self.agent_token)
        get_success = success and 'novos_ativos_meta' in kpi_data
        
        # Update KPI (admin only)
        update_data = {
            'novos_ativos_realizado': 8,
            'churn_realizado': 3.5,
            'tpv_m1_realizado': 75000.0,
            'ativos_m1_realizado': 7,
            'migracao_hunter_realizado': 65.0
        }
        success, updated_kpi, status = self.make_request('PUT', f'kpis/{user_id}/{current_month}', update_data, token=self.admin_token)
        update_success = success and updated_kpi.get('novos_ativos_realizado') == 8
        
        # Test agent cannot update KPI
        success, data, status = self.make_request('PUT', f'kpis/{user_id}/{current_month}', update_data, token=self.agent_token)
        agent_denied = status == 403
        
        if get_success and update_success and agent_denied:
            self.log_result("KPI Operations", True)
            return True
        else:
            self.log_result("KPI Operations", False, f"Get: {get_success}, Update: {update_success}, Agent denied: {agent_denied}")
            return False

    def test_bonus_calculations(self):
        """Test bonus system with calculations"""
        current_month = datetime.now().strftime("%Y-%m")
        user_id = self.agent_user['id']
        
        # Get bonus data
        success, bonus_data, status = self.make_request('GET', f'bonus/{user_id}/{current_month}', token=self.agent_token)
        get_success = success and 'faixas' in bonus_data
        
        if not get_success:
            self.log_result("Bonus Calculations", False, "Failed to get bonus data")
            return False
        
        # Update bonus with client counts (admin only)
        faixas = bonus_data['faixas']
        faixas[0]['clients_count'] = 2  # 15k+ faixa
        faixas[1]['clients_count'] = 1  # 30k+ faixa
        
        success, updated_bonus, status = self.make_request('PUT', f'bonus/{user_id}/{current_month}', {'faixas': faixas}, token=self.admin_token)
        
        if success:
            # Verify calculations
            expected_bonus_total = (2 * 50) + (1 * 100)  # 200
            actual_bonus_total = updated_bonus.get('bonus_total', 0)
            
            # Check if multiplicador is calculated based on KPI performance
            multiplicador = updated_bonus.get('multiplicador', 0)
            bonus_final = updated_bonus.get('bonus_final', 0)
            
            calculations_correct = (
                abs(actual_bonus_total - expected_bonus_total) < 0.01 and
                multiplicador >= 0 and multiplicador <= 1 and
                bonus_final >= 0
            )
            
            if calculations_correct:
                self.log_result("Bonus Calculations", True)
                return True
            else:
                self.log_result("Bonus Calculations", False, f"Expected: {expected_bonus_total}, Got: {actual_bonus_total}, Mult: {multiplicador}")
                return False
        else:
            self.log_result("Bonus Calculations", False, f"Update failed: {status}")
            return False

    def test_dashboard_endpoint(self):
        """Test dashboard data aggregation"""
        user_id = self.agent_user['id']
        success, dashboard_data, status = self.make_request('GET', f'dashboard/{user_id}', token=self.agent_token)
        
        if success and all(key in dashboard_data for key in ['user', 'kpi']):
            self.log_result("Dashboard Endpoint", True)
            return True
        else:
            self.log_result("Dashboard Endpoint", False, f"Status: {status}, Keys: {list(dashboard_data.keys()) if success else 'None'}")
            return False

    def test_forecast_operations(self):
        """Test forecast CRUD operations"""
        current_month = datetime.now().strftime("%Y-%m")
        user_id = self.agent_user['id']
        
        # Get forecast
        success, forecast_data, status = self.make_request('GET', f'forecast/{user_id}/{current_month}', token=self.agent_token)
        get_success = success and 'qualificacao' in forecast_data
        
        # Update forecast (admin only)
        update_data = {
            'qualificacao': 100,
            'proposta': 50,
            'novo_cliente': 25,
            'novo_ativo': 20
        }
        success, updated_forecast, status = self.make_request('PUT', f'forecast/{user_id}/{current_month}', update_data, token=self.admin_token)
        
        if success:
            # Check conversion calculations
            conv_qualif_proposta = updated_forecast.get('conv_qualif_proposta', 0)
            conv_proposta_cliente = updated_forecast.get('conv_proposta_cliente', 0)
            conv_cliente_ativo = updated_forecast.get('conv_cliente_ativo', 0)
            
            conversions_correct = (
                abs(conv_qualif_proposta - 50.0) < 0.01 and  # 50/100 * 100
                abs(conv_proposta_cliente - 50.0) < 0.01 and  # 25/50 * 100
                abs(conv_cliente_ativo - 80.0) < 0.01  # 20/25 * 100
            )
            
            if get_success and conversions_correct:
                self.log_result("Forecast Operations", True)
                return True
            else:
                self.log_result("Forecast Operations", False, f"Conversions: {conv_qualif_proposta}, {conv_proposta_cliente}, {conv_cliente_ativo}")
                return False
        else:
            self.log_result("Forecast Operations", False, f"Update failed: {status}")
            return False

    def test_competencias_operations(self):
        """Test competencias CRUD operations"""
        user_id = self.agent_user['id']
        
        # Get competencias
        success, comp_data, status = self.make_request('GET', f'competencias/{user_id}', token=self.agent_token)
        get_success = success and 'persistencia' in comp_data
        
        # Update competencias (user can update their own)
        update_data = {
            'persistencia': 4,
            'influencia': 5,
            'relacionamento': 3,
            'organizacao': 4,
            'criatividade': 5
        }
        success, updated_comp, status = self.make_request('PUT', f'competencias/{user_id}', update_data, token=self.agent_token)
        
        if success:
            # Check average calculation
            expected_media = (4 + 5 + 3 + 4 + 5) / 5  # 4.2
            actual_media = updated_comp.get('media', 0)
            
            media_correct = abs(actual_media - expected_media) < 0.01
            
            if get_success and media_correct:
                self.log_result("Competencias Operations", True)
                return True
            else:
                self.log_result("Competencias Operations", False, f"Expected media: {expected_media}, Got: {actual_media}")
                return False
        else:
            self.log_result("Competencias Operations", False, f"Update failed: {status}")
            return False

    def test_dre_operations(self):
        """Test DRE operations"""
        user_id = self.agent_user['id']
        
        # Create DRE (admin only)
        dre_data = {
            'month': '2025-01',
            'salario': 3000.0,
            'beneficios': 500.0,
            'receita': 5000.0
        }
        success, created_dre, status = self.make_request('POST', f'dre/{user_id}', dre_data, token=self.admin_token)
        
        if success:
            # Check calculations
            expected_custos = 3000.0 + 500.0  # 3500
            expected_roi = ((5000.0 - 3500.0) / 3500.0) * 100  # ~42.86%
            expected_payback = int(3500.0 / 5000.0)  # 0 months
            
            actual_custos = created_dre.get('custos_totais', 0)
            actual_roi = created_dre.get('roi_percent', 0)
            actual_payback = created_dre.get('payback_months', 0)
            
            calculations_correct = (
                abs(actual_custos - expected_custos) < 0.01 and
                abs(actual_roi - expected_roi) < 1.0 and
                actual_payback == expected_payback
            )
            
            # Get DRE list
            success, dre_list, status = self.make_request('GET', f'dre/{user_id}', token=self.agent_token)
            list_success = success and isinstance(dre_list, list) and len(dre_list) > 0
            
            if calculations_correct and list_success:
                self.log_result("DRE Operations", True)
                return True
            else:
                self.log_result("DRE Operations", False, f"Calc: {calculations_correct}, List: {list_success}")
                return False
        else:
            self.log_result("DRE Operations", False, f"Create failed: {status}")
            return False

    def test_extrato_endpoint(self):
        """Test extrato endpoint"""
        current_month = datetime.now().strftime("%Y-%m")
        user_id = self.agent_user['id']
        
        success, extrato_data, status = self.make_request('GET', f'extrato/{user_id}/{current_month}', token=self.agent_token)
        
        if success and 'bonus_time' in extrato_data:
            self.log_result("Extrato Endpoint", True)
            return True
        else:
            self.log_result("Extrato Endpoint", False, f"Status: {status}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("🚀 Starting MOT Backend API Tests...")
        print("=" * 50)
        
        # Authentication tests
        if not self.test_admin_login():
            print("❌ Cannot continue without admin login")
            return False
            
        if not self.test_agent_registration():
            print("❌ Cannot continue without agent registration")
            return False
        
        # Core functionality tests
        self.test_auth_me()
        self.test_users_list_admin_only()
        self.test_kpi_operations()
        self.test_bonus_calculations()
        self.test_dashboard_endpoint()
        self.test_forecast_operations()
        self.test_competencias_operations()
        self.test_dre_operations()
        self.test_extrato_endpoint()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Tests completed: {self.tests_passed}/{self.tests_run}")
        print(f"✅ Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        if self.failed_tests:
            print("\n❌ Failed tests:")
            for failure in self.failed_tests:
                print(f"  • {failure}")
        
        return self.tests_passed == self.tests_run

def main():
    tester = MOTAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())