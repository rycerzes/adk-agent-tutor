from google.adk.tools import ToolContext

FORMULA_DATABASE = {
    "math": {
        "area of circle": {"formula": "A = pi * r^2", "description": "Area (A) of a circle with radius (r)."},
        "pythagorean theorem": {"formula": "a^2 + b^2 = c^2", "description": "In a right-angled triangle, the square of the hypotenuse (c) is equal to the sum of the squares of the other two sides (a, b)."},
        "quadratic formula": {"formula": "x = [-b +/- sqrt(b^2 - 4ac)] / 2a", "description": "Solutions for ax^2 + bx + c = 0."},
    },
    "physics": {
        "newton's second law": {"formula": "F = m * a", "description": "Force (F) equals mass (m) times acceleration (a)."},
        "kinetic energy": {"formula": "KE = 0.5 * m * v^2", "description": "Kinetic energy (KE) of an object with mass (m) and velocity (v)."},
        "speed of light": {"constant": "c", "value": "299,792,458 m/s", "description": "The speed of light in a vacuum."},
        "planck's constant": {"constant": "h", "value": "6.62607015 * 10^-34 J·s", "description": "Planck's constant."},
    }
}

def formula_lookup_tool(query: str, subject: str, tool_context: ToolContext) -> dict:
    """
    Looks up a formula or constant based on a query and subject.
    Args:
        query: The name or description of the formula/constant (e.g., "area of circle", "speed of light").
        subject: The subject domain ("math" or "physics") to narrow down the search.
        tool_context: The ADK tool context.
    Returns:
        A dictionary with the formula/constant details or a "not found" message.
    """
    query_lower = query.lower()
    if subject.lower() in FORMULA_DATABASE:
        for key, value in FORMULA_DATABASE[subject.lower()].items():
            if query_lower in key.lower():
                return {"name": key, **value}
    return {"error": "Not found", "message": f"Could not find '{query}' in {subject} formulas/constants."}
