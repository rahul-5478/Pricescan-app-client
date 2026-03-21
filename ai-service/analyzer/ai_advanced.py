"""Advanced AI features — using Groq (free, fast)"""
import json
from groq import Groq
from django.conf import settings


def _groq(system, user):
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        max_tokens=1200,
        messages=[
            {"role": "system", "content": system + "\n\nRespond ONLY with valid JSON. No markdown, no preamble, no ```json blocks."},
            {"role": "user", "content": user},
        ],
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw.strip())


def shopping_assistant(user_message, scan_history, budget_info=""):
    return _groq(
        system="""You are a smart, friendly AI shopping assistant for Indian consumers.
Respond conversationally in Hinglish (mix of Hindi and English).
Return JSON: {"reply": "your response", "action": null, "actionData": {}, "tips": ["tip1","tip2"], "verdict": null}""",
        user=f"User message: {user_message}\n\nRecent scan history: {json.dumps(scan_history[:5])}\n\nBudget info: {budget_info}"
    )


def price_drop_predictor(product_name, category, current_price, currency, marketplace=""):
    return _groq(
        system="""You are a price prediction expert for Indian e-commerce.
Return JSON: {"currentFairness":"OVERPRICED","predictions":[{"event":"Diwali Sale","date":"Oct 2025","predictedPrice":0,"dropPercent":0,"confidence":0}],"bestTimeToBuy":"string","bestMonthToBuy":"string","pricePattern":"SEASONAL","recommendation":"BUY_NOW","reasoning":"string","confidenceScore":0}""",
        user=f"Product: {product_name} ({category})\nCurrent price: {currency} {current_price}\nMarketplace: {marketplace}"
    )


def fake_product_detector(product_name, description, price, currency, seller_name="", images_described=""):
    return _groq(
        system="""You are a counterfeit product detection expert for Indian e-commerce.
Return JSON: {"isFakeRisk":false,"fakeScore":0,"verdict":"LIKELY_GENUINE","redFlags":[],"greenFlags":[],"priceAnalysis":"string","sellerRisk":"LOW","verificationTips":[],"recommendation":"string"}""",
        user=f"Product: {product_name}\nPrice: {currency} {price}\nSeller: {seller_name}\nDescription: {description}"
    )


def return_policy_analyzer(policy_text, product_name="", platform=""):
    return _groq(
        system="""You are a consumer rights expert. Explain return policies in Hinglish.
Return JSON: {"returnWindow":"string","returnAllowed":true,"conditions":[],"hiddenClauses":[],"consumerFriendly":true,"friendlinessScore":0,"keyPoints":[],"warnings":[],"summary":"string","rating":"GOOD"}""",
        user=f"Product: {product_name}\nPlatform: {platform}\nReturn Policy:\n{policy_text}"
    )


def competitor_price_finder(product_name, category, current_price, currency):
    return _groq(
        system="""You are a price comparison expert for Indian e-commerce.
Return JSON: {"alternatives":[{"platform":"Amazon","estimatedPrice":0,"currency":"INR","url_hint":"string","savings":0,"savingsPercent":0,"notes":"string"},{"platform":"Flipkart","estimatedPrice":0,"currency":"INR","url_hint":"string","savings":0,"savingsPercent":0,"notes":"string"},{"platform":"Meesho","estimatedPrice":0,"currency":"INR","url_hint":"string","savings":0,"savingsPercent":0,"notes":"string"}],"bestDeal":"string","maxSavings":0,"cashbackTips":[],"bankOfferTips":[],"summary":"string"}""",
        user=f"Product: {product_name} ({category})\nCurrent price: {currency} {current_price}"
    )


def spending_report(analyses_data, month, currency="INR"):
    return _groq(
        system="""You are a personal finance advisor. Analyze shopping patterns in Hinglish.
Return JSON: {"month":"string","totalScanned":0,"overpriced":0,"fair":0,"underpriced":0,"totalSpentOnOverpriced":0,"potentialSavings":0,"worstCategory":"string","bestCategory":"string","categoryBreakdown":[],"insights":[],"achievements":[],"recommendations":[],"overallScore":0,"scoreLabel":"Smart Shopper"}""",
        user=f"Month: {month}\nCurrency: {currency}\nAnalyses: {json.dumps(analyses_data[:30])}"
    )


def price_manipulation_checker(product_name, price_history_desc, sale_event=""):
    return _groq(
        system="""You are a price manipulation detection expert.
Return JSON: {"manipulationDetected":false,"manipulationScore":0,"pattern":"STABLE","timeline":[],"actualDiscount":0,"claimedDiscount":0,"verdict":"string","evidence":[],"recommendation":"string"}""",
        user=f"Product: {product_name}\nPrice history: {price_history_desc}\nSale event: {sale_event}"
    )