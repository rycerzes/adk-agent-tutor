from google.adk.agents import Agent
from tutor_agent.sub_agents.math_agent import prompt

# Import tool definitions
from tutor_agent.tools.calculator import calculator_tool
from tutor_agent.tools.formula_lookup import formula_lookup_tool
from tutor_agent.tools.symbolic_math import symbolic_math_tool

math_agent = Agent(
    model="gemini-2.0-flash",
    name="math_agent",
    description="Handles mathematics-related questions and problems.",
    instruction=prompt.MATH_AGENT_INSTR,
    tools=[
        calculator_tool,
        formula_lookup_tool,
        symbolic_math_tool,
    ],
    # output_schema=... (if you expect structured math output)
)
