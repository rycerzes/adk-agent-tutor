from google.adk.tools import ToolContext

try:
    from sympy.parsing.sympy_parser import parse_expr
    from sympy import symbols, solve, diff, integrate, expand, factor, simplify, limit, oo
    SYMPY_AVAILABLE = True
except ImportError:
    SYMPY_AVAILABLE = False


def symbolic_math_tool(operation: str, expression: str, tool_context: ToolContext, variable: str = "x", limit_point: str = "0") -> dict:
    """
    Performs symbolic mathematical operations using SymPy.
    Args:
        operation: The operation to perform ("solve", "derivative", "integral", "expand", "factor", "simplify", "limit").
        expression: The mathematical expression as a string (e.g., "x**2 + 2*x + 1", "sin(x)", "x**3 - 6*x**2 + 11*x - 6").
        tool_context: The ADK tool context.
        variable: The variable to use for operations (default: "x").
        limit_point: The point to approach for limit operations (default: "0"). Use "oo" or "infinity" for positive infinity, "-oo" for negative infinity.
    Returns:
        A dictionary containing the result or an error.
    """
    if not SYMPY_AVAILABLE:
        return {"error": "SymPy not available", "detail": "Please install SymPy to use symbolic math operations."}
        
    try:
        # Parse the expression
        expr = parse_expr(expression)
        var = symbols(variable)
        
        operation = operation.lower()
        
        if operation == "solve":
            # Solve equation (assumes expression = 0)
            result = solve(expr, var)
            return {"operation": "solve", "input": expression, "result": str(result)}
            
        elif operation == "derivative":
            # Compute derivative
            result = diff(expr, var)
            return {"operation": "derivative", "input": expression, "variable": variable, "result": str(result)}
            
        elif operation == "integral":
            # Compute integral
            result = integrate(expr, var)
            return {"operation": "integral", "input": expression, "variable": variable, "result": str(result)}
            
        elif operation == "expand":
            # Expand expression
            result = expand(expr)
            return {"operation": "expand", "input": expression, "result": str(result)}
            
        elif operation == "factor":
            # Factor expression
            result = factor(expr)
            return {"operation": "factor", "input": expression, "result": str(result)}
            
        elif operation == "simplify":
            # Simplify expression
            result = simplify(expr)
            return {"operation": "simplify", "input": expression, "result": str(result)}
            
        elif operation == "limit":
            # Parse limit point
            if limit_point.lower() in ["oo", "infinity", "inf"]:
                limit_to = oo
            elif limit_point.lower() in ["-oo", "-infinity", "-inf"]:
                limit_to = -oo
            else:
                try:
                    limit_to = parse_expr(limit_point)
                except Exception:
                    limit_to = 0  # fallback to 0
            
            # Compute limit
            result = limit(expr, var, limit_to)
            return {"operation": "limit", "input": expression, "variable": variable, "limit_point": limit_point, "result": str(result)}
            
        else:
            return {"error": "Unsupported operation", "supported_operations": ["solve", "derivative", "integral", "expand", "factor", "simplify", "limit"]}
            
    except Exception as e:
        return {"error": str(e), "detail": "Failed to perform symbolic math operation."}