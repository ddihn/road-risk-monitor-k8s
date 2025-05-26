# python-collector/Dockerfile
FROM python:3.10-slim

# 작업 디렉토리 설정
WORKDIR /app

# 필요 패키지 복사
COPY requirements.txt .

# 패키지 설치
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# 소스 코드 복사
COPY . .

# 실행 명령어 (예: main.py)
CMD ["python", "roadMonitor.py"]
