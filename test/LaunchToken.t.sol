// SPDX-License-Identifier: MIT
pragma solidity 0.8.26;

import {Test} from "forge-std/Test.sol";
import {Vm} from "forge-std/Vm.sol";
import {IERC20Errors} from "@openzeppelin/contracts/interfaces/draft-IERC6093.sol";
import {LaunchToken} from "../src/LaunchToken.sol";

/// @dev Test fixture only; it is not an application contract or a replacement for ProjectFactory.
contract ConstructorProbe {
    function deploy(bytes32 salt) external returns (LaunchToken) {
        return new LaunchToken{salt: salt}();
    }
}

/// @dev A plain ERC-20 transfer must succeed without calling this receiver.
contract RejectingReceiver {
    fallback() external payable {
        revert("no callbacks");
    }
}

contract LaunchTokenTest is Test {
    LaunchToken internal token;
    uint256 internal constant SUPPLY = 1_000_000_000 ether;
    address internal constant ALICE = address(0xA11CE);
    address internal constant BOB = address(0xB0B);
    address internal constant SPENDER = address(0xCAFE);
    address internal constant ISSUER = 0x1C651928150DADDDA9C2C040a9D4901d862f8eC4;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function setUp() public {
        token = new LaunchToken();
    }

    function test_metadataAndEntireSupplyBelongToConstructorCaller() public view {
        assertEq(token.name(), "EmberEVO");
        assertEq(token.symbol(), "EMBEO");
        assertEq(token.decimals(), 18);
        assertEq(token.totalSupply(), SUPPLY);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(ISSUER), 0);
        assertEq(token.balanceOf(address(token)), 0);
        assertEq(token.balanceOf(address(0)), 0);
    }

    function test_constructorEmitsOneMint() public {
        vm.recordLogs();
        LaunchToken fresh = new LaunchToken();
        Vm.Log[] memory logs = vm.getRecordedLogs();
        assertEq(logs.length, 1);
        assertEq(logs[0].emitter, address(fresh));
        assertEq(logs[0].topics[0], keccak256("Transfer(address,address,uint256)"));
        assertEq(logs[0].topics[1], bytes32(0));
        assertEq(logs[0].topics[2], bytes32(uint256(uint160(address(this)))));
        assertEq(abi.decode(logs[0].data, (uint256)), SUPPLY);
    }

    function test_create2ConstructorMintsToFactoryAndPlainTransfersSupportAllocation() public {
        ConstructorProbe factory = new ConstructorProbe();
        LaunchToken launched = factory.deploy(bytes32(uint256(1)));
        assertEq(launched.balanceOf(address(factory)), SUPPLY);
        assertEq(launched.balanceOf(ISSUER), 0);
        address pool = address(0x100);
        address distributor = address(0x200);
        vm.startPrank(address(factory));
        assertTrue(launched.transfer(pool, 860_000_000 ether));
        assertTrue(launched.transfer(distributor, 100_000_000 ether));
        assertTrue(launched.transfer(ISSUER, 40_000_000 ether));
        vm.stopPrank();
        assertEq(launched.balanceOf(pool), SUPPLY * 8600 / 10_000);
        assertEq(launched.balanceOf(distributor), SUPPLY * 1000 / 10_000);
        assertEq(launched.balanceOf(ISSUER), SUPPLY * 400 / 10_000);
        assertEq(launched.balanceOf(address(factory)), 0);
        assertEq(launched.totalSupply(), SUPPLY);
    }

    function test_transferEmitsExactAmountWithoutTax() public {
        vm.expectEmit(true, true, false, true, address(token));
        emit Transfer(address(this), ALICE, 123 ether);
        assertTrue(token.transfer(ALICE, 123 ether));
        assertEq(token.balanceOf(ALICE), 123 ether);
        assertEq(token.balanceOf(address(this)), SUPPLY - 123 ether);
        assertEq(token.balanceOf(ISSUER), 0);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function test_zeroAndSelfTransfers() public {
        assertTrue(token.transfer(ALICE, 0));
        assertTrue(token.transfer(address(this), SUPPLY));
        assertEq(token.balanceOf(address(this)), SUPPLY);
        vm.prank(ALICE);
        assertTrue(token.transfer(BOB, 0));
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.balanceOf(BOB), 0);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function test_transferToZeroRevertsEvenForZeroAmount() public {
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidReceiver.selector, address(0)));
        token.transfer(address(0), 1);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidReceiver.selector, address(0)));
        token.transfer(address(0), 0);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function test_insufficientBalanceRevertsAtomically() public {
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, ALICE, 0, 1));
        vm.prank(ALICE);
        token.transfer(BOB, 1);
        assertEq(token.balanceOf(ALICE), 0);
        assertEq(token.balanceOf(BOB), 0);
    }

    function test_approveReplaceRevokeAndSpend() public {
        vm.expectEmit(true, true, false, true, address(token));
        emit Approval(address(this), SPENDER, 100 ether);
        assertTrue(token.approve(SPENDER, 100 ether));
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(address(this), ALICE, 40 ether));
        assertEq(token.allowance(address(this), SPENDER), 60 ether);
        assertEq(token.balanceOf(ALICE), 40 ether);
        assertTrue(token.approve(SPENDER, 7 ether));
        assertEq(token.allowance(address(this), SPENDER), 7 ether);
        assertTrue(token.approve(SPENDER, 0));
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, SPENDER, 0, 1));
        vm.prank(SPENDER);
        token.transferFrom(address(this), BOB, 1);
        assertEq(token.balanceOf(BOB), 0);
    }

    function test_infiniteAllowanceRetainsStandardERC20Semantics() public {
        token.approve(SPENDER, type(uint256).max);
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(address(this), ALICE, 5 ether));
        assertEq(token.allowance(address(this), SPENDER), type(uint256).max);
        assertEq(token.balanceOf(ALICE), 5 ether);
    }

    function test_unapprovedSpenderCannotTransfer() public {
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientAllowance.selector, SPENDER, 0, 1));
        vm.prank(SPENDER);
        token.transferFrom(address(this), ALICE, 1);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.balanceOf(ALICE), 0);
    }

    function test_transferFromFailureRollsBackAllowance() public {
        vm.prank(ALICE);
        token.approve(SPENDER, 100);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, ALICE, 0, 100));
        vm.prank(SPENDER);
        token.transferFrom(ALICE, BOB, 100);
        assertEq(token.allowance(ALICE, SPENDER), 100);

        token.approve(SPENDER, 100);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidReceiver.selector, address(0)));
        vm.prank(SPENDER);
        token.transferFrom(address(this), address(0), 100);
        assertEq(token.allowance(address(this), SPENDER), 100);
        assertEq(token.balanceOf(address(this)), SUPPLY);
    }

    function test_zeroAddressApprovalsAndTransferSourceRevert() public {
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidSpender.selector, address(0)));
        token.approve(address(0), 1);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidApprover.selector, address(0)));
        vm.prank(address(0));
        token.approve(SPENDER, 1);
        vm.expectRevert(abi.encodeWithSelector(IERC20Errors.ERC20InvalidSender.selector, address(0)));
        vm.prank(address(0));
        token.transfer(ALICE, 0);
        // Zero-value transferFrom still rejects a zero source (while spending its zero allowance).
        vm.expectRevert();
        token.transferFrom(address(0), ALICE, 0);
    }

    function test_contractRecipientsReceiveWithoutCallbacksOrSupplyReduction() public {
        RejectingReceiver receiver = new RejectingReceiver();
        assertTrue(token.transfer(address(receiver), 12 ether));
        assertTrue(token.transfer(address(token), 3 ether));
        assertEq(token.balanceOf(address(receiver)), 12 ether);
        assertEq(token.balanceOf(address(token)), 3 ether);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function test_noPrivilegedOrExtensionSelectorsForDeployerIssuerOrStranger() public {
        bytes[] memory calls = new bytes[](20);
        calls[0] = abi.encodeWithSignature("mint(address,uint256)", ALICE, 1);
        calls[1] = abi.encodeWithSignature("mint(uint256)", 1);
        calls[2] = abi.encodeWithSignature("mint()");
        calls[3] = abi.encodeWithSignature("issue(uint256)", 1);
        calls[4] = abi.encodeWithSignature("owner()");
        calls[5] = abi.encodeWithSignature("setOwner(address)", ALICE);
        calls[6] = abi.encodeWithSignature("transferOwnership(address)", ALICE);
        calls[7] = abi.encodeWithSignature("upgradeTo(address)", ALICE);
        calls[8] = abi.encodeWithSignature("initialize(address)", ALICE);
        calls[9] = abi.encodeWithSignature("pause()");
        calls[10] = abi.encodeWithSignature("unpause()");
        calls[11] = abi.encodeWithSignature("setMinter(address)", ALICE);
        calls[12] = abi.encodeWithSignature("blacklist(address)", ALICE);
        calls[13] = abi.encodeWithSignature("setFee(uint256)", 100);
        calls[14] = abi.encodeWithSignature("burn(uint256)", 1);
        calls[15] = abi.encodeWithSignature("burnFrom(address,uint256)", address(this), 1);
        calls[16] = abi.encodeWithSignature("rebase(uint256)", 1);
        calls[17] = abi.encodeWithSignature("stake(uint256)", 1);
        calls[18] = abi.encodeWithSignature("withdraw(uint256)", 1);
        calls[19] = abi.encodeWithSignature(
            "permit(address,address,uint256,uint256,uint8,bytes32,bytes32)",
            address(this),
            SPENDER,
            1,
            type(uint256).max,
            27,
            bytes32(0),
            bytes32(0)
        );
        address[3] memory callers = [address(this), ISSUER, ALICE];
        for (uint256 i; i < callers.length; ++i) {
            for (uint256 j; j < calls.length; ++j) {
                vm.prank(callers[i]);
                (bool ok,) = address(token).call(calls[j]);
                assertFalse(ok, "unexpected privileged or extension entry point");
            }
        }
        assertEq(token.totalSupply(), SUPPLY);
        assertEq(token.balanceOf(address(this)), SUPPLY);
        assertEq(token.allowance(address(this), SPENDER), 0);
        assertTrue(token.transfer(ALICE, 1));
    }

    function test_rejectsETHAndUnknownCalls() public {
        vm.deal(address(this), 1 ether);
        (bool received,) = address(token).call{value: 1}("");
        assertFalse(received);
        (bool fallbackAccepted,) = address(token).call(hex"deadbeef");
        assertFalse(fallbackAccepted);
        assertEq(address(token).balance, 0);
    }

    function test_runtimeBoundedAndNoEscapeOpcodes() public view {
        bytes memory runtime = address(token).code;
        assertGt(runtime.length, 0);
        assertLe(runtime.length, 24_576);
        for (uint256 i; i < runtime.length; ++i) {
            uint8 opcode = uint8(runtime[i]);
            if (opcode >= 0x60 && opcode <= 0x7f) {
                i += opcode - 0x5f;
                continue;
            }
            assertTrue(opcode != 0xf4 && opcode != 0xf2 && opcode != 0xff);
        }
    }

    function testFuzz_transfersConserveSupply(uint256 first, uint256 second) public {
        first = bound(first, 0, SUPPLY);
        second = bound(second, 0, first);
        token.transfer(ALICE, first);
        vm.prank(ALICE);
        token.transfer(BOB, second);
        assertEq(token.balanceOf(address(this)), SUPPLY - first);
        assertEq(token.balanceOf(ALICE), first - second);
        assertEq(token.balanceOf(BOB), second);
        assertEq(token.balanceOf(address(this)) + token.balanceOf(ALICE) + token.balanceOf(BOB), SUPPLY);
        assertEq(token.totalSupply(), SUPPLY);
    }

    function testFuzz_transferFromExactAllowance(uint256 amount) public {
        amount = bound(amount, 0, SUPPLY);
        token.approve(SPENDER, amount);
        vm.prank(SPENDER);
        assertTrue(token.transferFrom(address(this), ALICE, amount));
        assertEq(token.allowance(address(this), SPENDER), 0);
        assertEq(token.balanceOf(ALICE), amount);
        assertEq(token.balanceOf(address(this)), SUPPLY - amount);
    }

    function testFuzz_overspendingRevertsWithoutStateChange(uint256 balance, uint256 excess) public {
        balance = bound(balance, 0, SUPPLY);
        excess = bound(excess, 1, type(uint256).max - balance);
        token.transfer(ALICE, balance);
        vm.expectRevert(
            abi.encodeWithSelector(IERC20Errors.ERC20InsufficientBalance.selector, ALICE, balance, balance + excess)
        );
        vm.prank(ALICE);
        token.transfer(BOB, balance + excess);
        assertEq(token.balanceOf(ALICE), balance);
        assertEq(token.balanceOf(BOB), 0);
        assertEq(token.totalSupply(), SUPPLY);
    }
}
