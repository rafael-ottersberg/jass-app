FROM python:3.13-slim

WORKDIR /app

COPY ./prod-requirements.txt /app/requirements.txt
COPY ./api /app/api
COPY ./prestart.sh /app/prestart.sh
COPY ./migrations /app/migrations

RUN pip install --no-cache-dir -r /app/requirements.txt

EXPOSE 80

CMD ["sh", "-c", "sh prestart.sh && gunicorn --workers ${WORKERS:-2} --bind 0.0.0.0:${PORT:-80} api:app"]
