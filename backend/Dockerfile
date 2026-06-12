FROM python:3.11-slim

WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV HF_HOME=/root/.cache/huggingface

# cpu = API image (light) | cu124 = worker image (GPU)
ARG TORCH_VARIANT=cu124

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc ca-certificates libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml requirements.txt ./

RUN pip install --upgrade pip \
    && if [ "$TORCH_VARIANT" = "cpu" ]; then \
         pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu; \
       else \
         pip install torch torchvision --index-url https://download.pytorch.org/whl/${TORCH_VARIANT}; \
       fi \
    && pip install -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
