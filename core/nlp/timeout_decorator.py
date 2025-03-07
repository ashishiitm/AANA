# core/nlp/timeout_decorator.py

import signal

# =========================================
# Custom Timeout Exception
# =========================================
class TimeoutException(Exception):
    """
    Custom exception to be raised when a function exceeds the time limit.
    """
    pass


# =========================================
# Timeout Decorator
# =========================================
def timeout(seconds=5, error_message="Timeout Error"):
    """
    A decorator that applies a timeout to a function. If the function
    takes longer than `seconds` to execute, a TimeoutException is raised.
    
    Args:
        seconds (int): Maximum time allowed for the function to execute.
        error_message (str): Custom error message for the timeout.
    
    Returns:
        function: Wrapped function with timeout applied.
    """
    
    # Step 2.1: Create the decorator function
    def decorator(func):

        # Step 2.2: Define the timeout handler
        def _handle_timeout(signum, frame):
            raise TimeoutException(error_message)

        # Step 2.3: Define the wrapper function
        def wrapper(*args, **kwargs):
            # (1) Register the timeout handler
            signal.signal(signal.SIGALRM, _handle_timeout)
            # (2) Set the alarm
            signal.alarm(seconds)
            try:
                # (3) Call the original function
                result = func(*args, **kwargs)
            finally:
                # (4) Disable the alarm
                signal.alarm(0)
            return result
        
        return wrapper
    
    return decorator
