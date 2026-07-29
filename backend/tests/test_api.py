import os

import pytest
from fastapi.testclient import TestClient

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from app.main import app
from app.database import Base, engine


@pytest.fixture(autouse=True, scope="session")
def setup_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


def test_root_endpoint():
    client = TestClient(app)
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to ChatHub API"}


def test_signup_and_login_workflow():
    client = TestClient(app)
    signup_payload = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "secret123",
    }

    signup_response = client.post("/auth/signup", json=signup_payload)
    assert signup_response.status_code == 200
    signup_data = signup_response.json()
    assert signup_data["username"] == "testuser"
    assert signup_data["email"] == "testuser@example.com"

    login_response = client.post(
        "/auth/login",
        json={"username": "testuser", "password": "secret123"},
    )
    assert login_response.status_code == 200
    login_data = login_response.json()
    assert login_data["token_type"] == "bearer"
    assert login_data["access_token"]


def test_websocket_token_auth_and_broadcast():
    client = TestClient(app)
    signup_payload = {
        "username": "wsuser",
        "email": "wsuser@example.com",
        "password": "secretpass",
    }
    client.post("/auth/signup", json=signup_payload)
    login_response = client.post(
        "/auth/login",
        json={"username": "wsuser", "password": "secretpass"},
    )
    assert login_response.status_code == 200
    token = login_response.json()["access_token"]

    with client.websocket_connect(f"/chat/ws/general?token={token}") as websocket:
        websocket.send_text('{"text":"hello from test"}')
        message = websocket.receive_text()

    data = __import__("json").loads(message)
    assert data["sender"] == "wsuser"
    assert data["text"] == "hello from test"
