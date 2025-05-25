from google.adk.tools import ToolContext
from typing import List, Dict, Any
import base64

try:
    import schemdraw
    import schemdraw.elements as elm

    CIRCUIT_DRAWING_AVAILABLE = True
except ImportError:
    CIRCUIT_DRAWING_AVAILABLE = False


def circuit_visualization_tool(
    components: List[Dict[str, Any]],
    tool_context: ToolContext,
    title: str = "Circuit Diagram",
    show_labels: bool = True,
    grid: bool = False,
) -> dict:
    """
    Generates a circuit diagram using schemdraw.

    Args:
        components: List of circuit components with their properties.
                   Each component should have:
                   - type: Component type (e.g., "resistor", "capacitor", "voltage_source", "current_source", "inductor", "diode", "transistor", "ground", "wire")
                   - label: Optional label for the component
                   - value: Optional value (e.g., "10Ω", "100μF", "12V")
                   - direction: Direction to draw ("right", "left", "up", "down")
                   - connection: How to connect ("series", "parallel", "to_ground")
                   - properties: Additional properties specific to component type
        tool_context: The ADK tool context.
        title: Title for the circuit diagram.
        show_labels: Whether to show component labels.
        grid: Whether to show grid lines.

    Returns:
        A dictionary containing the circuit diagram as SVG and metadata.

    Example components:
    [
        {"type": "voltage_source", "label": "V1", "value": "12V", "direction": "up"},
        {"type": "resistor", "label": "R1", "value": "1kΩ", "direction": "right"},
        {"type": "capacitor", "label": "C1", "value": "100μF", "direction": "down"},
        {"type": "ground", "direction": "down"}
    ]
    """
    if not CIRCUIT_DRAWING_AVAILABLE:
        return {
            "error": "Circuit drawing dependencies not available",
            "detail": "Please install schemdraw to use circuit visualization functionality.",
        }

    try:
        # Validate inputs
        if not components:
            return {"error": "No components provided"}

        # Create new circuit drawing
        with schemdraw.Drawing(show=False) as d:
            d.config(fontsize=12, color="black")

            # Set grid if requested
            if grid:
                d.config(grid=True)

            # Process each component
            for i, component in enumerate(components):
                comp_type = component.get("type", "").lower()
                label = component.get("label", "")
                value = component.get("value", "")
                direction = component.get("direction", "right").lower()
                properties = component.get("properties", {})

                # Combine label and value for display
                display_label = (
                    f"{label}\n{value}" if label and value else (label or value)
                )

                try:
                    # Map direction to schemdraw direction
                    dir_map = {
                        "right": "right",
                        "left": "left",
                        "up": "up",
                        "down": "down",
                    }
                    draw_direction = dir_map.get(direction, "right")

                    # Draw component based on type
                    if comp_type == "resistor":
                        elem = d.add(
                            elm.Resistor().right()
                            if draw_direction == "right"
                            else elm.Resistor().left()
                            if draw_direction == "left"
                            else elm.Resistor().up()
                            if draw_direction == "up"
                            else elm.Resistor().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "capacitor":
                        elem = d.add(
                            elm.Capacitor().right()
                            if draw_direction == "right"
                            else elm.Capacitor().left()
                            if draw_direction == "left"
                            else elm.Capacitor().up()
                            if draw_direction == "up"
                            else elm.Capacitor().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "inductor":
                        elem = d.add(
                            elm.Inductor().right()
                            if draw_direction == "right"
                            else elm.Inductor().left()
                            if draw_direction == "left"
                            else elm.Inductor().up()
                            if draw_direction == "up"
                            else elm.Inductor().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "voltage_source" or comp_type == "battery":
                        elem = d.add(
                            elm.SourceV().right()
                            if draw_direction == "right"
                            else elm.SourceV().left()
                            if draw_direction == "left"
                            else elm.SourceV().up()
                            if draw_direction == "up"
                            else elm.SourceV().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "current_source":
                        elem = d.add(
                            elm.SourceI().right()
                            if draw_direction == "right"
                            else elm.SourceI().left()
                            if draw_direction == "left"
                            else elm.SourceI().up()
                            if draw_direction == "up"
                            else elm.SourceI().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "diode":
                        elem = d.add(
                            elm.Diode().right()
                            if draw_direction == "right"
                            else elm.Diode().left()
                            if draw_direction == "left"
                            else elm.Diode().up()
                            if draw_direction == "up"
                            else elm.Diode().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "led":
                        elem = d.add(
                            elm.LED().right()
                            if draw_direction == "right"
                            else elm.LED().left()
                            if draw_direction == "left"
                            else elm.LED().up()
                            if draw_direction == "up"
                            else elm.LED().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "zener":
                        elem = d.add(
                            elm.DiodeZener().right()
                            if draw_direction == "right"
                            else elm.DiodeZener().left()
                            if draw_direction == "left"
                            else elm.DiodeZener().up()
                            if draw_direction == "up"
                            else elm.DiodeZener().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "transistor_npn":
                        elem = d.add(
                            elm.BjtNpn().right()
                            if draw_direction == "right"
                            else elm.BjtNpn().left()
                            if draw_direction == "left"
                            else elm.BjtNpn().up()
                            if draw_direction == "up"
                            else elm.BjtNpn().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "transistor_pnp":
                        elem = d.add(
                            elm.BjtPnp().right()
                            if draw_direction == "right"
                            else elm.BjtPnp().left()
                            if draw_direction == "left"
                            else elm.BjtPnp().up()
                            if draw_direction == "up"
                            else elm.BjtPnp().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "mosfet_n":
                        elem = d.add(
                            elm.NFet().right()
                            if draw_direction == "right"
                            else elm.NFet().left()
                            if draw_direction == "left"
                            else elm.NFet().up()
                            if draw_direction == "up"
                            else elm.NFet().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "mosfet_p":
                        elem = d.add(
                            elm.PFet().right()
                            if draw_direction == "right"
                            else elm.PFet().left()
                            if draw_direction == "left"
                            else elm.PFet().up()
                            if draw_direction == "up"
                            else elm.PFet().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "ground":
                        d.add(elm.Ground())

                    elif comp_type == "wire" or comp_type == "line":
                        length = properties.get("length", 1)
                        if draw_direction == "right":
                            d.add(elm.Line().right(length))
                        elif draw_direction == "left":
                            d.add(elm.Line().left(length))
                        elif draw_direction == "up":
                            d.add(elm.Line().up(length))
                        elif draw_direction == "down":
                            d.add(elm.Line().down(length))

                    elif comp_type == "switch":
                        elem = d.add(
                            elm.Switch().right()
                            if draw_direction == "right"
                            else elm.Switch().left()
                            if draw_direction == "left"
                            else elm.Switch().up()
                            if draw_direction == "up"
                            else elm.Switch().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "fuse":
                        elem = d.add(
                            elm.Fuse().right()
                            if draw_direction == "right"
                            else elm.Fuse().left()
                            if draw_direction == "left"
                            else elm.Fuse().up()
                            if draw_direction == "up"
                            else elm.Fuse().down()
                        )
                        if show_labels and display_label:
                            elem.label(display_label)

                    elif comp_type == "opamp":
                        elem = d.add(elm.Opamp())
                        if show_labels and display_label:
                            elem.label(display_label)

                    else:
                        # Unknown component type - draw as a box with label
                        elem = d.add(
                            elm.Element().right()
                            if draw_direction == "right"
                            else elm.Element().left()
                            if draw_direction == "left"
                            else elm.Element().up()
                            if draw_direction == "up"
                            else elm.Element().down()
                        )
                        if show_labels:
                            elem.label(display_label or comp_type)

                except Exception as e:
                    return {
                        "error": f"Failed to draw component {i + 1} (type: {comp_type})",
                        "detail": str(e),
                    }

            # Get the SVG content directly from the drawing
            svg_data = d.get_imagedata('svg')
            
            # Handle both string and bytes return types from get_imagedata
            if isinstance(svg_data, bytes):
                # svg_content = svg_data.decode('utf-8')
                svg_base64 = base64.b64encode(svg_data).decode('utf-8')
            else:
                # svg_content = svg_data
                svg_base64 = base64.b64encode(svg_data.encode('utf-8')).decode('utf-8')

            return {
                "success": True,
                "image_data": svg_base64,
                # "svg_content": svg_content,  # Raw SVG for direct embedding
                "image_format": "svg",
                "title": title,
                "components_count": len(components),
                "diagram_type": "circuit",
            }

    except Exception as e:
        return {"error": "Failed to generate circuit diagram", "detail": str(e)}


# Example usage function for testing
def create_example_circuit():
    """Example of how to use the circuit visualization tool"""
    example_components = [
        {"type": "voltage_source", "label": "V1", "value": "12V", "direction": "up"},
        {"type": "wire", "direction": "right", "properties": {"length": 2}},
        {"type": "resistor", "label": "R1", "value": "1kΩ", "direction": "right"},
        {"type": "wire", "direction": "down", "properties": {"length": 2}},
        {"type": "capacitor", "label": "C1", "value": "100μF", "direction": "left"},
        {"type": "wire", "direction": "left", "properties": {"length": 2}},
        {"type": "ground", "direction": "down"},
    ]

    return {
        "components": example_components,
        "title": "Example RC Circuit",
        "show_labels": True,
        "grid": False,
    }
