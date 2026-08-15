# Playbooks (PRO)

Playbooks are reusable scan sequences defined as YAML or JSON. They are
executed step by step by the autonomous agent, which asks for confirmation
before any high-risk action.

```yaml
# playbooks/web-recon.yaml
name: web-recon
description: Basic web reconnaissance sequence
steps:
  - tool: nmap
    args: "-sV -T4 {target}"
  - tool: whatweb
    args: "{target}"
  - tool: gobuster
    args: "dir -u http://{target} -w /usr/share/wordlists/dirb/common.txt"
```

Place playbook files in this directory. Authorized security testing only.
