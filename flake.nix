{
  description = "Firebot";

  inputs.nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";

  outputs = { self, nixpkgs }:
  let
    supportedSystems = [
      "x86_64-linux"
      "aarch64-linux"
    ];

    pkgsFor = system: import nixpkgs { inherit system; };
  in {
    packages = nixpkgs.lib.genAttrs supportedSystems (
      system:
      let
        pkgs = pkgsFor system;
        package = builtins.fromJSON(builtins.readFile "./package.json");
      in
      rec {
        firebot = pkgs.buildNpmPackage {
          pname = package.name;
          version = package.version;

          src = ./.;
          npmDepsHash = "";

          nativeBuildInputs = with pkgs; [
            electron
          ];

          dontNpmBuild = true;

          env = {
            ELECTRON_SKIP_BINARY_DOWNLOAD = 1;
          };

          postInstall = ''
            makeWrapper ${pkgs.electron}/bin/electron $out/bin/${package.name} \
            --add-flags $out/lib/node_modules/${package.name}/main.js
          '';
        };

        default = firebot;
      }
    );
  };
}
