#!/usr/bin/env python3
"""
JobSwipe Automation Test Runner
Main test script to run all automation tests
"""

import asyncio
import sys
import argparse
from pathlib import Path

# Add paths
sys.path.append(str(Path(__file__).parent))

from test_greenhouse import run_greenhouse_tests


async def run_all_tests(verbose=False):
    """Run all automation tests"""
    print("🧪 JobSwipe Automation Test Suite")
    print("=" * 50)
    
    all_results = []
    
    # Run Greenhouse tests
    try:
        print("\n🌱 Starting Greenhouse Tests...")
        greenhouse_results = await run_greenhouse_tests()
        all_results.append(("Greenhouse", greenhouse_results))
    except Exception as e:
        print(f"❌ Greenhouse tests failed with error: {e}")
        all_results.append(("Greenhouse", {"passed": 0, "total_tests": 0, "success_rate": 0, "errors": [str(e)]}))
    
    # TODO: Add LinkedIn tests when available
    # print("\n💼 Starting LinkedIn Tests...")
    # linkedin_results = await run_linkedin_tests()
    # all_results.append(("LinkedIn", linkedin_results))
    
    # TODO: Add Indeed tests when available
    # print("\n🔍 Starting Indeed Tests...")
    # indeed_results = await run_indeed_tests()
    # all_results.append(("Indeed", indeed_results))
    
    # Print overall summary
    print("\n" + "="*60)
    print("📊 OVERALL TEST SUMMARY")
    print("="*60)
    
    total_passed = 0
    total_tests = 0
    
    for automation_name, results in all_results:
        passed = results.get("passed", 0)
        total = results.get("total_tests", 0)
        rate = results.get("success_rate", 0)
        
        total_passed += passed
        total_tests += total
        
        status = "✅" if rate >= 80 else "❌"
        print(f"{status} {automation_name:15} {passed:3}/{total:<3} ({rate:5.1f}%)")
        
        if verbose and results.get("errors"):
            for error in results["errors"]:
                print(f"   Error: {error}")
    
    overall_rate = (total_passed / total_tests * 100) if total_tests > 0 else 0
    
    print("-" * 60)
    print(f"🎯 TOTAL:          {total_passed:3}/{total_tests:<3} ({overall_rate:5.1f}%)")
    
    if overall_rate >= 80:
        print("✅ TEST SUITE PASSED")
        return 0
    else:
        print("❌ TEST SUITE FAILED")
        return 1


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(description="Run JobSwipe automation tests")
    parser.add_argument("-v", "--verbose", action="store_true", help="Verbose output")
    parser.add_argument("--company", choices=["greenhouse", "linkedin", "indeed"], 
                       help="Run tests for specific company only")
    
    args = parser.parse_args()
    
    if args.company:
        if args.company == "greenhouse":
            exit_code = asyncio.run(run_company_tests("greenhouse", args.verbose))
        else:
            print(f"❌ Tests for {args.company} not yet implemented")
            exit_code = 1
    else:
        exit_code = asyncio.run(run_all_tests(args.verbose))
    
    sys.exit(exit_code)


async def run_company_tests(company: str, verbose: bool = False) -> int:
    """Run tests for a specific company"""
    print(f"🧪 Running {company.title()} Tests Only")
    print("=" * 50)
    
    if company == "greenhouse":
        results = await run_greenhouse_tests()
        success_rate = results.get("success_rate", 0)
        
        if verbose and results.get("errors"):
            print("⚠️ Errors:")
            for error in results["errors"]:
                print(f"   {error}")
        
        return 0 if success_rate >= 80 else 1
    
    else:
        print(f"❌ {company.title()} tests not implemented yet")
        return 1


if __name__ == "__main__":
    main()