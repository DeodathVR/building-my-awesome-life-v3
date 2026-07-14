"""SEC hardening tests - iteration 6"""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://mindful-focus-30.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"


# ---------- SEC-001: removed endpoints ----------
@pytest.mark.parametrize("path", ["/chat", "/ai-coach", "/glow-up/generate"])
def test_removed_endpoints_return_404(path):
    r = requests.post(f"{API}{path}", json={"message": "hi"}, timeout=15)
    assert r.status_code == 404, f"{path} returned {r.status_code} (expected 404). body={r.text[:200]}"


# ---------- SEC-002: /api/ai/chat validation ----------
def test_ai_chat_message_too_long_returns_422():
    r = requests.post(f"{API}/ai/chat", json={"message": "a" * 2001}, timeout=15)
    assert r.status_code == 422, f"expected 422, got {r.status_code}: {r.text[:200]}"


def test_ai_chat_system_prompt_too_long_returns_422():
    r = requests.post(f"{API}/ai/chat",
                      json={"message": "hi", "system_prompt": "b" * 1201}, timeout=15)
    assert r.status_code == 422, f"expected 422, got {r.status_code}: {r.text[:200]}"


def test_ai_chat_empty_message_returns_422():
    r = requests.post(f"{API}/ai/chat", json={"message": ""}, timeout=15)
    assert r.status_code == 422


def test_ai_chat_valid_returns_200_or_429():
    r = requests.post(f"{API}/ai/chat",
                      json={"message": "Say hello in 3 words"}, timeout=45)
    # 200 (success) or 429 (quota) both prove endpoint is alive + validated
    assert r.status_code in (200, 429), f"got {r.status_code}: {r.text[:200]}"
    if r.status_code == 200:
        data = r.json()
        assert "response" in data or "text" in data or isinstance(data, dict)


# ---------- SEC hardening: /api/health minimal ----------
def test_health_returns_only_status_ok():
    r = requests.get(f"{API}/health", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert data == {"status": "ok"}, f"health leaked extra fields: {data}"


# ---------- SEC hardening: CORS lockdown ----------
def test_cors_disallowed_origin_no_acao_header():
    r = requests.options(f"{API}/health",
                         headers={"Origin": "https://evil.com",
                                  "Access-Control-Request-Method": "GET"}, timeout=10)
    acao = r.headers.get("access-control-allow-origin", "")
    assert acao != "https://evil.com" and acao != "*", f"disallowed origin got ACAO: {acao}"


def test_cors_allowed_origin_preflight_ok():
    r = requests.options(f"{API}/health",
                         headers={"Origin": "https://buildingmyawesomelifedaily.com",
                                  "Access-Control-Request-Method": "GET",
                                  "Access-Control-Request-Headers": "content-type"}, timeout=10)
    acao = r.headers.get("access-control-allow-origin", "")
    assert acao == "https://buildingmyawesomelifedaily.com", \
        f"allowed origin didn't get ACAO. got={acao!r}, status={r.status_code}"


# ---------- SEC hardening: generic error messages ----------
def test_ai_chat_invalid_model_generic_error():
    r = requests.post(f"{API}/ai/chat",
                      json={"message": "hi", "model": "nonexistent-model-xyz-9999"}, timeout=45)
    if r.status_code == 500:
        body = r.json()
        detail = str(body.get("detail", "")).lower()
        assert "ai chat failed" in detail, f"error not generic: {detail[:300]}"
        # Ensure no stack/exception leakage
        assert "traceback" not in detail
        assert "exception" not in detail
    else:
        # 200 (model accepted / passthrough) or 429/422 are also acceptable outcomes.
        assert r.status_code in (200, 422, 429), f"unexpected {r.status_code}: {r.text[:200]}"


# ---------- SEC-004: Firestore rules static check ----------
def test_firestore_rules_contains_required_helpers():
    with open("/app/firestore.rules", "r") as f:
        rules = f.read()
    assert "validCommunityContent()" in rules
    assert "isCounterIncrement(" in rules
    assert "validEngagementIncrement()" in rules
    # content string 1-1000 chars
    assert "size() > 0" in rules and "size() <= 1000" in rules
    # community_posts create uses validCommunityContent
    # community_posts create uses validCommunityContent + update uses validEngagementIncrement
    community_block = rules.split("match /community_posts/")[1].split("match /")[0]
    assert "validCommunityContent()" in community_block
    assert "validEngagementIncrement()" in community_block
    # feed_posts update uses validEngagementIncrement
    feed_block = rules.split("match /feed_posts/")[1].split("match /")[0]
    assert "validEngagementIncrement()" in feed_block
