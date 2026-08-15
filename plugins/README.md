# Plugins (PRO)

HackerBrain OS loads Python plugins from this directory at startup when PRO
is active. Each plugin file must define a `register(hb)` function.

```python
# plugins/my_plugin.py

def register(hb):
    """hb exposes: executor, memory, vault, report, agent, timeline"""
    def my_action(target):
        return hb.executor.execute("nmap -sV " + target)

    hb.register_command("myaction", my_action)
    hb.timeline.add("plugin", "my_plugin loaded")
```

- `hb.executor` - ToolsExecutor (run local tools safely)
- `hb.memory` - Memory store (hosts, credentials, vulns, notes)
- `hb.vault` - Encrypted vault (PRO)
- `hb.report` - ReportGenerator
- `hb.agent` - Agent orchestrator
- `hb.timeline` - Timeline event log

Keep plugins free of emojis and use technical English comments.
Authorized security testing only.
