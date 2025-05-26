import requests
import pandas as pd
import logging
import os
from datetime import datetime, timezone
from sqlalchemy import create_engine

# DB 접속 정보
user = 'kopouser'
password = 'kopouser'
host = 'mysql'
port = '3306'
database = 'dangerDB'

# 로그 파일 설정
os.makedirs("/logs", exist_ok=True)  # 로그 폴더가 없으면 생성
logging.basicConfig(
    filename='/logs/road_risk.log',
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
)

# SQLAlchemy 엔진 생성
engine = create_engine(
    f'mysql+mysqlconnector://{user}:{password}@{host}:{port}/{database}'
)

# API 정보
API_KEY = f''
BASE_URL = 'http://apis.data.go.kr/B552061/roadDgdgrHighway/getRestRoadDgdgrHighway'
frwyNm = '경부고속도로'  # 고속도로명
vhctyCd = '01'  # 승용차
dataType = 'json'  # 데이터 타입
numOfRows = '100'  # 검색 건수
pageNo = '1'  # 페이지 번호


def fetch_road_risk_data(API_KEY, frwyNm, frwySctnNm, vhctyCd, dataType, numOfRows, pageNo):
    requestUrl = (
        f'http://apis.data.go.kr/B552061/roadDgdgrHighway/getRestRoadDgdgrHighway?serviceKey={API_KEY}&frwyNm={frwyNm}&frwySctnNm={frwySctnNm}&vhctyCd={vhctyCd}&type={dataType}&numOfRows={numOfRows}&pageNo={pageNo}'
    )
    logging.info(f"API 요청: {requestUrl}")
    response = requests.get(requestUrl)
    print(response.text)
    if response.status_code != 200:
        logging.error(f"API 요청 실패: {e}")
        print(f"API 요청 실패: {response.status_code}, 내용: {response.text}")
        return []

    try:
        print(response.text)
        data = response.json()
        items = data.get('items', {}).get('item', [])
        result = []
        for item in items:
            line_string = item.get('line_string')
            highwayName = frwyNm.strip()
            segmentName = frwySctnNm.strip()

            if not line_string:
                # line_string 없으면 건너뛰기
                continue

            coords = line_string.replace('(', '').replace(')', '').split(', ')
            start_lng, start_lat = map(float, coords[0].split())
            end_lng, end_lat = map(float, coords[1].split())

            result.append({
                'idx': item.get('index'),
                'highwayName': highwayName,
                'segmentName': segmentName,
                'start_lat': start_lat,
                'start_lng': start_lng,
                'end_lat': end_lat,
                'end_lng': end_lng,
                'anals_value': float(item.get('anals_value', 0)),
                'anals_grd': item.get('anals_grd'),
                'updated_at': datetime.now(timezone.utc)
            })

        return result

    except Exception as e:
        print(f"데이터 파싱 실패: {e}")
        return []


def save_to_db(data):
    if not data:
        print("저장할 데이터가 없습니다.")
        return

    df = pd.DataFrame(data)

    try:
        df.to_sql('road_risk_data', con=engine, if_exists='replace', index=False)
        print(f"{len(df)}건 저장 완료")
    except Exception as e:
        print(f"DB 저장 실패: {e}")


def main():
    segments = [
        '서초IC-반포IC', '서초IC-서초IC', '서초IC-양재IC',
        '수원신갈IC-기흥IC', '수원신갈IC-수원신갈IC', '수원신갈IC-신갈JC',
        '신갈JC-수원신갈IC', '신갈JC-신갈JC', '신갈JC-판교IC',
        '신양재IC-금토JC', '신양재IC-양재IC'
    ]

    all_data = []
    for segment in segments:
        data = fetch_road_risk_data(API_KEY, frwyNm, segment, vhctyCd, dataType, numOfRows, pageNo)
        if data:
            all_data.extend(data)

    save_to_db(all_data)
    logging.info("크롤링 작업 종료")


if __name__ == '__main__':
    main()

