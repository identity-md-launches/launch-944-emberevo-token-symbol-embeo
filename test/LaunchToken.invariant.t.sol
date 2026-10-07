// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
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

    // Deliberately reach revoke, dust, finite maximum and unlimited approval states.
    function approveBoundary(uint256 ownerSeed, uint256 spenderSeed, uint8 mode) external {
        address owner = actors[ownerSeed % 4];
        address spender = actors[spenderSeed % 4];
        uint256[5] memory values = [uint256(0), 1, 1_000_000_000 ether, type(uint256).max - 1, type(uint256).max];
        uint256 value = values[mode % values.length];
        vm.prank(owner);
        assertTrue(token.approve(spender, value));
        expectedAllowance[owner][spender] = value;
    }

    function transferOverBalance(uint256 senderSeed, uint256 recipientSeed, uint256 value) external {
        address sender = actors[senderSeed % 4];
        address recipient = actors[recipientSeed % 4];
        uint256 balance = expectedBalance[sender];
        value = bound(value, balance + 1, type(uint256).max);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, sender, balance, value));
        vm.prank(sender);
        token.transfer(recipient, value);
        // No ghost update: every invariant must still hold after this failed operation.
    }

    function transferFromOverBalance(uint256 ownerSeed, uint256 spenderSeed, uint256 recipientSeed, uint256 value)
        external
    {
        address owner = actors[ownerSeed % 4];
        address spender = actors[spenderSeed % 4];
        address recipient = actors[recipientSeed % 4];
        uint256 balance = expectedBalance[owner];
        value = bound(value, balance + 1, type(uint256).max);
        vm.prank(owner);
        assertTrue(token.approve(spender, value));
        expectedAllowance[owner][spender] = value;

        // The allowance suffices; failure must roll back the attempted allowance consumption.
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, owner, balance, value));
        vm.prank(spender);
        token.transferFrom(owner, recipient, value);
    }

    function transferFromToZero(uint256 ownerSeed, uint256 spenderSeed, uint256 value) external {
        address owner = actors[ownerSeed % 4];
        address spender = actors[spenderSeed % 4];
        uint256 allowed = expectedAllowance[owner][spender];
        uint256 limit = expectedBalance[owner] < allowed ? expectedBalance[owner] : allowed;
        value = bound(value, 0, limit);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidReceiver.selector, address(0)));
        vm.prank(spender);
        token.transferFrom(owner, address(0), value);
    }

    function revokeAndAttemptSpend(uint256 ownerSeed, uint256 spenderSeed, uint256 recipientSeed) external {
        address owner = actors[ownerSeed % 4];
        address spender = actors[spenderSeed % 4];
        address recipient = actors[recipientSeed % 4];
        vm.prank(owner);
        assertTrue(token.approve(spender, 0));
        expectedAllowance[owner][spender] = 0;
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, spender, 0, 1));
        vm.prank(spender);
        token.transferFrom(owner, recipient, 1);
    }

    function fullBalanceRoundTrip(uint256 senderSeed, uint256 recipientSeed) external {
        uint256 senderIndex = senderSeed % 4;
        address sender = actors[senderIndex];
        address recipient = actors[(senderIndex + 1 + recipientSeed % 3) % 4];
        uint256 value = expectedBalance[sender];
        uint256 recipientBefore = expectedBalance[recipient];

        vm.prank(sender);
        assertTrue(token.transfer(recipient, value));
        assertEq(token.balanceOf(sender), 0, "entire balance must be transferable");
        assertEq(token.balanceOf(recipient), recipientBefore + value, "round trip forward leg taxed");

        vm.prank(recipient);
        assertTrue(token.transfer(sender, value));
        assertEq(token.balanceOf(sender), value, "round trip failed to restore sender");
        assertEq(token.balanceOf(recipient), recipientBefore, "round trip changed recipient");
        // A round trip leaves both balance ghosts and all allowance ghosts unchanged.
    }
}

/// forge-config: default.invariant.runs = 256
/// forge-config: default.invariant.depth = 128
/// forge-config: default.invariant.fail-on-revert = true
contract LaunchTokenInvariantTest is StdInvariant, Test {
    LaunchToken internal token;
    TokenActions internal actions;
    uint256 internal constant SUPPLY = 1_000_000_000 ether;

    function setUp() public {
        vm.chainId(1);
        token = new LaunchToken();
        actions = new TokenActions(token);
        token.transfer(actions.actors(0), SUPPLY);
        bytes4[] memory selectors = new bytes4[](9);
        selectors[0] = TokenActions.transfer.selector;
        selectors[1] = TokenActions.approve.selector;
        selectors[2] = TokenActions.transferFrom.selector;
        selectors[3] = TokenActions.approveBoundary.selector;
        selectors[4] = TokenActions.transferOverBalance.selector;
        selectors[5] = TokenActions.transferFromOverBalance.selector;
        selectors[6] = TokenActions.transferFromToZero.selector;
        selectors[7] = TokenActions.revokeAndAttemptSpend.selector;
        selectors[8] = TokenActions.fullBalanceRoundTrip.selector;
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

    // After each random sequence, every actor can still transfer its entire balance and receive it back.
    function afterInvariant() public {
        for (uint256 i; i < 4; ++i) {
            actions.fullBalanceRoundTrip(i, 0);
        }
        invariant_fixedSupplyAndExactBalances();
        invariant_allowancesMatchExplicitAuthorizations();
    }

    // A deterministic nonzero sequence exercises every handler, including post-failure liveness.
    function test_handlerSequenceExercisesFiniteInfiniteAndRevokedAllowances() public {
        actions.transfer(0, 1, 100);
        actions.approve(1, 2, 70);
        actions.transferFrom(1, 2, 3, 30);
        actions.transferFromOverBalance(1, 2, 3, 71);
        invariant_fixedSupplyAndExactBalances();
        invariant_allowancesMatchExplicitAuthorizations();
        assertEq(token.allowance(actions.actors(1), actions.actors(2)), 71);

        actions.approveBoundary(1, 2, 4);
        actions.transferFrom(1, 2, 3, 10);
        assertEq(token.allowance(actions.actors(1), actions.actors(2)), type(uint256).max);
        actions.transferFromToZero(1, 2, 1);
        actions.revokeAndAttemptSpend(1, 2, 3);
        actions.transferOverBalance(1, 3, type(uint256).max);
        actions.fullBalanceRoundTrip(1, 3);

        assertEq(token.balanceOf(actions.actors(1)), 60);
        assertEq(token.balanceOf(actions.actors(3)), 40);
        afterInvariant();
    }
}
