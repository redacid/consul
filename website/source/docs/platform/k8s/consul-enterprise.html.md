---
layout: "docs"
page_title: "Consul Enterprise"
sidebar_current: "docs-platform-k8s-run-consul-ent"
description: |-
  Configuration for running Consul Enterprise
---

# Consul Enterprise

You can use this Helm chart to deploy Consul Enterprise by following a few extra steps.

Find the license file that you received in your welcome email. It should have the extension `.hclic`. You will use the contents of this file to create a Kubernetes secret before installing the Helm chart.

You can use the following commands to create the secret:

```bash
secret=$(cat 1931d1f4-bdfd-6881-f3f5-19349374841f.hclic)
kubectl create secret generic consul-ent-license --from-literal="key=${secret}"
```

-> **Note:** If you cannot find your `.hclic` file, please contact your sales team or Technical Account Manager.

In your `config.yaml`, change the value of `global.image` to one of the enterprise [release tags](https://hub.docker.com/r/hashicorp/consul-enterprise/tags).

```yaml
# config.yaml
global:
  image: "hashicorp/consul-enterprise:1.4.3-ent"
```

Add the name of the secret you just created to `server.enterpriseLicense`.

```yaml
# config.yaml
global:
  image: "hashicorp/consul-enterprise:1.4.3-ent"
server:
  enterpriseLicense:
    secretName: "consul-ent-license"
    secretKey: "key"
```

Now run `helm install`:

```bash
$ helm install --wait hashicorp ./consul-helm -f config.yaml
```

Once the cluster is up, you can verify the nodes are running Consul Enterprise by
using the `consul license get` command.

First, forward your local port 8500 to the Consul servers so you can run `consul`
commands locally against the Consul servers in Kubernetes:

```bash
$ kubectl port-forward service/hashicorp-consul-server 8500:8500
```

In a separate tab, run the `consul license get` command (if using ACLs see below):

```bash
$ consul license get
License is valid
License ID: 1931d1f4-bdfd-6881-f3f5-19349374841f
Customer ID: b2025a4a-8fdd-f268-95ce-1704723b9996
Expires At: 2020-03-09 03:59:59.999 +0000 UTC
Datacenter: *
Package: premium
Licensed Features:
        Automated Backups
        Automated Upgrades
        Enhanced Read Scalability
        Network Segments
        Redundancy Zone
        Advanced Network Federation
$ consul members
Node                                       Address           Status  Type    Build      Protocol  DC   Segment
hashicorp-consul-server-0                  10.60.0.187:8301  alive   server  1.4.3+ent  2         dc1  <all>
hashicorp-consul-server-1                  10.60.1.229:8301  alive   server  1.4.3+ent  2         dc1  <all>
hashicorp-consul-server-2                  10.60.2.197:8301  alive   server  1.4.3+ent  2         dc1  <all>
```

If you get an error:

```bash
Error getting license: invalid character 'r' looking for beginning of value
```

Then you have likely enabled ACLs. You need to specify your ACL token when
running the `license get` command. First, get the ACL token:

```bash
$ kubectl get secrets/hashicorp-consul-bootstrap-acl-token --template={{.data.token}} | base64 -D
4dae8373-b4d7-8009-9880-a796850caef9%
```

Now use the token when running the `license get` command:

```bash
$ consul license get -token=4dae8373-b4d7-8009-9880-a796850caef9
License is valid
License ID: 1931d1f4-bdfd-6881-f3f5-19349374841f
Customer ID: b2025a4a-8fdd-f268-95ce-1704723b9996
Expires At: 2020-03-09 03:59:59.999 +0000 UTC
Datacenter: *
Package: premium
Licensed Features:
        Automated Backups
        Automated Upgrades
        Enhanced Read Scalability
        Network Segments
        Redundancy Zone
        Advanced Network Federation
```


