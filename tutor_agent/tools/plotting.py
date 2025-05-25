from google.adk.tools import ToolContext
import json
from typing import List

try:
    import numpy as np
    import plotly.graph_objects as go
    import plotly.io as pio
    from sympy.parsing.sympy_parser import parse_expr
    from sympy import symbols, lambdify
    PLOTTING_AVAILABLE = True
except ImportError:
    PLOTTING_AVAILABLE = False


def plotting_tool(
    equations: List[str], 
    x_range: List[float], 
    tool_context: ToolContext,
    labels: List[str],
    title: str,
    x_label: str,
    y_label: str,
    plot_type: str
) -> dict:
    """
    Generates a Plotly plot for one or more mathematical equations.
    
    Args:
        equations: List of mathematical expressions as strings (e.g., ["x**2", "2*x + 1", "sin(x)"]).
        x_range: Range for x-axis as [min, max] (e.g., [-10, 10]).
        tool_context: The ADK tool context.
        labels: List of labels for each equation.
        title: Title for the plot.
        x_label: Label for x-axis.
        y_label: Label for y-axis.
        plot_type: Type of plot ("line" or "scatter").
    
    Returns:
        A dictionary containing the Plotly figure JSON and metadata.
    """
    if not PLOTTING_AVAILABLE:
        return {
            "error": "Plotting dependencies not available", 
            "detail": "Please install numpy, plotly, and sympy to use plotting functionality."
        }
    
    try:
        # Validate inputs
        if not equations:
            return {"error": "No equations provided"}
        
        if len(x_range) != 2 or x_range[0] >= x_range[1]:
            return {"error": "Invalid x_range. Must be [min, max] where min < max"}
        
        # Validate labels
        if len(labels) != len(equations):
            return {"error": "Number of labels must match number of equations"}
        
        # Generate x values
        x_values = np.linspace(x_range[0], x_range[1], 1000)
        x_symbol = symbols('x')
        
        # Create Plotly figure
        fig = go.Figure()
        
        # Process each equation
        for i, equation_str in enumerate(equations):
            try:
                # Parse the equation using SymPy
                expr = parse_expr(equation_str)
                
                # Convert to numpy function for evaluation
                func = lambdify(x_symbol, expr, 'numpy')
                
                # Evaluate function over x range
                y_values = func(x_values)
                
                # Handle complex numbers (take real part)
                if np.iscomplexobj(y_values):
                    y_values = np.real(y_values)
                
                # Add trace to figure
                if plot_type == "scatter":
                    fig.add_trace(go.Scatter(
                        x=x_values,
                        y=y_values,
                        mode='markers',
                        name=labels[i],
                        marker=dict(size=3)
                    ))
                else:  # line plot
                    fig.add_trace(go.Scatter(
                        x=x_values,
                        y=y_values,
                        mode='lines',
                        name=labels[i],
                        line=dict(width=2)
                    ))
                
            except Exception as e:
                return {
                    "error": f"Failed to process equation '{equation_str}'",
                    "detail": str(e)
                }
        
        # Update layout
        fig.update_layout(
            title=title,
            xaxis_title=x_label,
            yaxis_title=y_label,
            showlegend=len(equations) > 1,
            template="plotly_white",
            hovermode='x unified'
        )
        
        # Convert to JSON for frontend
        plot_json = pio.to_json(fig)
        
        return {
            "success": True,
            "plot_data": json.loads(plot_json),
            "equations": equations,
            "x_range": x_range,
            "title": title,
            "plot_type": "plotly"
        }
        
    except Exception as e:
        return {
            "error": "Failed to generate plot",
            "detail": str(e)
        }