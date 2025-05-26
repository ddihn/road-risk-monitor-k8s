CREATE DATABASE IF NOT EXISTS dangerDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dangerDB;

CREATE TABLE IF NOT EXISTS road_risk_data (
    idx VARCHAR(100) COMMENT '표시용 순번 (item.get("index") 값)',
    highwayName VARCHAR(255) COMMENT '고속도로 이름',
    segmentName VARCHAR(255) COMMENT '구간 이름',
    start_lat DOUBLE COMMENT '구간 시작 지점의 위도',
    start_lng DOUBLE COMMENT '구간 시작 지점의 경도',
    end_lat DOUBLE COMMENT '구간 종료 지점의 위도',
    end_lng DOUBLE COMMENT '구간 종료 지점의 경도',
    anals_value DOUBLE COMMENT '구간 도로 위험도 지수값',
    anals_grd VARCHAR(20) COMMENT '도로 위험도 등급',
    updated_at TIMESTAMP COMMENT '데이터 수집 또는 갱신 시각 (UTC 기준)'
) COMMENT = '고속도로 구간별 도로 위험도 정보 저장 테이블';

FLUSH PRIVILEGES;

