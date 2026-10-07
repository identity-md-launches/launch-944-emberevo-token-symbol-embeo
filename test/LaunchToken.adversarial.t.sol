// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {LaunchToken} from "src/LaunchToken.sol";

/// @dev Complements the constructor, metadata, allocation and selector tests in LaunchToken.t.sol.
/// forge-config: default.fuzz.runs = 1000
contract LaunchTokenAdversarialTest is Test {
    LaunchToken internal token;
    uint256 internal constant SUPPLY = 1_000_000_000 ether;
    address internal constant ALICE = address(0xA11CE);
    address internal constant BOB = address(0xB0B);
    address internal constant SPENDER = address(0xCAFE);

    event Transfer(address indexed from, address indexed to, uint256 value);

    function setUp() public {
        vm.chainId(1);
        token = new LaunchToken();
    }

    function test_zeroOneAndFullSupplyRoundTripsPreserveUnrelatedApproval() public {
        assertTrue(token.approve(SPENDER, 17));
        uint256[4] memory values = [uint256(0), 1, SUPPLY - 1, SUPPLY];
        for (uint256 i; i < values.length; ++i) {
            uint256 amount = values[i];
            assertTrue(token.transfer(ALICE, amount));
            assertEq(token.balanceOf(ALICE), amount);
            assertEq(token.balanceOf(address(this)), SUPPLY - amount);
            vm.prank(ALICE);
            assertTrue(token.transfer(address(this), amount));
            assertEq(token.balanceOf(address(this)), SUPPLY);
            assertEq(token.balanceOf(ALICE), 0);
            assertEq(token.allowance(address(this), SPENDER), 17);
            assertEq(token.totalSupply(), SUPPLY);
        }
    }

    function test_zeroTransferFromWithoutApprovalEmitsTransfer() public {
        vm.expectEmit(true, true, false, true, address(token));
        emit Transfer(ALICE, BOB, 0);
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(ALICE, BOB, 0));
        assertEq(token.allowance(ALICE, SPENDER), 0);
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.balanceOf(BOB), 0);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function test_delegatedSelfTransferConsumesFiniteAllowanceAndCannotReplay() public {
        assertTrue(token.approve(SPENDER, SUPPLY));
        vm.expectEmit(true, true, false, true, address(token));
        emit Transfer(address(this), address(this), SUPPLY);
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(address(this), address(this), SUPPLY));
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.allowance(address(this), SPENDER), 0);

        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, SPENDER, 0, 1));
        vm.prank(SPENDER);
        token.transferFrom(address(this), address(this), 1);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.allowance(address(this), SPENDER), 0);
    }

    function test_selfTransfersCannotBypassBalanceChecks() public {
        uint256 amount = SUPPLY + 1;
        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(this), SUPPLY, amount)
        );
        token.transfer(address(this), amount);

        assertTrue(token.approve(SPENDER, amount));
        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(this), SUPPLY, amount)
        );
        vm.prank(SPENDER);
        token.transferFrom(address(this), address(this), amount);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.allowance(address(this), SPENDER), amount);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function test_maximumFiniteAllowanceDecrementsAndUnlimitedCanBeRevoked() public {
        uint256 finite = type(uint256).max - 1;
        assertTrue(token.approve(SPENDER, finite));
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(address(this), ALICE, 1));
        assertEq(token.allowance(address(this), SPENDER), finite - 1);

        assertTrue(token.approve(SPENDER, type(uint256).max));
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(address(this), ALICE, SUPPLY - 1));
        assertEq(token.allowance(address(this), SPENDER), type(uint256).max);

        vm.prank(ALICE);
        assertTrue(token.transfer(address(this), SUPPLY));
        assertTrue(token.approve(SPENDER, 0));
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, SPENDER, 0, 1));
        vm.prank(SPENDER);
        token.transferFrom(address(this), ALICE, 1);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.allowance(address(this), SPENDER), 0);
    }

    function test_maximumTransferCannotWrapBalancesEvenWithUnlimitedApproval() public {
        uint256 maximum = type(uint256).max;
        bytes memory expected =
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, address(this), SUPPLY, maximum);
        vm.expectRevert(expected);
        token.transfer(ALICE, maximum);

        assertTrue(token.approve(SPENDER, maximum));
        vm.expectRevert(expected);
        vm.prank(SPENDER);
        token.transferFrom(address(this), ALICE, maximum);
        assertEq(token.allowance(address(this), SPENDER), maximum);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function test_approvalBelongsToCallerNotTransactionOrigin() public {
        assertTrue(token.approve(SPENDER, 17));
        vm.prank(ALICE, address(this));
        assertTrue(token.approve(SPENDER, type(uint256).max));
        assertEq(token.allowance(ALICE, SPENDER), type(uint256).max);
        assertEq(token.allowance(address(this), SPENDER), 17);
        assertEq(token.balanceOf(address(this)), SUPPLY);
    }

    function test_transactionOriginCannotAuthorizeAnotherSpender() public {
        assertTrue(token.approve(SPENDER, 17));
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, ALICE, 0, 1));
        vm.prank(ALICE, SPENDER);
        token.transferFrom(address(this), BOB, 1);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(BOB), 0);
        assertEq(token.allowance(address(this), SPENDER), 17);
        assertEq(token.allowance(address(this), ALICE), 0);
    }

    function test_failedZeroRecipientSpendLeavesAllowanceUsable() public {
        assertTrue(token.approve(SPENDER, SUPPLY));
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidReceiver.selector, address(0)));
        vm.prank(SPENDER);
        token.transferFrom(address(this), address(0), SUPPLY);
        assertEq(token.allowance(address(this), SPENDER), SUPPLY);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(address(0)), 0);
        assertEq(token.totalSupply(), SUPPLY);

        vm.prank(SPENDER);
        assertTrue(token.transferFrom(address(this), ALICE, SUPPLY));
        assertEq(token.balanceOf(ALICE), SUPPLY);
        assertEq(token.balanceOf(address(this)), 0);
        assertEq(token.allowance(address(this), SPENDER), 0);
    }

    function test_zeroSpenderCannotBeApprovedEvenForZeroValue() public {
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidSpender.selector, address(0)));
        token.approve(address(0), 0);
        assertEq(token.allowance(address(this), address(0)), 0);
        assertEq(token.balanceOf(address(this)), SUPPLY);
    }

    function test_valueAttachedToValidERC20CallsIsRejectedAtomically() public {
        vm.deal(address(this), 3);
        assertTrue(token.approve(address(this), 7));
        bytes[3] memory calls = [
            abi.encodeCall(token.transfer, (ALICE, 1)),
            abi.encodeCall(token.approve, (SPENDER, type(uint256).max)),
            abi.encodeCall(token.transferFrom, (address(this), ALICE, 1))
        ];
        for (uint256 i; i < calls.length; ++i) {
            (bool success,) = address(token).call{value: 1}(calls[i]);
            assertFalse(success, "ERC20 operation unexpectedly accepted ETH");
            assertEq(address(token).balance, 0);
            assertEq(address(this).balance, 3);
            assertEq(token.balanceOf(address(this)), SUPPLY);
            assertEq(token.balanceOf(ALICE), 0);
            assertEq(token.allowance(address(this), address(this)), 7);
            assertEq(token.allowance(address(this), SPENDER), 0);
            assertEq(token.totalSupply(), SUPPLY);
        }
    }

    function testFuzz_overAllowanceFailsDespiteSufficientBalance(uint256 amount, uint256 allowed) public {
        amount = bound(amount, 1, SUPPLY);
        allowed = bound(allowed, 0, amount - 1);
        assertTrue(token.approve(SPENDER, allowed));
        // Another spender's authorization must not help SPENDER.
        assertTrue(token.approve(BOB, type(uint256).max));
        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, SPENDER, allowed, amount)
        );
        vm.prank(SPENDER);
        token.transferFrom(address(this), ALICE, amount);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.allowance(address(this), SPENDER), allowed);
        assertEq(token.allowance(address(this), BOB), type(uint256).max);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function testFuzz_overBalanceRollsBackFiniteAllowance(uint256 balance, uint256 amount, uint256 allowed) public {
        balance = bound(balance, 0, SUPPLY);
        amount = bound(amount, balance + 1, type(uint256).max - 1);
        allowed = bound(allowed, amount, type(uint256).max - 1);
        assertTrue(token.transfer(ALICE, balance));
        vm.prank(ALICE);
        assertTrue(token.approve(SPENDER, allowed));

        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, ALICE, balance, amount));
        vm.prank(SPENDER);
        token.transferFrom(ALICE, BOB, amount);
        assertEq(token.balanceOf(ALICE), balance);
        assertEq(token.balanceOf(BOB), 0);
        assertEq(token.balanceOf(address(this)), SUPPLY - balance);
        assertEq(token.allowance(ALICE, SPENDER), allowed);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function testFuzz_spentAllowanceCannotBeReplayedAfterTokensReturn(uint256 amount) public {
        amount = bound(amount, 1, SUPPLY);
        assertTrue(token.approve(SPENDER, amount));
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(address(this), ALICE, amount));
        vm.prank(ALICE);
        assertTrue(token.transfer(address(this), amount));

        // Restore the entire balance so only authorization can prevent the replay.
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, SPENDER, 0, amount));
        vm.prank(SPENDER);
        token.transferFrom(address(this), ALICE, amount);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.allowance(address(this), SPENDER), 0);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function testFuzz_roundTripThroughIndependentSpendersIsLossless(uint256 amount) public {
        amount = bound(amount, 1, SUPPLY);
        assertTrue(token.transfer(ALICE, amount));
        vm.prank(ALICE);
        assertTrue(token.approve(SPENDER, amount));
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(ALICE, BOB, amount));
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.balanceOf(BOB), amount);

        vm.prank(BOB);
        assertTrue(token.approve(ALICE, amount));
        vm.prank(ALICE);
        assertTrue(token.transferFrom(BOB, address(this), amount));
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.balanceOf(BOB), 0);
        assertEq(token.balanceOf(SPENDER), 0);
        assertEq(token.allowance(ALICE, SPENDER), 0);
        assertEq(token.allowance(BOB, ALICE), 0);
        assertEq(token.totalSupply(), SUPPLY);
    }
}
