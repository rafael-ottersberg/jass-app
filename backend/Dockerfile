FROM python:3.10-slim

WORKDIR /app

COPY ./prod-requirements.txt /app/requirements.txt
COPY ./api /app/api

RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		gcc \
		g++ \
		libffi-dev \
		libheif-dev \
		libde265-dev \
		pkg-config \
	&& rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir --upgrade "pip>=26.2" "setuptools>=83.0.0" \
	&& pip install --no-cache-dir --upgrade -r /app/requirements.txt \
	&& pip install --no-cache-dir --upgrade gunicorn

EXPOSE 80

CMD ["sh", "-c", "gunicorn --workers ${WORKERS:-2} --bind 0.0.0.0:${PORT:-80} api:app"]
