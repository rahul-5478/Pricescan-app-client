import json
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .claude_service import analyze_price


class AnalyzeView(APIView):
    def post(self, request):
        data = request.data

        required = ["productName", "category", "listedPrice"]
        for field in required:
            if field not in data:
                return Response(
                    {"error": f"Missing required field: {field}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        try:
            price = float(data["listedPrice"])
            if price <= 0:
                raise ValueError("Price must be positive")
        except (TypeError, ValueError) as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        payload = {
            "productName": str(data["productName"])[:200],
            "category": str(data["category"])[:100],
            "listedPrice": price,
            "currency": str(data.get("currency", "USD"))[:10],
            "description": str(data.get("description", ""))[:2000],
            "marketplace": str(data.get("marketplace", ""))[:100],
        }

        try:
            result = analyze_price(payload)
            return Response(result, status=status.HTTP_200_OK)
        except json.JSONDecodeError:
            return Response(
                {"error": "AI returned malformed response"},
                status=status.HTTP_502_BAD_GATEWAY,
            )
        except Exception as e:
            return Response(
                {"error": f"Analysis failed: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class HealthView(APIView):
    def get(self, request):
        return Response({"status": "ok", "service": "django-ai"})
