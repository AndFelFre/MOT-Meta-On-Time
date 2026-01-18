"""
Test suite for MOT Platform - Gamification and Career Config Features
Tests: /gamification/*, /career-levels/* endpoints
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://goal-meta.preview.emergentagent.com').rstrip('/')

class TestAuth:
    """Authentication tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        """Get admin authentication token"""
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        data = response.json()
        assert "token" in data
        assert "user" in data
        assert data["user"]["role"] == "admin"
        return data["token"]
    
    def test_admin_login(self, admin_token):
        """Test admin login returns valid token"""
        assert admin_token is not None
        assert len(admin_token) > 0


class TestGamificationBadges:
    """Gamification badges endpoint tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_get_all_badges(self, admin_token):
        """Test GET /gamification/badges returns all badge definitions"""
        response = requests.get(
            f"{BASE_URL}/api/gamification/badges",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        badges = response.json()
        assert isinstance(badges, dict)
        assert len(badges) >= 10  # Should have at least 10 badges
        
        # Verify badge structure
        expected_badges = ["first_sale", "goal_crusher", "streak_3", "low_churn", "top_tpv"]
        for badge_id in expected_badges:
            assert badge_id in badges
            badge = badges[badge_id]
            assert "name" in badge
            assert "description" in badge
            assert "icon" in badge
            assert "points" in badge
            assert isinstance(badge["points"], int)


class TestGamificationRanking:
    """Gamification ranking endpoint tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_get_ranking(self, admin_token):
        """Test GET /gamification/ranking returns ranking list"""
        response = requests.get(
            f"{BASE_URL}/api/gamification/ranking",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        ranking = response.json()
        assert isinstance(ranking, list)
        
        # Verify ranking structure if not empty
        if len(ranking) > 0:
            item = ranking[0]
            assert "user_id" in item
            assert "name" in item
            assert "career_level" in item
            assert "atingimento" in item
            assert "total_points" in item
            assert "badges_count" in item
            assert "position" in item
            assert item["position"] == 1  # First item should be position 1


class TestGamificationUser:
    """Gamification user data endpoint tests"""
    
    @pytest.fixture(scope="class")
    def admin_data(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        data = response.json()
        return {"token": data["token"], "user_id": data["user"]["id"]}
    
    def test_get_user_gamification(self, admin_data):
        """Test GET /gamification/user/{user_id} returns user gamification data"""
        response = requests.get(
            f"{BASE_URL}/api/gamification/user/{admin_data['user_id']}",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert "total_points" in data
        assert "badges" in data
        assert "streak_months" in data
        assert isinstance(data["badges"], list)
        assert isinstance(data["total_points"], int)


class TestCareerLevels:
    """Career levels CRUD endpoint tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    def test_get_career_levels(self, admin_token):
        """Test GET /career-levels returns all career levels"""
        response = requests.get(
            f"{BASE_URL}/api/career-levels",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        levels = response.json()
        assert isinstance(levels, list)
        assert len(levels) >= 5  # Should have at least 5 default levels
        
        # Verify level structure
        level = levels[0]
        assert "id" in level
        assert "level" in level
        assert "order" in level
        assert "requirements" in level
        assert "tpv_min" in level
        assert "time_min" in level
        assert "bonus_percent" in level
        assert "benefits" in level
        assert "color" in level
        
        # Verify ordering
        for i in range(1, len(levels)):
            assert levels[i]["order"] >= levels[i-1]["order"]
    
    def test_create_career_level(self, admin_token):
        """Test POST /career-levels creates new level"""
        unique_name = f"TEST_Level_{uuid.uuid4().hex[:8]}"
        new_level = {
            "level": unique_name,
            "requirements": "Test requirements",
            "tpv_min": 999999,
            "time_min": 99,
            "bonus_percent": 99,
            "benefits": "Test benefits",
            "color": "#FF0000"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/career-levels",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json=new_level
        )
        assert response.status_code == 200
        
        created = response.json()
        assert "id" in created
        assert created["level"] == unique_name
        assert created["tpv_min"] == 999999
        assert created["bonus_percent"] == 99
        
        # Cleanup - delete the test level
        delete_response = requests.delete(
            f"{BASE_URL}/api/career-levels/{created['id']}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert delete_response.status_code == 200
    
    def test_update_career_level(self, admin_token):
        """Test PUT /career-levels/{level_id} updates level"""
        # First get current recruta level
        get_response = requests.get(
            f"{BASE_URL}/api/career-levels",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        levels = get_response.json()
        recruta = next((l for l in levels if l["id"] == "recruta"), None)
        original_requirements = recruta["requirements"] if recruta else "Entrada na empresa"
        
        # Update
        update_data = {"requirements": "TEST_Updated requirements"}
        response = requests.put(
            f"{BASE_URL}/api/career-levels/recruta",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json=update_data
        )
        assert response.status_code == 200
        
        updated = response.json()
        assert updated["requirements"] == "TEST_Updated requirements"
        
        # Restore original
        restore_response = requests.put(
            f"{BASE_URL}/api/career-levels/recruta",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json={"requirements": original_requirements}
        )
        assert restore_response.status_code == 200
    
    def test_delete_career_level(self, admin_token):
        """Test DELETE /career-levels/{level_id} removes level"""
        # Create a test level first
        new_level = {
            "level": f"TEST_Delete_{uuid.uuid4().hex[:8]}",
            "requirements": "To be deleted",
            "tpv_min": 0,
            "time_min": 0,
            "bonus_percent": 0,
            "benefits": "None",
            "color": "#000000"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/career-levels",
            headers={"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"},
            json=new_level
        )
        created_id = create_response.json()["id"]
        
        # Delete
        response = requests.delete(
            f"{BASE_URL}/api/career-levels/{created_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert "message" in response.json()
        
        # Verify deletion
        get_response = requests.get(
            f"{BASE_URL}/api/career-levels",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        levels = get_response.json()
        assert not any(l["id"] == created_id for l in levels)


class TestAwardBadge:
    """Award badge endpoint tests"""
    
    @pytest.fixture(scope="class")
    def admin_token(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        return response.json()["token"]
    
    @pytest.fixture(scope="class")
    def agent_user_id(self, admin_token):
        """Get an agent user ID for testing"""
        response = requests.get(
            f"{BASE_URL}/api/gamification/ranking",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        ranking = response.json()
        if ranking:
            return ranking[0]["user_id"]
        pytest.skip("No agent users available for badge award test")
    
    def test_award_badge_to_user(self, admin_token, agent_user_id):
        """Test POST /gamification/award-badge/{user_id} awards badge"""
        response = requests.post(
            f"{BASE_URL}/api/gamification/award-badge/{agent_user_id}?badge_id=rising_star",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "message" in data
        assert "points" in data
        assert data["points"] == 100  # rising_star badge gives 100 points
    
    def test_award_invalid_badge(self, admin_token, agent_user_id):
        """Test awarding invalid badge returns error"""
        response = requests.post(
            f"{BASE_URL}/api/gamification/award-badge/{agent_user_id}?badge_id=invalid_badge",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 400


class TestDashboardAdmin:
    """Admin dashboard endpoint tests"""
    
    @pytest.fixture(scope="class")
    def admin_data(self):
        response = requests.post(f"{BASE_URL}/api/auth/login", json={
            "email": "admin@mot.com",
            "password": "admin123"
        })
        data = response.json()
        return {"token": data["token"], "user_id": data["user"]["id"]}
    
    def test_get_dashboard(self, admin_data):
        """Test GET /dashboard/{user_id} returns dashboard data"""
        response = requests.get(
            f"{BASE_URL}/api/dashboard/{admin_data['user_id']}",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "user" in data
        assert "kpi" in data
    
    def test_get_users_list(self, admin_data):
        """Test GET /users returns users list for admin"""
        response = requests.get(
            f"{BASE_URL}/api/users",
            headers={"Authorization": f"Bearer {admin_data['token']}"}
        )
        assert response.status_code == 200
        
        users = response.json()
        assert isinstance(users, list)
        assert len(users) > 0


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
