import base64
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from . import ai_features
import json


def err(msg, code=400):
    return Response({"error": msg}, status=code)


def safe_call(fn, *args, **kwargs):
    try:
        return Response(fn(*args, **kwargs))
    except json.JSONDecodeError:
        return Response({"error": "AI returned malformed response"}, status=502)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


# ── 🧠 AI-EXCLUSIVE ──────────────────────────────────────────

class SellerPsychologyView(APIView):
    def post(self, req):
        text = req.data.get("listingText", "").strip()
        if not text: return err("listingText required")
        return safe_call(ai_features.seller_psychology, text)


class FakeDiscountView(APIView):
    def post(self, req):
        d = req.data
        try:
            orig = float(d["originalPrice"])
            sale = float(d["salePrice"])
        except (KeyError, ValueError): return err("originalPrice and salePrice required")
        return safe_call(ai_features.fake_discount, orig, sale,
                         d.get("productName",""), d.get("context",""))


class ReviewSentimentView(APIView):
    def post(self, req):
        d = req.data
        reviews = d.get("reviews","").strip()
        if not reviews: return err("reviews required")
        try: price = float(d.get("price", 0))
        except ValueError: return err("price must be a number")
        return safe_call(ai_features.review_sentiment_price,
                         reviews, d.get("productName",""), price, d.get("currency","USD"))


class BundleTrapView(APIView):
    def post(self, req):
        d = req.data
        desc = d.get("bundleDescription","").strip()
        if not desc: return err("bundleDescription required")
        try: price = float(d["bundlePrice"])
        except (KeyError, ValueError): return err("bundlePrice required")
        return safe_call(ai_features.bundle_trap, desc, price, d.get("currency","USD"))


class RegionalArbitrageView(APIView):
    def post(self, req):
        d = req.data
        try: local_price = float(d["localPrice"])
        except (KeyError, ValueError): return err("localPrice required")
        return safe_call(ai_features.regional_arbitrage,
                         d.get("productName",""), d.get("category",""),
                         local_price, d.get("localCurrency","INR"))


# ── 📸 VISUAL ────────────────────────────────────────────────

class ImageAnalyzerView(APIView):
    def post(self, req):
        d = req.data
        image_data = d.get("imageBase64","").strip()
        if not image_data: return err("imageBase64 required")
        media_type  = d.get("mediaType", "image/jpeg")
        mode        = d.get("mode", "product")
        if mode not in ("product","receipt","price_tag"): return err("mode must be product|receipt|price_tag")
        # strip data URL prefix if present
        if "," in image_data: image_data = image_data.split(",")[1]
        return safe_call(ai_features.analyze_image, image_data, media_type, mode)


# ── 🤝 SOCIAL ────────────────────────────────────────────────

class NegotiationScriptView(APIView):
    def post(self, req):
        d = req.data
        try:
            listed = float(d["listedPrice"])
            fair   = float(d["fairPrice"])
        except (KeyError, ValueError): return err("listedPrice and fairPrice required")
        return safe_call(ai_features.negotiation_script,
                         d.get("productName",""), listed, fair,
                         d.get("currency","USD"), d.get("marketplace",""),
                         d.get("context",""))


class PriceShameView(APIView):
    def post(self, req):
        d = req.data
        try: price = float(d["listedPrice"])
        except (KeyError, ValueError): return err("listedPrice required")
        return safe_call(ai_features.price_shame_score,
                         d.get("sellerName","Unknown"), d.get("productName",""),
                         price, d.get("category",""), d.get("marketplace",""))


# ── 🎯 NICHE ─────────────────────────────────────────────────

class EMITrapView(APIView):
    def post(self, req):
        d = req.data
        try:
            pp  = float(d["productPrice"])
            emi = float(d["emiAmount"])
            ten = int(d["tenureMonths"])
            fee = float(d.get("processingFee", 0))
            int_ = float(d.get("claimedInterest", 0))
        except (KeyError, ValueError): return err("productPrice, emiAmount, tenureMonths required")
        return safe_call(ai_features.emi_trap, pp, emi, ten, fee, d.get("currency","INR"), int_)


class SubscriptionAnalyzerView(APIView):
    def post(self, req):
        d = req.data
        try: price = float(d["monthlyPrice"])
        except (KeyError, ValueError): return err("monthlyPrice required")
        return safe_call(ai_features.subscription_analyzer,
                         d.get("serviceName",""), d.get("planName",""),
                         price, d.get("currency","USD"), d.get("features",""))


class SecondhandValidatorView(APIView):
    def post(self, req):
        d = req.data
        try:
            price = float(d["listedPrice"])
            age   = float(d.get("ageYears", 1))
        except (KeyError, ValueError): return err("listedPrice required")
        return safe_call(ai_features.secondhand_validator,
                         d.get("productName",""), d.get("category",""),
                         price, d.get("currency","INR"), d.get("condition","Used"),
                         age, d.get("description",""), d.get("platform","OLX"))


class AuctionAdvisorView(APIView):
    def post(self, req):
        d = req.data
        try:
            bid = float(d["currentBid"])
        except (KeyError, ValueError): return err("currentBid required")
        return safe_call(ai_features.auction_advisor,
                         d.get("productName",""), d.get("category",""),
                         bid, d.get("currency","INR"),
                         d.get("timeRemaining","1 hour"),
                         d.get("condition","Used"),
                         int(d.get("numBidders", 1)))
