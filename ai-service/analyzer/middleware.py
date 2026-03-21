from django.conf import settings
from django.http import JsonResponse


class InternalAuthMiddleware:
    """
    Validates that requests to /api/ come from the trusted Express server
    using a shared secret token in the X-Internal-Token header.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path.startswith("/api/"):
            token = request.headers.get("X-Internal-Token", "")
            if not settings.INTERNAL_AUTH_TOKEN or token != settings.INTERNAL_AUTH_TOKEN:
                return JsonResponse({"error": "Unauthorized"}, status=401)
        return self.get_response(request)
