from rich.console import Console
from rich.text import Text

console = Console()


"""https://patorjk.com/text-color-fader/"""

ascii_art = """\
██╗   ██╗██╗   ██╗██████╗  █████╗ ███████╗ ██████╗ █████╗ ███╗   ██╗███╗   ██╗███████╗██████╗ 
╚██╗ ██╔╝██║   ██║██╔══██╗██╔══██╗██╔════╝██╔════╝██╔══██╗████╗  ██║████╗  ██║██╔════╝██╔══██╗
 ╚████╔╝ ██║   ██║██████╔╝███████║███████╗██║     ███████║██╔██╗ ██║██╔██╗ ██║█████╗  ██████╔╝
  ╚██╔╝  ██║   ██║██╔══██╗██╔══██║╚════██║██║     ██╔══██║██║╚██╗██║██║╚██╗██║██╔══╝  ██╔══██╗
   ██║   ╚██████╔╝██║  ██║██║  ██║███████║╚██████╗██║  ██║██║ ╚████║██║ ╚████║███████╗██║  ██║
   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝"""

# Gradient colors from pink to blue
gradient = ["#ff77ff", "#cc66ff", "#9966ff", "#6666ff", "#3399ff", "#00ccff", "#00ffff"]

# Split into lines
lines = ascii_art.splitlines()
colored_lines = []

for i, line in enumerate(lines):
    color = gradient[i * len(gradient) // len(lines)]
    colored_lines.append(Text(line, style=color))

for line in colored_lines:
    console.print(line)
