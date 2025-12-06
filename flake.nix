{
	description = "dndevops development environment";

	inputs = {
		nixpkgs.url = "github:nixos/nixpkgs/nixos-25.05";
	};

	outputs = { self, nixpkgs, ... } @ inputs: let
		system = "x86_64-linux";
		pkgs = import nixpkgs { inherit system; config.allowUnfree = true; };
		
		deps = {
			pnpm = pkgs.pnpm;
			node = pkgs.nodejs_22;
		};

		packages = builtins.attrValues deps;

		mkScriptWithDeps = name: content: let
			der = pkgs.stdenv.mkDerivation {
				name = "dndevops-checker";

				buildInputs = packages;
				
				src = pkgs.writeShellScriptBin "dndevops-checker-script" "pnpm -r run check"; # writeShellScriptBin emits a folder (bin)
				installPhase = "mkdir -p $out/bin && cp bin/dndevops-checker-script $out/bin/app";
			};
		in "${der}/bin/app";
	in {
		devShell.${system} = pkgs.mkShell {
			name = "dndevops";
			
			inherit packages;

			shellHook = ''
				echo "Have fun developing! <3"
			'';
        };

		/*apps.${system}.shell = {

		};*/

		apps.${system}.check = {
			type = "app";
			program = let
				der = pkgs.stdenv.mkDerivation {
					name = "dndevops-checker";

					buildInputs = packages;
					
					src = pkgs.writeShellScriptBin "dndevops-checker-script" "pnpm -r run check"; # writeShellScriptBin emits a folder (bin)
					installPhase = "mkdir -p $out/bin && cp bin/dndevops-checker-script $out/bin/app";
				};
			in "${der}/bin/app";
		};
  	};
}
