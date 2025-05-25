from google.adk.agents import Agent
from tutor_agent.sub_agents.physics_agent import prompt

# Import tool definitions
from tutor_agent.tools.calculator import calculator_tool
from tutor_agent.tools.formula_lookup import formula_lookup_tool
from tutor_agent.tools.symbolic_math import symbolic_math_tool
from tutor_agent.tools.circuit_visualization import circuit_visualization_tool

physics_agent = Agent(
    model="gemini-2.0-flash",
    name="physics_agent",
    description="Handles physics-related questions, problems, and concepts.",
    instruction=prompt.PHYSICS_AGENT_INSTR,
    tools=[
        calculator_tool,
        formula_lookup_tool,
        symbolic_math_tool,
        circuit_visualization_tool,
    ],
    # output_schema=... (if you expect structured physics output)
)