#!/usr/bin/env python3
"""Export deterministic local verification inputs after forge build; never deploy or use RPC."""

import argparse
import copy
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]


def encoded(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + "\n").encode()


def sha256(data):
    return hashlib.sha256(data).hexdigest()


def keccak(code):
    return subprocess.check_output(["cast", "keccak", code], text=True, cwd=ROOT).strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if delivered files differ from the build")
    args = parser.parse_args()
    artifact = json.loads((ROOT / "out/LaunchToken.sol/LaunchToken.json").read_text())
    metadata = artifact["metadata"]
    settings = copy.deepcopy(metadata["settings"])
    assert metadata["compiler"]["version"].startswith("0.8.26+")
    assert settings["metadata"]["bytecodeHash"] == "none"
    assert settings["optimizer"] == {"enabled": True, "runs": 200}
    assert settings["evmVersion"] == "cancun"
    assert not artifact["bytecode"]["linkReferences"]
    assert not artifact["deployedBytecode"].get("immutableReferences", {})
    abi_functions = {item["name"] for item in artifact["abi"] if item["type"] == "function"}
    assert abi_functions == {
        "name", "symbol", "decimals", "totalSupply", "balanceOf", "allowance", "approve", "transfer", "transferFrom"
    }
    constructor = next(item for item in artifact["abi"] if item["type"] == "constructor")
    assert constructor["inputs"] == [] and constructor["stateMutability"] == "nonpayable"
    settings.pop("compilationTarget")
    settings["outputSelection"] = {"*": {"*": ["abi", "evm.bytecode", "evm.deployedBytecode", "metadata"]}}
    sources = {}
    source_hashes = {}
    for name in sorted(metadata["sources"]):
        data = (ROOT / name).read_bytes()
        sources[name] = {"content": data.decode()}
        source_hashes[name] = sha256(data)
    manifest = json.loads((ROOT / "launch.json").read_text())
    request = json.loads((ROOT / "launch/request.json").read_text())
    assert manifest["kind"] == request["input"]["onchain"] == "evm_project"
    assert request["action"] == "launch.open"
    assert request["input"]["chainId"] == 1 and request["input"]["pairWith"] == "eth"
    assert manifest["contracts"] == []
    assert manifest["token"] == {"contract": "LaunchToken", "name": "EmberEVO", "symbol": "EMBEO", "decimals": 18}
    assert manifest["pool"] == {
        "pairedCurrency": "0x0000000000000000000000000000000000000000",
        "fee": 3000, "tickSpacing": 60, "initialPrice": "79228162514264337593543950336"
    }
    issuer = "0x1c651928150daddda9c2c040a9d4901d862f8ec4"
    assert request["input"]["owner"] == issuer
    assert request["input"]["economics"] == {"poolBps": 8600, "remainderTo": issuer}
    logo_hash = sha256((ROOT / "assets/emvo-64.771f691c33.png").read_bytes())
    assert logo_hash == "771f691c330cf00a0a9038b0aac718fd519000872f3cfb0532113739fccac4b4"
    creation = artifact["bytecode"]["object"]
    runtime = artifact["deployedBytecode"]["object"]
    files = {
        "artifacts/LaunchToken.abi.json": encoded(artifact["abi"]),
        "artifacts/LaunchToken.creation.hex": (creation + "\n").encode(),
        "artifacts/LaunchToken.runtime.hex": (runtime + "\n").encode(),
        "artifacts/LaunchToken.metadata.json": encoded(metadata),
        "artifacts/solc-input.json": encoded({"language": "Solidity", "sources": sources, "settings": settings}),
    }
    record = {
        "status": "local_build_not_deployment_or_independent_attestation",
        "contract": "src/LaunchToken.sol:LaunchToken",
        "compiler": metadata["compiler"]["version"],
        "evmVersion": "cancun", "optimizer": True, "optimizerRuns": 200,
        "bytecodeHash": "none", "constructorArguments": [],
        "creationCodeBytes": (len(creation) - 2) // 2,
        "runtimeCodeBytes": (len(runtime) - 2) // 2,
        "creationCodeKeccak256": keccak(creation), "runtimeCodeKeccak256": keccak(runtime),
        "sourceSha256": source_hashes,
        "configurationSha256": {
            name: sha256((ROOT / name).read_bytes())
            for name in ("foundry.toml", "remappings.txt", "launch.json", "launch/request.json")
        },
        "artifactSha256": {name: sha256(data) for name, data in files.items()},
        "logoSha256": logo_hash,
        "note": "SHA-256 here hashes exact file bytes, not the protocol canonical inputHash. No signed quote is claimed."
    }
    files["artifacts/build.json"] = encoded(record)
    for name, data in files.items():
        path = ROOT / name
        if args.check:
            if not path.exists() or path.read_bytes() != data:
                raise SystemExit(f"Artifact differs: {name}; rebuild and export again")
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
    print(f"{'Checked' if args.check else 'Exported'} {len(files)} reproducible artifacts; no RPC or transactions.")


if __name__ == "__main__":
    main()
