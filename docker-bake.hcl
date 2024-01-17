// If you're new to Bake:
// https://blog.kubesimplify.com/bake-your-container-images-with-bake

// for https://github.com/docker/metadata-action?tab=readme-ov-file#bake-definition
target "docker-metadata-action" {}

// PROPOSALS variable is filled by docker-bake.json, which this config merges upon
// https://docs.docker.com/build/bake/reference/#file-format

group "default" {
  targets = [
    "use",
    "test"
  ]
}

target "use" {
  inherits = ["docker-metadata-action"]
  name = "use-${proposal}"
  matrix = {
    proposal = PROPOSALS
  }
  // TODO proposal *number* would be immutable
  tags = ["ghcr.io/agoric/agoric-3-proposals:use-${proposal}"]
  labels = {
    "org.opencontainers.image.title": "Use ${proposal}",
    "org.opencontainers.image.description": "Use agoric-3 synthetic chain after ${proposal} proposal",
  }
  target = "use-${proposal}"
}

target "test" {
  name = "test-${proposal}"
  matrix = {
    proposal = PROPOSALS
  }
  tags = ["ghcr.io/agoric/agoric-3-proposals:test-${proposal}"]
  labels = {
    "org.opencontainers.image.title": "Test ${proposal}",
  }
  target = "test-${proposal}"
}
