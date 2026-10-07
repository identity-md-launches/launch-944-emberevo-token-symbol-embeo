// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {LaunchToken} from "../src/LaunchToken.sol";

contract TokenActions is Test {
    LaunchToken public immutable token;
    address[4] public actors = [address(0x1001), address(0x1002), address(0x1003), address(0x1004)];
    mapping(address => uint256) public expectedBalance;
    mapping(address => mapping(address => uint256)) public expectedAllowance;

    constructor(LaunchToken token_) {
        token = token_;
        expectedBalance[actors[0]] = 1_000_000_000 ether;
    }

    function transfer(uint256 senderSeed, uint256 recipientSeed, uint256 value) external {
        address sender = actors[senderSeed % 4];
        address recipient = actors[recipientSeed % 4];
        value = bound(value, 0, expectedBalance[sender]);
        vm.prank(sender);
        assertTrue(token.transfer(recipient, value));
        expectedBalance[sender] -= value;
        expectedBalance[recipient] += value;
    }

    function approve(uint256 ownerSeed, uint256 spenderSeed, uint256 value) external {
        address owner = actors[ownerSeed % 4];
        address spender = actors[spenderSeed % 4];
        vm.prank(owner);
        assertTrue(token.approve(spender, value));
        expectedAllowance[owner][spender] = value;
    }

    function transferFrom(uint256 ownerSeed, uint256 spenderSeed, uint256 recipientSeed, uint256 value) external {
        address owner = actors[ownerSeed % 4];
        address spender = actors[spenderSeed % 4];
        address recipient = actors[recipientSeed % 4];
        uint256 allowed = expectedAllowance[owner][spender];
        uint256 limit = expectedBalance[owner] < allowed ? expectedBalance[owner] : allowed;
        value = bound(value, 0, limit);
        vm.prank(spender);
        assertTrue(token.transferFrom(owner, recipient, value));
        expectedBalance[owner] -= value;
        expectedBalance[recipient] += value;
        if (allowed != type(uint256).max) expectedAllowance[owner][spender] -= value;
    }
}

contract LaunchTokenInvariantTest is StdInvariant, Test {
    LaunchToken internal token;
    TokenActions internal actions;
    uint256 internal constant SUPPLY = 1_000_000_000 ether;

    function setUp() public {
        token = new LaunchToken();
        actions = new TokenActions(token);
        token.transfer(actions.actors(0), SUPPLY);
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = TokenActions.transfer.selector;
        selectors[1] = TokenActions.approve.selector;
        selectors[2] = TokenActions.transferFrom.selector;
        targetSelector(FuzzSelector({addr: address(actions), selectors: selectors}));
        targetContract(address(actions));
    }

    function invariant_fixedSupplyAndExactBalances() public view {
        uint256 sum;
        for (uint256 i; i < 4; ++i) {
            address actor = actions.actors(i);
            assertEq(token.balanceOf(actor), actions.expectedBalance(actor));
            sum += token.balanceOf(actor);
        }
        assertEq(sum, SUPPLY);
        assertEq(token.totalSupply(), SUPPLY);
        assertEq(token.balanceOf(address(0)), 0);
        assertEq(token.balanceOf(address(this)), 0);
        assertEq(token.balanceOf(address(actions)), 0);
    }

    function invariant_allowancesMatchExplicitAuthorizations() public view {
        for (uint256 i; i < 4; ++i) {
            for (uint256 j; j < 4; ++j) {
                address owner = actions.actors(i);
                address spender = actions.actors(j);
                assertEq(token.allowance(owner, spender), actions.expectedAllowance(owner, spender));
            }
        }
    }
}
