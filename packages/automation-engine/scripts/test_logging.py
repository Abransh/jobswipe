
import sys
import time
import logging

# Setup basic logging to stderr
logging.basicConfig(stream=sys.stderr, level=logging.INFO)
logger = logging.getLogger("test_logging")

print("STDOUT: This is a standard output message", file=sys.stdout)
print("STDERR: This is a standard error message", file=sys.stderr)

logger.info("LOGGING: This is a logger info message")
logger.warning("LOGGING: This is a logger warning message")
logger.error("LOGGING: This is a logger error message")

# Simulate some work
time.sleep(1)

# Output JSON result for the bridge
import json
print(json.dumps({"success": True, "message": "Logging test complete"}))
