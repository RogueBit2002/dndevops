{
	description = "dndevops development environment";

	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs/nixos-25.11";
	};

	outputs = { self, nixpkgs, ... } @ inputs: let
		system = "x86_64-linux";
		pkgs = import nixpkgs { inherit system; config.allowUnfree = true; };
		
		deps = {
			pnpm = pkgs.pnpm;
			node = pkgs.nodejs_22;
		};

		packages = builtins.attrValues deps;
	in {
		devShells.${system}.default = pkgs.mkShell {
			name = "dndevops";
			
			inherit packages;

			shellHook = ''
				echo "Have fun developing! <3"
			'';
        };

		apps.${system}.dockerize = {
			type = "app";
			program = let 
				targets = [
					"dndevops-events"
					"dndevops-frontend"
					"dndevops-game"
					"dndevops-identity"
				];
			in builtins.toString (pkgs.writeShellScript "dndevops-dockerize" ''
				${builtins.toString (builtins.map (i: "docker build . --target=${i} --tag=${i}:latest\n") targets)}
			'');
		};
  	};
}
