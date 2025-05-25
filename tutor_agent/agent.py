"""AI Tutor using Google Agent Development Kit"""

from tutor_agent import prompt
from google.adk.agents import Agent
from tutor_agent.sub_agents.math_agent.agent import math_agent
from tutor_agent.sub_agents.physics_agent.agent import physics_agent

from tutor_agent.tools.memory import _load_precreated_itinerary

root_agent = Agent(
    model="gemini-2.0-flash",
    name="root_agent",
    description="AI Tutor using the services of multiple sub-agents",
    instruction=prompt.ROOT_AGENT_INSTR,
    sub_agents=[
        math_agent,
        physics_agent
    ],
    before_agent_callback=_load_precreated_itinerary,
)
