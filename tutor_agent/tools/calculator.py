from google.adk.tools import ToolContext

def calculator_tool(expression: str, tool_context: ToolContext) -> dict:
    """
    Calculates the result of a mathematical expression.
    Args:
        expression: The mathematical expression string (e.g., "2*pi*5", "sqrt(16)+log10(100)").
        tool_context: The ADK tool context.
    Returns:
        A dictionary containing the result or an error. e.g. {"result": 31.4159} or {"error": "Invalid expression"}
    """
    # TODO: parse and compute the expression.
    try:
        # IMPORTANT: eval() is dangerous with untrusted input.
        # A real implementation needs a safe math expression parser.
        # For example, using ast.literal_eval for simple cases or a dedicated library.
        import math
        # A safer way to provide math functions for eval
        safe_dict = {k: v for k, v in math.__dict__.items() if not k.startswith("__")}
        safe_dict['abs'] = abs
        safe_dict['round'] = round
        
        result = eval(expression, {"__builtins__": {}}, safe_dict)
        return {"result": result}
    except Exception as e:
        return {"error": str(e), "detail": "Failed to evaluate expression."}