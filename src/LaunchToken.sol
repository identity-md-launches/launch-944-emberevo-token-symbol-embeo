// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @notice EmberEVO (EMBEO), the standard fixed-supply launch token.
/// @dev The official ProjectFactory receives the entire supply and performs its policy allocation.
/// There are no constructor arguments, extensions, privileged roles or later mint/burn entry points.
contract LaunchToken is ERC20 {
    constructor() ERC20("EmberEVO", "EMBEO") {
        _mint(msg.sender, 1_000_000_000 * 10 ** 18);
    }
}
