---
layout: "docs"
page_title: "Servers Outside of Kubernetes - Kubernetes"
sidebar_current: "docs-platform-k8s-run-servers-outside"
description: |-
  Running servers outside of Kubernetes
---

# Servers Outside of Kubernetes

If you have a Consul cluster already running, you can configure your
Kubernetes nodes to join this existing cluster.

```yaml
# config.yaml
global:
  enabled: false

client:
  enabled: true
  join:
    - "provider=my-cloud config=val ..."
```

The `config.yaml` file to configure the Helm chart sets the proper
configuration to join an existing cluster.

The `global.enabled` value first disables all chart components by default
so that each component is opt-in. This allows us to _only_ setup the client
agents. We then opt-in to the client agents by setting `client.enabled` to
`true`.

Next, `client.join` is set to an array of valid
[`-retry-join` values](/docs/agent/options.html#retry-join). In the
example above, a fake [cloud auto-join](/docs/agent/cloud-auto-join.html)
value is specified. This should be set to resolve to the proper addresses of
your existing Consul cluster.

-> **Networking:** Note that for the Kubernetes nodes to join an existing
cluster, the nodes (and specifically the agent pods) must be able to connect
to all other server and client agents inside and _outside_ of Kubernetes.
If this isn't possible, consider running the Kubernetes agents as a separate
DC or adopting Enterprise for
[network segments](/docs/enterprise/network-segments/index.html).


