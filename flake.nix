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
        package = builtins.fromJSON(builtins.readFile "${self}/package.json");
      in
      rec {
        firebot = pkgs.buildNpmPackage {
          pname = package.name;
          version = package.version;

          src = ./.;
          npmDepsHash = "sha256-UNXnL5zmbIPa00wBKxFbnk7OkJQvh7/pbUxdduw/WxA=";

          nativeBuildInputs = with pkgs; [
            electron
          ];

          dontNpmBuild = true;
          makeCacheWritable = true;

          npmFlags = [
            "--legacy-peer-deps"
          ];

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
