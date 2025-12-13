variable "REGISTRY" {
  default = ""
}

variable TAGS {
	default = []
}

group "default" {
  targets = ["identity", "game", "events", "frontend" ]
}

target "identity" {
  context = "."p
  dockerfile = "Dockerfile"
  target = "dndevops-identity"
	tags = [
		"${notequal("",REGISTRY) ? "${REGISTRY}/" : "" }dndevops-identity:latest"
		"${notequal("",REGISTRY) ? "${REGISTRY}/" : "" }dndevops-identity:latest"
	]
}

target "game" {
  context = "."
  dockerfile = "Dockerfile"
  target = "dndevops-game"
  tags = ["${registry}dndevops-game:latest"]
}


target "events" {
  context = "."
  dockerfile = "Dockerfile"
  target = "dndevops-events"
  tags = ["${registry}dndevops-events:latest"]
}


target "frontend" {
  context = "."
  dockerfile = "Dockerfile"
  target = "dndevops-frontend"
  tags = ["${registry}dndevops-frontend:latest"]
}