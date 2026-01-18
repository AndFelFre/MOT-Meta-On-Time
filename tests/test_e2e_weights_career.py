"""
E2E Tests for MOT Platform - KPI Weights Validation and Career Auto-Check
Tests: KPI weights sum validation, Career progression auto-check
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://goal-meta.preview.emergentagent.com').rstrip('/')


class TestKPIWeightsValidation:
    """Test KPI weights sum validation"""
    
    @pytest.fixture(scope="class")
    def admin_data(self):
        """Get admin token and user data"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        assert response.status_code == 200
        data = response.json()
        return {"token": data["token"], "user": data["user"]}
    
    @pytest.fixture(scope="class")
    def agent_id(self, admin_data):
        """Get an agent user ID for testing"""
        response = requests.get(
            f"{BASE_URL}/api/users",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        users = response.json()
        agents = [u for u in users if u.get("role") == "agent"]
        if agents:
            return agents[0]["id"]
        return admin_data["user"]["id"]
    
    def test_kpi_weights_sum_valid(self, admin_data, agent_id):
        """Test that KPI update succeeds with weights sum = 1"""
        # Valid weights summing to 1.0
        valid_kpis = {
            "novos_ativos": 12,
            "novos_ativos_realizado": 10,
            "churn": 5,
            "churn_realizado": 3,
            "tpv_m1": 100000,
            "tpv_m1_realizado": 80000,
            "ativos_m1": 10,
            "ativos_m1_realizado": 8,
            "migracao_hunter": 70,
            "migracao_hunter_realizado": 60,
            "peso_novos_ativos": 0.3,
            "peso_churn": 0.2,
            "peso_tpv_m1": 0.2,
            "peso_ativos_m1": 0.15,
            "peso_migracao_hunter": 0.15
        }
        
        # Calculate sum
        total_weight = (
            valid_kpis["peso_novos_ativos"] +
            valid_kpis["peso_churn"] +
            valid_kpis["peso_tpv_m1"] +
            valid_kpis["peso_ativos_m1"] +
            valid_kpis["peso_migracao_hunter"]
        )
        assert abs(total_weight - 1.0) < 0.01, "Test data weights should sum to 1"
        
        # Update KPIs
        current_month = "2026-01"
        response = requests.put(
            f"{BASE_URL}/api/kpis/{agent_id}/{current_month}",
            headers={
                "Authorization": f"Bearer {admin_data['token']}",
                "Content-Type": "application/json"
            },
            json=valid_kpis
        )
        
        assert response.status_code == 200, f"KPI update should succeed: {response.text}"
    
    def test_kpi_get_returns_valid_structure(self, admin_data, agent_id):
        """Test that GET KPI returns proper structure with all fields"""
        current_month = "2026-01"
        response = requests.get(
            f"{BASE_URL}/api/kpis/{agent_id}/{current_month}",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify essential fields exist
        assert "user_id" in data
        assert "month" in data
        
        # Verify KPI fields
        kpi_fields = ["novos_ativos", "churn", "tpv_m1", "ativos_m1", "migracao_hunter"]
        for field in kpi_fields:
            assert field in data or f"{field}_realizado" in data


class TestCareerAutoCheck:
    """Test career progression auto-check functionality"""
    
    @pytest.fixture(scope="class")
    def admin_data(self):
        """Get admin token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        return {"token": response.json()["token"], "user": response.json()["user"]}
    
    def test_career_levels_order(self, admin_data):
        """Test career levels are properly ordered"""
        response = requests.get(
            f"{BASE_URL}/api/career-levels",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        
        assert response.status_code == 200
        levels = response.json()
        
        # Verify ordering
        for i in range(1, len(levels)):
            assert levels[i]["order"] >= levels[i-1]["order"], \
                f"Levels should be ordered: {levels[i-1]['level']} before {levels[i]['level']}"
    
    def test_career_level_has_progression_criteria(self, admin_data):
        """Test that career levels have TPV and time criteria for progression"""
        response = requests.get(
            f"{BASE_URL}/api/career-levels",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        
        levels = response.json()
        
        for level in levels:
            assert "tpv_min" in level, f"Level {level['level']} missing tpv_min"
            assert "time_min" in level, f"Level {level['level']} missing time_min"
            assert isinstance(level["tpv_min"], (int, float))
            assert isinstance(level["time_min"], (int, float))
    
    def test_career_progression_criteria_increases(self, admin_data):
        """Test that career progression criteria increases with levels"""
        response = requests.get(
            f"{BASE_URL}/api/career-levels",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        
        levels = response.json()
        
        # Skip first level (Recruta) which typically has 0 requirements
        for i in range(2, len(levels)):
            prev_level = levels[i-1]
            curr_level = levels[i]
            
            # TPV should increase or stay same
            assert curr_level["tpv_min"] >= prev_level["tpv_min"], \
                f"TPV should increase: {prev_level['level']} ({prev_level['tpv_min']}) -> {curr_level['level']} ({curr_level['tpv_min']})"
    
    def test_user_profile_has_career_level(self, admin_data):
        """Test that user profile includes career level field"""
        response = requests.get(
            f"{BASE_URL}/api/users/{admin_data['user']['id']}",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        
        assert response.status_code == 200
        user = response.json()
        
        assert "career_level" in user, "User should have career_level field"
        assert user["career_level"] is not None


class TestDashboardDataIntegrity:
    """Test dashboard data integrity and null safety"""
    
    @pytest.fixture(scope="class")
    def admin_data(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        return {"token": response.json()["token"], "user": response.json()["user"]}
    
    def test_dashboard_returns_valid_structure(self, admin_data):
        """Test dashboard endpoint returns complete structure without nulls causing crashes"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/{admin_data['user']['id']}",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # All these should exist (can be null but key must exist)
        assert "user" in data
        assert "kpi" in data
        assert "bonus" in data
    
    def test_users_list_returns_array(self, admin_data):
        """Test that users list always returns an array, never null"""
        response = requests.get(
            f"{BASE_URL}/api/users",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        
        assert response.status_code == 200
        users = response.json()
        
        assert isinstance(users, list), "Users endpoint should return array"
        # Should not be null
        assert users is not None
    
    def test_archived_users_returns_array(self, admin_data):
        """Test that archived users list always returns an array"""
        response = requests.get(
            f"{BASE_URL}/api/users/archived/list",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        
        assert response.status_code == 200
        users = response.json()
        
        assert isinstance(users, list), "Archived users endpoint should return array"


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
