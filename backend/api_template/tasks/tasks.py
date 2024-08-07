import logging
import time

from api.extensions import scheduler

@scheduler.task('interval', id='example-task', seconds=600, misfire_grace_time=900)
def example_task():
    print(f"10min task: {time.time()}")
