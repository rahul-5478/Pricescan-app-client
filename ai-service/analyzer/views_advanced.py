from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import ai_advanced
import json


def safe(fn, *args, **kwargs):
    try:
        return Response(fn(*args, **kwargs))
    except json.JSONDecodeError:
        return Response({"error":"AI returned malformed response"}, status=502)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


class ShoppingAssistantView(APIView):
    def post(self, req):
        d = req.data
        msg = d.get("message","").strip()
        if not msg: return Response({"error":"message required"}, status=400)
        return safe(ai_advanced.shopping_assistant, msg,
                    d.get("scanHistory",[]), d.get("budgetInfo",""))


class PriceDropPredictorView(APIView):
    def post(self, req):
        d = req.data
        try: price = float(d["currentPrice"])
        except: return Response({"error":"currentPrice required"}, status=400)
        return safe(ai_advanced.price_drop_predictor,
                    d.get("productName",""), d.get("category",""),
                    price, d.get("currency","INR"), d.get("marketplace",""))


class FakeProductDetectorView(APIView):
    def post(self, req):
        d = req.data
        try: price = float(d.get("price",0))
        except: price = 0
        return safe(ai_advanced.fake_product_detector,
                    d.get("productName",""), d.get("description",""),
                    price, d.get("currency","INR"),
                    d.get("sellerName",""), d.get("imageDescription",""))


class ReturnPolicyView(APIView):
    def post(self, req):
        d = req.data
        text = d.get("policyText","").strip()
        if not text: return Response({"error":"policyText required"}, status=400)
        return safe(ai_advanced.return_policy_analyzer,
                    text, d.get("productName",""), d.get("platform",""))


class CompetitorPriceView(APIView):
    def post(self, req):
        d = req.data
        try: price = float(d["currentPrice"])
        except: return Response({"error":"currentPrice required"}, status=400)
        return safe(ai_advanced.competitor_price_finder,
                    d.get("productName",""), d.get("category",""),
                    price, d.get("currency","INR"))


class SpendingReportView(APIView):
    def post(self, req):
        d = req.data
        analyses = d.get("analyses",[])
        if not analyses: return Response({"error":"analyses required"}, status=400)
        return safe(ai_advanced.spending_report,
                    analyses, d.get("month",""), d.get("currency","INR"))


class PriceManipulationView(APIView):
    def post(self, req):
        d = req.data
        desc = d.get("priceHistoryDesc","").strip()
        if not desc: return Response({"error":"priceHistoryDesc required"}, status=400)
        return safe(ai_advanced.price_manipulation_checker,
                    d.get("productName",""), desc, d.get("saleEvent",""))
