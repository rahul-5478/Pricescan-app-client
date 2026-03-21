from django.urls import path
from .views import AnalyzeView, HealthView
from .views_features import (
    SellerPsychologyView, FakeDiscountView, ReviewSentimentView,
    BundleTrapView, RegionalArbitrageView, ImageAnalyzerView,
    NegotiationScriptView, PriceShameView, EMITrapView,
    SubscriptionAnalyzerView, SecondhandValidatorView, AuctionAdvisorView,
)
from .views_advanced import (
    ShoppingAssistantView, PriceDropPredictorView, FakeProductDetectorView,
    ReturnPolicyView, CompetitorPriceView, SpendingReportView, PriceManipulationView,
)

urlpatterns = [
    path("analyze/",               AnalyzeView.as_view()),
    path("health/",                HealthView.as_view()),

    # AI-Exclusive
    path("seller-psychology/",     SellerPsychologyView.as_view()),
    path("fake-discount/",         FakeDiscountView.as_view()),
    path("review-sentiment/",      ReviewSentimentView.as_view()),
    path("bundle-trap/",           BundleTrapView.as_view()),
    path("regional-arbitrage/",    RegionalArbitrageView.as_view()),

    # Visual
    path("image-analyze/",         ImageAnalyzerView.as_view()),

    # Social
    path("negotiation-script/",    NegotiationScriptView.as_view()),
    path("price-shame/",           PriceShameView.as_view()),

    # Niche
    path("emi-trap/",              EMITrapView.as_view()),
    path("subscription/",          SubscriptionAnalyzerView.as_view()),
    path("secondhand/",            SecondhandValidatorView.as_view()),
    path("auction-advisor/",       AuctionAdvisorView.as_view()),

    # Advanced
    path("shopping-assistant/",    ShoppingAssistantView.as_view()),
    path("price-drop-predict/",    PriceDropPredictorView.as_view()),
    path("fake-product/",          FakeProductDetectorView.as_view()),
    path("return-policy/",         ReturnPolicyView.as_view()),
    path("competitor-prices/",     CompetitorPriceView.as_view()),
    path("spending-report/",       SpendingReportView.as_view()),
    path("price-manipulation/",    PriceManipulationView.as_view()),
]
