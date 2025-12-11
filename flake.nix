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
			
			packages = packages ++ [ (pkgs.writeShellApplication {
				name = "change";

				text = let
					config = {
						"$schema" = "https://unpkg.com/@changesets/config@3.1.2/schema.json";
						"changelog" = "@changesets/cli/changelog";
						"commit" = false;
						"fixed" = [];
						"linked" = [];
						"access" = "restricted";
						"baseBranch" = "main";
						"updateInternalDependencies" = "patch";
						"privatePackages" = {
							"version" = true;
							"tag" = false;
						};
					};

				in ''
if [ $# -eq 0 ]; then
	
	pnpm changeset --ignore "@dndevops/library-*" --ignore "@dndevops/module-*" 
elif [ "$1" == "version" ]; then
    pnpm changeset version
else
    echo "Invalid arguments"
	exit 1
fi
				'';

				runtimeInputs = packages;
			})];

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
				${builtins.toString (builtins.map (i: "docker build . --target=${i} --tag=${i}:latest  --network host\n") targets)}
			'');
		};
  	};
}
