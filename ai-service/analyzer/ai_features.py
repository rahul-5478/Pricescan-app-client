"""All AI-powered feature handlers — using Groq"""
import json
from groq import Groq
from django.conf import settings


def _groq(system: str, user: str, max_tokens: int = 1200) -> dict:
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        max_tokens=max_tokens,
        messages=[
            {"role": "system", "content": system + "\n\nRespond ONLY with valid JSON. No markdown, no preamble, no ```json blocks."},
            {"role": "user",   "content": user},
        ],
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"): raw = raw[4:]
    return json.loads(raw.strip())


def seller_psychology(listing_text: str) -> dict:
    return _groq(
        system="""You are an expert in dark marketing patterns and consumer psychology.
Analyze product listings for manipulative tactics.
Return JSON: {"manipulationScore":0,"tactics":[{"name":"string","quote":"string","severity":"HIGH","explanation":"string"}],"overallVerdict":"string","safetyRating":"SAFE","recommendation":"string"}""",
        user=f"Analyze this product listing for psychological manipulation tactics:\n\n{listing_text}"
    )


def fake_discount(original_price: float, sale_price: float, product_name: str, context: str = "") -> dict:
    return _groq(
        system="""You are a pricing fraud detection expert.
Return JSON: {"isGenuine":true,"confidenceScore":0,"verdict":"GENUINE","actualDiscountPercent":0,"claimedDiscountPercent":0,"estimatedOriginalMarketPrice":0,"redFlags":[],"explanation":"string","recommendation":"string"}""",
        user=f"Product: {product_name}\nClaimed original price: {original_price}\nSale price: {sale_price}\nContext: {context}"
    )


def review_sentiment_price(reviews: str, product_name: str, price: float, currency: str = "INR") -> dict:
    return _groq(
        system="""You are a product review analyst specializing in price-quality correlation.
Return JSON: {"overallSentiment":"POSITIVE","sentimentScore":0,"priceJustified":true,"qualityScore":0,"valueForMoneyScore":0,"commonPraises":[],"commonComplaints":[],"pricingVerdict":"FAIR","summary":"string","recommendation":"string"}""",
        user=f"Product: {product_name}\nPrice: {currency} {price}\n\nReviews:\n{reviews}"
    )


def bundle_trap(bundle_description: str, bundle_price: float, currency: str = "INR") -> dict:
    return _groq(
        system="""You are a bundle deal analyst.
Return JSON: {"isTrap":false,"trapScore":0,"estimatedIndividualTotal":0,"actualSavings":0,"actualSavingsPercent":0,"verdict":"FAIR_DEAL","breakdown":[{"item":"string","estimatedPrice":0}],"hiddenCosts":[],"recommendation":"string","betterAlternative":"string"}""",
        user=f"Bundle: {bundle_description}\nBundle Price: {currency} {bundle_price}"
    )


def regional_arbitrage(product_name: str, category: str, local_price: float, local_currency: str) -> dict:
    return _groq(
        system="""You are an international pricing and import expert.
Return JSON: {"localPrice":0,"localCurrency":"INR","regionalPrices":[{"country":"USA","currency":"USD","estimatedPrice":0,"inLocalCurrency":0,"importDuty":0,"totalLandedCost":0}],"cheapestRegion":"string","potentialSavings":0,"arbitrageViable":true,"importConsiderations":[],"recommendation":"string"}""",
        user=f"Product: {product_name} (Category: {category})\nLocal price: {local_currency} {local_price}"
    )


def analyze_image(image_base64: str, media_type: str, mode: str = "product") -> dict:
    """Image analysis — Groq does not support vision, return placeholder"""
    return {
        "error": "Image analysis requires a vision model. Please describe the product manually.",
        "verdict": "UNKNOWN",
        "recommendation": "Product details manually enter karein."
    }


