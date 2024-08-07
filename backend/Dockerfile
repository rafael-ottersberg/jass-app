FROM tiangolo/meinheld-gunicorn-flask:python3.9

COPY ./prod-requirements.txt /app/requirements.txt
COPY ./api /app/api

RUN pip install --no-cache-dir --upgrade -r /app/requirements.txt

ENV MODULE_NAME="api.__init__"
