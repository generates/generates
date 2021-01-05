# @generates/kdot
> A tool for developing, deploying, and running CI on Kubernetes

## Workflows

1. A personal environment:
   - `build --no-push`  Setup buildkit if necessary and build app Docker images
   - `apply` Create/update resources
   - `fwd` Forward ports
   - `log` Stream logs to stdout
   - `start` Build images, create/update/scale resources, forward ports, and stream logs
   - `up` Scale up replicas to configured values
   - `down` Scale down pods to 0 replicas
   - `del` Delete all namespaced resources
2. A staging environment:
   - `set apps.[app name].image.tag [tag]` Update an app’s Docker image tag
   - `build` Setup buildkit if necessary, build app Docker images, and push to a registry if configured
   - `apply` Create/update resources
   - Commit changes to the package.json file made with the set command
3. A CI (ephemeral) environment:
   - `set namespace [namespace]` Set a unique namespace for the run
   - `start --detach` Build images, create resources, forward ports in the background, and write logs to files in a unique, run-specific namespace
   - `stop` Stop forwarding ports and writing logs
   - `del` Delete all namespaced resources
4. A preview (ephemeral) environment:
   - `set namespace [namespace]` Set a unique namespace for the env
   - `build --no-push`  Setup buildkit if necessary and build app Docker images
   - `apply` Create/update resources
   - `del` Delete all namespaced resources