def negotiation_script(product_name: str, listed_price: float, fair_price: float, currency: str, marketplace: str, context: str = "") -> dict:
    return _groq(
        system="""You are a master negotiator. Generate a complete negotiation strategy and script in Hinglish.
Return JSON: {"targetPrice":0,"walkAwayPrice":0,"openingOffer":0,"strategy":"string","scripts":[{"phase":"OPENING","message":"string","notes":"string"}],"powerMoves":[],"thingsToAvoid":[],"successProbability":0,"bestTimeToNegotiate":"string"}""",
        user=f"Product: {product_name}\nListed: {currency} {listed_price}\nFair value: {currency} {fair_price}\nMarketplace: {marketplace}\nContext: {context}"
    )


def price_shame_score(seller_name: str, product_name: str, listed_price: float, category: str, marketplace: str) -> dict:
    return _groq(
        system="""You are a seller trustworthiness analyst.
Return JSON: {"shameScore":0,"trustRating":"TRUSTED","pricingPatterns":[{"pattern":"string","severity":"string","description":"string"}],"overallAssessment":"string","warningFlags":[],"positiveIndicators":[],"recommendation":"BUY"}""",
        user=f"Seller: {seller_name}\nProduct: {product_name}\nPrice: {listed_price}\nCategory: {category}\nMarketplace: {marketplace}"
    )


def emi_trap(product_price: float, emi_amount: float, tenure_months: int, processing_fee: float, currency: str, claimed_interest: float = 0) -> dict:
    return _groq(
        system="""You are a financial analyst specializing in EMI and hidden cost detection.
Return JSON: {"totalAmountPaid":0,"hiddenCost":0,"actualInterestRate":0,"claimedInterestRate":0,"isTrap":false,"trapScore":0,"breakdown":{"principal":0,"interest":0,"fees":0,"total":0},"verdict":"FAIR","recommendation":"string","betterOptions":[]}""",
        user=f"Product price: {currency} {product_price}\nEMI: {currency} {emi_amount}/month for {tenure_months} months\nProcessing fee: {currency} {processing_fee}\nClaimed interest: {claimed_interest}%"
    )


def subscription_analyzer(service_name: str, plan_name: str, monthly_price: float, currency: str, features: str) -> dict:
    return _groq(
        system="""You are a subscription value analyst.
Return JSON: {"valueScore":0,"costPerFeature":0,"verdict":"FAIR","featureBreakdown":[{"feature":"string","estimatedValue":0}],"competitorComparison":[{"service":"string","price":0,"betterValue":false}],"usageThreshold":"string","recommendation":"string","hiddenCosts":[],"cancellationTips":[]}""",
        user=f"Service: {service_name}\nPlan: {plan_name}\nPrice: {currency} {monthly_price}/month\nFeatures: {features}"
    )


def secondhand_validator(product_name: str, category: str, listed_price: float, currency: str, condition: str, age_years: float, description: str, platform: str) -> dict:
    return _groq(
        system="""You are a second-hand market pricing expert.
Return JSON: {"fairSecondhandPrice":0,"priceRange":{"min":0,"max":0},"depreciationRate":0,"verdict":"FAIR","overpricingPercent":0,"conditionAssessment":"string","redFlags":[],"inspectionChecklist":[],"negotiationRoom":0,"recommendation":"string","scamRiskScore":0}""",
        user=f"Product: {product_name} ({category})\nPlatform: {platform}\nPrice: {currency} {listed_price}\nCondition: {condition}\nAge: {age_years} years\nDescription: {description}"
    )


def auction_advisor(product_name: str, category: str, current_bid: float, currency: str, time_remaining: str, condition: str, num_bidders: int) -> dict:
    return _groq(
        system="""You are an auction strategy expert.
Return JSON: {"estimatedFinalPrice":0,"recommendedMaxBid":0,"bidStrategy":"WAIT","winProbabilityAtMaxBid":0,"marketValue":0,"auctionDynamics":"string","bidingTips":[],"sniperWindow":"string","redFlags":[],"verdict":"string"}""",
        user=f"Product: {product_name} ({category})\nCurrent bid: {currency} {current_bid}\nTime remaining: {time_remaining}\nCondition: {condition}\nActive bidders: {num_bidders}"
    )