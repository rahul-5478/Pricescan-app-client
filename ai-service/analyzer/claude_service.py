import json
from groq import Groq
from django.conf import settings


SYSTEM_PROMPT = """You are an expert market pricing analyst with deep knowledge of retail,
e-commerce, and consumer goods pricing across global markets. Your job is to determine
whether a product is fairly priced, overpriced, or underpriced based on the information provided.

You must always respond with a valid JSON object and nothing else. No preamble, no explanation outside the JSON.

The JSON schema must be exactly:
{
  "verdict": "OVERPRICED" | "FAIR" | "UNDERPRICED" | "UNKNOWN",
  "overpricingPercent": <number, positive means overpriced, negative means underpriced, 0 if fair>,
  "estimatedFairPrice": <number>,
  "confidenceScore": <integer 0-100>,
  "reasoning": "<2-3 sentence explanation>",
  "redFlags": ["<flag1>", "<flag2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "marketComparison": "<brief comparison to typical market price>"
}"""


def build_user_prompt(data: dict) -> str:
    lines = [
        f"Product Name: {data['productName']}",
        f"Category: {data['category']}",
        f"Listed Price: {data['currency']} {data['listedPrice']:.2f}",
    ]
    if data.get("marketplace"):
        lines.append(f"Marketplace/Platform: {data['marketplace']}")
    if data.get("description"):
        lines.append(f"Description: {data['description']}")
    lines.append("\nAnalyze this product's pricing and respond with JSON only.")
    return "\n".join(lines)


def analyze_price(data: dict) -> dict:
    client = Groq(api_key=settings.GROQ_API_KEY)
    response = client.chat.completions.create(
        model=settings.GROQ_MODEL,
        max_tokens=1000,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT + "\n\nRespond ONLY with valid JSON. No markdown, no preamble."},
            {"role": "user",   "content": build_user_prompt(data)},
        ],
    )
    raw = response.choices[0].message.content.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    result = json.loads(raw)
    result.setdefault("verdict", "UNKNOWN")
    result.setdefault("overpricingPercent", 0)
    result.setdefault("estimatedFairPrice", data["listedPrice"])
    result.setdefault("confidenceScore", 50)
    result.setdefault("reasoning", "")
    result.setdefault("redFlags", [])
    result.setdefault("suggestions", [])
    result.setdefault("marketComparison", "")
    return result