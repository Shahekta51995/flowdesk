# docker/superset/superset_config.py

try:
    import pymysql
    pymysql.install_as_MySQLdb()
except ImportError:
    pass

FEATURE_FLAGS = {
    "EMBEDDED_SUPERSET": True,
}

# Allow embedding in iframes from your app
HTTP_HEADERS = {"X-Frame-Options": "ALLOWALL"}

TALISMAN_ENABLED = False

# CORS — allow your Next.js app to call Superset API
ENABLE_CORS = True
CORS_OPTIONS = {
    "origins": ["http://localhost", "http://localhost:3000", "http://localhost:8089"],
    "supports_credentials": True,
}

WTF_CSRF_ENABLED = False
WTF_CSRF_EXEMPT_LIST = [
    "superset.views.core.log",
    "superset.charts.api",
    "superset.dashboards.api",
    "superset.embedded.api",
]
GUEST_TOKEN_JWT_SECRET = "flowdesk_guest_secret_key_change_me_05121995"
GUEST_TOKEN_JWT_ALGO = "HS256"
GUEST_TOKEN_HEADER_NAME = "X-GuestToken"
GUEST_TOKEN_JWT_EXP_SECONDS = 300
GUEST_ROLE_NAME = "Public"
GUEST_TOKEN_JWT_AUDIENCE = "http://localhost:8089/"
PUBLIC_ROLE_LIKE_GAMMA = True

SUPERSET_WEBSERVER_ADDRESS = "localhost"
SUPERSET_WEBSERVER_PORT = 8089

FEATURE_FLAGS = {
        "EMBEDDED_SUPERSET": True,
        "GUEST_ROLE_SUPPORTED": True,
        "ENABLE_TEMPLATE_PROCESSING" : True,
    }